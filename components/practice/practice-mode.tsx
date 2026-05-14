'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  Code2,
  GraduationCap,
  Lightbulb,
  Target,
  Flame,
  Trophy,
  Bell,
  Moon,
  Search,
  Filter,
  Bookmark,
  Share2,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Facebook,
  Twitter,
  Instagram,
  MessageCircle,
  Link as LinkIcon
} from 'lucide-react';

import {
  getLearningPaths,
  getPracticeQuestions,
  getRandomQuestion,
} from '@/app/actions/practice';

import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PracticeModeProps {
  onStartPractice: (questionId: bigint) => void;
  onStartPath: (path: any) => void;
}

export function PracticeMode({
  onStartPractice,
  onStartPath,
}: PracticeModeProps) {
  const { data: session } = useSession();

  const [learningPaths, setLearningPaths] = useState<any[]>([]);
  const [practiceQuestions, setPracticeQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [showAI, setShowAI] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [aiMessage, setAiMessage] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiChatHistory, aiLoading]);

  // Reset chat when question changes
  useEffect(() => {
    setAiChatHistory([]);
  }, [selectedQuestion?.id]);

  const handleSendAiMessage = useCallback(async () => {
    if (!aiMessage.trim() || aiLoading || !selectedQuestion) return;
    const userMsg = aiMessage.trim();
    setAiMessage('');
    setAiChatHistory((prev) => [...prev, { role: 'user', text: userMsg }]);
    setAiLoading(true);
    try {
      const res = await fetch('/api/practice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          questionContext: {
            title: selectedQuestion.title,
            description: selectedQuestion.description,
            difficulty: selectedQuestion.difficulty,
            constraints: selectedQuestion.constraints,
            tags: selectedQuestion.tags,
            testCases: selectedQuestion.testCases?.slice(0, 3),
          },
          conversationHistory: aiChatHistory,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setAiChatHistory((prev) => [...prev, { role: 'model', text: data.reply }]);
      } else {
        setAiChatHistory((prev) => [...prev, { role: 'model', text: 'Sorry, I could not generate a response. Please try again.' }]);
      }
    } catch {
      setAiChatHistory((prev) => [...prev, { role: 'model', text: 'Connection error. Please check your network and try again.' }]);
    } finally {
      setAiLoading(false);
    }
  }, [aiMessage, aiLoading, selectedQuestion, aiChatHistory]);
  const [randomLoading, setRandomLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pathsRes, practiceRes] = await Promise.all([
          getLearningPaths(session?.user?.id),
          getPracticeQuestions(),
        ]);

        if (pathsRes.success && pathsRes.learningPaths) {
          setLearningPaths(pathsRes.learningPaths);
        }

        if (practiceRes.success && practiceRes.questions) {
          setPracticeQuestions(practiceRes.questions);
          if (practiceRes.questions.length > 0) {
            setSelectedQuestion(practiceRes.questions[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch practice data:', error);
        toast.error('Failed to load practice questions');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session?.user?.id]);

  const handleShare = (platform: string, question: any) => {
    if (!question) return;
    const url = `${window.location.origin}/dashboard?tab=practice&questionId=${question.id}`;
    const text = `Check out this coding challenge: "${question.title}" on Optimize Coder!`;

    switch (platform) {
      case 'x':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'instagram':
        navigator.clipboard.writeText(url);
        toast.success('Link copied! Paste it in your Instagram story or post.');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
        break;
    }
  };

  const categories = [
    { id: 'all', name: 'All Paths', icon: BookOpen },
    { id: 'arrays', name: 'Arrays', icon: Code2 },
    { id: 'dp', name: 'Dynamic Programming', icon: Lightbulb },
    { id: 'graphs', name: 'Graphs', icon: Target },
    { id: 'trees', name: 'Trees', icon: GraduationCap },
  ];

  const filteredPaths =
    selectedCategory === 'all'
      ? learningPaths
      : learningPaths.filter((path) => path.category === selectedCategory);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800"
          />
        ))}
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border-purple-200 dark:border-purple-800 bg-white dark:bg-[#07111f]">
      <CardHeader className="border-b border-purple-100 dark:border-purple-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-7 w-7 text-purple-500" />
            <div>
              <CardTitle className="text-3xl font-bold text-purple-600 dark:text-white">
                Practice Mode
              </CardTitle>
              <CardDescription>
                Master algorithms with structured learning paths
              </CardDescription>
            </div>
          </div>

          <div className="flex gap-8 text-sm">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-semibold">7</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-purple-500" />
              <div>
                <p className="font-semibold">120</p>
                <p className="text-xs text-muted-foreground">
                  Problems Solved
                </p>
              </div>
            </div>

            <Badge variant="outline">
              {learningPaths.filter((p) => p.completed).length}/
              {learningPaths.length} Completed
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs defaultValue="individual" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="individual">
              Individual Challenges
            </TabsTrigger>
            <TabsTrigger value="paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="random">Random Practice</TabsTrigger>
          </TabsList>

          {/* INDIVIDUAL */}
          <TabsContent value="individual">
            {practiceQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-purple-200 dark:border-purple-800 p-16 text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <GraduationCap className="h-8 w-8 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">No Practice Questions Available</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    The admin hasn't activated any questions for practice yet, or none are scheduled to appear at this time.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-5 xl:grid-cols-[350px_1fr]">
                {/* LEFT: Problem List */}
                <Card className="border-purple-200 dark:border-purple-800 flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Problem List</CardTitle>
                    <div className="relative mt-2">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        placeholder="Search problems..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border bg-transparent py-2 pl-9 pr-3 text-sm outline-none focus:border-purple-400"
                      />
                    </div>
                    <div className="flex gap-1.5 flex-wrap mt-2">
                      {['All', 'Easy', 'Medium', 'Hard'].map((d) => (
                        <button
                          key={d}
                          onClick={() => setDifficultyFilter(d)}
                          className={cn(
                            'rounded-full px-3 py-0.5 text-xs font-semibold border transition-colors',
                            difficultyFilter === d
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'border-muted-foreground/30 text-muted-foreground hover:border-purple-400'
                          )}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto max-h-[560px] space-y-2 pr-1">
                    {practiceQuestions
                      .filter((q) =>
                        (difficultyFilter === 'All' || q.difficulty === difficultyFilter) &&
                        (searchQuery === '' || q.title.toLowerCase().includes(searchQuery.toLowerCase()))
                      )
                      .map((q) => (
                        <div
                          key={q.id}
                          onClick={() => setSelectedQuestion(q)}
                          className={cn(
                            'cursor-pointer rounded-xl border p-3 transition-all hover:border-purple-300 dark:hover:border-purple-600',
                            selectedQuestion?.id === q.id
                              ? 'border-purple-500 bg-purple-500/10'
                              : 'border-transparent bg-muted/30'
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{q.title}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground truncate">
                                {Array.isArray(q.tags) ? q.tags.slice(0, 3).join(', ') : ''}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[10px] shrink-0',
                                q.difficulty === 'Easy' && 'border-green-500 text-green-600',
                                q.difficulty === 'Medium' && 'border-yellow-500 text-yellow-600',
                                q.difficulty === 'Hard' && 'border-red-500 text-red-600'
                              )}
                            >
                              {q.difficulty}
                            </Badge>
                          </div>
                          {q.publishedAt && (
                            <p className="mt-1 text-[10px] text-muted-foreground">
                              Available since {new Date(q.publishedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ))}
                  </CardContent>
                  <div className="p-4 border-t">
                    <p className="text-xs text-center text-muted-foreground">
                      {practiceQuestions.length} question{practiceQuestions.length !== 1 ? 's' : ''} available
                    </p>
                  </div>
                </Card>

                {/* CENTER: Problem Description */}
                {selectedQuestion ? (
                  <Card className="border-purple-200 dark:border-purple-800">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Code2 className="h-5 w-5 text-purple-500 shrink-0" />
                          <CardTitle className="text-lg truncate">{selectedQuestion.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant="outline"
                            className={cn(
                              selectedQuestion.difficulty === 'Easy' && 'border-green-500 text-green-600',
                              selectedQuestion.difficulty === 'Medium' && 'border-yellow-500 text-yellow-600',
                              selectedQuestion.difficulty === 'Hard' && 'border-red-500 text-red-600'
                            )}
                          >
                            {selectedQuestion.difficulty}
                          </Badge>
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <Bookmark className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8">
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-900 border-purple-200 dark:border-purple-800">
                              <DropdownMenuItem onClick={() => handleShare('x', selectedQuestion)} className="cursor-pointer">
                                <Twitter className="mr-2 h-4 w-4" /> Share on X
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShare('facebook', selectedQuestion)} className="cursor-pointer">
                                <Facebook className="mr-2 h-4 w-4" /> Share on Facebook
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShare('whatsapp', selectedQuestion)} className="cursor-pointer">
                                <MessageCircle className="mr-2 h-4 w-4" /> Share on WhatsApp
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShare('instagram', selectedQuestion)} className="cursor-pointer">
                                <Instagram className="mr-2 h-4 w-4" /> Share to Instagram
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShare('copy', selectedQuestion)} className="cursor-pointer">
                                <LinkIcon className="mr-2 h-4 w-4" /> Copy Link
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5 overflow-y-auto max-h-[520px]">
                      <p className="text-sm leading-7 text-muted-foreground">
                        {selectedQuestion.description}
                      </p>
                      {selectedQuestion.constraints && (
                        <div className="rounded-xl border p-4 bg-muted/20 space-y-2">
                          <p className="font-semibold text-sm">Constraints:</p>
                          <ul className="space-y-1">
                            {String(selectedQuestion.constraints).split('\n').filter(Boolean).map((c: string, i: number) => (
                              <li key={i} className="text-sm text-muted-foreground flex gap-2">
                                <span className="text-purple-500">•</span> {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {Array.isArray(selectedQuestion.tags) && selectedQuestion.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedQuestion.tags.map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-3 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            toast.info('Hint: Think about using a hash map for O(n) solution!');
                          }}
                        >
                          <Lightbulb className="mr-2 h-4 w-4 text-yellow-500" />
                          Hint
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAI(true)}
                        >
                          <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
                          Discuss with AI
                        </Button>
                        <Button
                          className="bg-gradient-to-r from-purple-600 to-pink-600"
                          size="sm"
                          onClick={() => onStartPractice(BigInt(selectedQuestion.id))}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Start Practice
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="flex items-center justify-center border-dashed">
                    <div className="text-center text-muted-foreground p-8">
                      <Code2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p>Select a problem from the list</p>
                    </div>
                  </Card>
                )}

              </div>
            )}



            {/* AI Study Assistant Panel */}
            {showAI && (
              <div className="fixed bottom-6 right-6 w-[400px] h-[520px] z-50 rounded-2xl border border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-900 shadow-2xl shadow-purple-500/20 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 shrink-0">
                  <div className="flex items-center gap-2 text-white">
                    <Sparkles className="h-4 w-4" />
                    <span className="font-semibold text-sm">Study Assistant</span>
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-white/20 text-white border-0 font-bold">AI</Badge>
                  </div>
                  <button onClick={() => setShowAI(false)} className="text-white/80 hover:text-white text-lg leading-none">✕</button>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {/* Welcome message */}
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 p-3 text-sm max-w-[85%]">
                      👋 Hi! I'm your AI study assistant for <strong>{selectedQuestion?.title || 'this problem'}</strong>.
                      <br /><br />
                      Ask me for hints, approach ideas, or explanations. I'll guide you step by step! 🚀
                    </div>
                  </div>

                  {/* Conversation */}
                  {aiChatHistory.map((msg, i) => (
                    <div key={i} className={cn("flex gap-2", msg.role === 'user' ? 'justify-end' : '')}>
                      {msg.role === 'model' && (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                      <div className={cn(
                        "rounded-2xl p-3 text-sm max-w-[85%] whitespace-pre-wrap",
                        msg.role === 'user'
                          ? 'rounded-tr-sm bg-purple-600 text-white'
                          : 'rounded-tl-sm bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800'
                      )}>
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {/* Loading indicator */}
                  {aiLoading && (
                    <div className="flex gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="h-3.5 w-3.5 text-white animate-spin" />
                      </div>
                      <div className="rounded-2xl rounded-tl-sm bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 p-3 text-sm">
                        <span className="flex gap-1 items-center text-muted-foreground">
                          <span className="animate-pulse">●</span>
                          <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>●</span>
                          <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>●</span>
                          <span className="ml-1">Thinking...</span>
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Quick Actions */}
                {aiChatHistory.length === 0 && (
                  <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
                    {['Give me a hint', 'Explain the approach', 'What data structure to use?', 'Show me the solution'].map((q) => (
                      <button
                        key={q}
                        onClick={() => { setAiMessage(q); }}
                        className="text-[11px] px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div className="p-3 border-t border-purple-100 dark:border-purple-800 shrink-0">
                  <div className="flex gap-2">
                    <input
                      value={aiMessage}
                      onChange={(e) => setAiMessage(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSendAiMessage(); }}
                      placeholder={aiLoading ? 'Waiting for response...' : 'Ask about this problem...'}
                      disabled={aiLoading}
                      className="flex-1 rounded-xl border border-purple-200 dark:border-purple-700 bg-transparent px-3 py-2 text-sm outline-none focus:border-purple-400 disabled:opacity-50"
                    />
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 rounded-xl px-4"
                      onClick={handleSendAiMessage}
                      disabled={aiLoading || !aiMessage.trim()}
                    >
                      {aiLoading ? '...' : 'Send'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* PATHS */}
          <TabsContent value="paths">
            <div className="grid gap-4 md:grid-cols-2">
              {filteredPaths.map((path) => (
                <Card key={path.id}>
                  <CardHeader>
                    <CardTitle>{path.name}</CardTitle>
                  </CardHeader>

                  <CardContent>
                    <Button
                      className="w-full"
                      onClick={() => onStartPath(path)}
                    >
                      Continue Learning
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* RANDOM */}
          <TabsContent value="random">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardContent className="pt-10 pb-8 text-center space-y-6">
                <div>
                  <p className="text-5xl mb-3">🎲</p>
                  <h3 className="text-2xl font-bold">Random Practice</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Pick a difficulty and get a random admin-activated question
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
                  {['Easy', 'Medium', 'Hard'].map((diff) => (
                    <Button
                      key={diff}
                      variant="outline"
                      disabled={randomLoading === diff}
                      onClick={async () => {
                        setRandomLoading(diff);
                        try {
                          const res = await getRandomQuestion(diff);
                          if (res.success && res.question) {
                            onStartPractice(BigInt(res.question.id));
                          } else {
                            toast.error(res.error || `No ${diff} questions available right now`);
                          }
                        } finally {
                          setRandomLoading(null);
                        }
                      }}
                      className={cn(
                        'border-2 font-semibold',
                        diff === 'Easy' && 'border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20',
                        diff === 'Medium' && 'border-yellow-500 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20',
                        diff === 'Hard' && 'border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                      )}
                    >
                      {randomLoading === diff ? '...' : diff}
                    </Button>
                  ))}
                </div>
                {practiceQuestions.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">
                    No questions are currently activated for practice by the admin.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}