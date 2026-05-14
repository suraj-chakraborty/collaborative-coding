import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are an AI Study Assistant working inside Practice Mode.

Your job is to help the student understand ONLY the currently selected question.

STRICT RULES:
1. You must stay restricted to the current question, topic, and concepts related to it.
2. If the user asks anything unrelated to the current question, politely refuse and say: "I can only help with the current practice question and related concepts."
3. Never switch topics unless the question changes.
4. Do not provide unnecessary advanced explanations.
5. Use very simple and student-friendly language.

TEACHING STYLE:
1. First guide the student instead of directly giving the answer.
2. Explain step-by-step in a simple way.
3. After explanation, ask a small follow-up question to check understanding.
4. Encourage learning through interaction.
5. Keep responses short, clear, and focused.

LEARNING FLOW:
- Step 1: Understand what the student is confused about.
- Step 2: Explain the concept simply.
- Step 3: Give a tiny hint or mini-example.
- Step 4: Ask a small practice/check question.
- Step 5: Continue only based on the student's reply.

WHEN USER ASKS DIRECTLY FOR THE ANSWER:
If the student clearly asks things like "give me the answer", "show full solution", "I don't want hints", "just solve it":
1. Provide the complete solution.
2. Explain it in simple words.
3. Break solution into small understandable steps.
4. After solving, ask 1 very small similar practice question for reinforcement.

IMPORTANT BEHAVIOR:
- Never shame the student.
- Never say "this is easy".
- Be supportive and encouraging.
- Focus on understanding, not just solving.

RESPONSE FORMAT:
1. Short explanation
2. Small hint/example
3. One small check question

If user requests full solution:
1. Full answer
2. Simple explanation
3. One small practice question

Keep responses concise — ideally under 250 words. Use markdown for formatting.`;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { message, questionContext, conversationHistory } = body as {
      message: string;
      questionContext: {
        title: string;
        description: string;
        difficulty: string;
        constraints?: string;
        tags?: string[];
        testCases?: any[];
      };
      conversationHistory: { role: 'user' | 'model'; text: string }[];
    };

    if (!message || !questionContext) {
      return NextResponse.json(
        { error: 'message and questionContext are required' },
        { status: 400 }
      );
    }

    const geminiKey = process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!geminiKey) {
      return NextResponse.json(
        { error: 'AI API key not configured' },
        { status: 500 }
      );
    }

    // Build the context block for the current question
    const questionBlock = `
CURRENT QUESTION CONTEXT:
- Title: ${questionContext.title}
- Difficulty: ${questionContext.difficulty}
- Description: ${questionContext.description}
${questionContext.constraints ? `- Constraints: ${questionContext.constraints}` : ''}
${questionContext.tags?.length ? `- Topics: ${questionContext.tags.join(', ')}` : ''}
${questionContext.testCases?.length ? `- Example Test Cases:\n${questionContext.testCases.slice(0, 3).map((tc: any, i: number) => `  Case ${i + 1}: Input: ${tc.input} → Expected: ${tc.expectedOutput || tc.output}`).join('\n')}` : ''}
`;

    // Build conversation contents for Gemini
    const contents: any[] = [];

    // System instruction as the first user turn
    contents.push({
      role: 'user',
      parts: [{ text: `${SYSTEM_PROMPT}\n\n${questionBlock}\n\nYou are now ready. The student will ask you questions. Remember: ONLY help with this specific question.` }],
    });
    contents.push({
      role: 'model',
      parts: [{ text: `Got it! I'm ready to help you with "${questionContext.title}". What would you like to know? 😊` }],
    });

    // Add previous conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        });
      }
    }

    // Add the current message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error('[practice-chat] Gemini API error:', errorData);
      return NextResponse.json(
        { error: 'AI service unavailable' },
        { status: 500 }
      );
    }

    const data = await geminiResponse.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return NextResponse.json(
        { error: 'No response generated' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    console.error('[practice-chat] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
