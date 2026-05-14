import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { code, language, questionTitle, questionDescription } = body;

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      );
    }

    // Call Gemini API to analyze code
    const geminiKey = process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY;
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert coding assistant and technical interviewer. Analyze the following ${language} code provided by the user for the problem "${questionTitle}". 
            
            Problem Description:
            ${questionDescription}

            User's Code:
            \`\`\`${language}
            ${code}
            \`\`\`

            Provide a clear, encouraging, and constructive analysis of their code. Cover the following:
            1. What they did well.
            2. The time and space complexity of their approach.
            3. Any bugs, edge cases missed, or inefficiencies.
            4. Hints on how to optimize or improve the code (do not give the full solution, just guide them).
            
            Keep the tone conversational but professional. Format your response in Markdown.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      }),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error('Gemini API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to analyze code with AI' },
        { status: 500 }
      );
    }

    const geminiData = await geminiResponse.json();
    const generatedContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedContent) {
      return NextResponse.json(
        { error: 'No content generated' },
        { status: 500 }
      );
    }

    return NextResponse.json({ analysis: generatedContent });
  } catch (error: unknown) {
    console.error('Error analyzing code:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}
