'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Editor from '@monaco-editor/react';
import {
    ArrowLeft,
    Play,
    CheckCircle2,
    Sparkles,
    Trophy,
    Lightbulb,
    Code2,
    Zap,
    ChevronRight,
    MessageCircle,
    BarChart,
    X,
    Terminal,
    Beaker,
    Bot,
    Share2,
    Facebook,
    Twitter,
    Instagram,
    Link as LinkIcon
} from 'lucide-react';
import { getPracticeQuestion } from '@/app/actions/practice';
import { submitCode } from '@/app/actions/submission';
import { useLingoContext } from '@lingo.dev/compiler/react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

interface PracticeArenaProps {
    questionId: number;
    pathId?: string;
    onBack: () => void;
    onComplete?: () => void;
}

const MOTIVATIONAL_QUOTES = [
    "The best way to predict the future is to create it.",
    "Code is like humor. When you have to explain it, it’s bad.",
    "Optimization is the difference between it working and it working perfectly.",
    "Great things never come from comfort zones.",
    "Small improvements in performance lead to massive gains in scale.",
    "Efficiency is doing things right; effectiveness is doing the right things."
];

export function PracticeArena({ questionId, pathId, onBack, onComplete }: PracticeArenaProps) {
    const { data: session } = useSession();
    const [question, setQuestion] = useState<any>(null);
    const [code, setCode] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const [executing, setExecuting] = useState(false);
    const [testResults, setTestResults] = useState<any>(null);
    const [activeResultTab, setActiveResultTab] = useState<string>('problem');
    const [showSolution, setShowSolution] = useState(false);
    const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
    const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
    const [showCompletion, setShowCompletion] = useState(false);
    const [completionData, setCompletionData] = useState<any>(null);
    const [quote] = useState(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
    const { locale } = useLingoContext();

    const handleShare = (platform: string) => {
        const url = `${window.location.origin}/dashboard?tab=practice&questionId=${questionId}`;
        const text = `I just solved "${question?.title}" on Optimize Coder! Can you beat my time?`;

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

    useEffect(() => {
        const fetchQuestion = async () => {
            setLoading(true);
            try {
                const result = await getPracticeQuestion(questionId, locale);
                if (result.success && result.question) {
                    setQuestion(result.question);
                    // Set default code template based on the language (simplified)
                    setCode(`function solution() {\n  // Write your optimized code here\n  \n}`);
                } else {
                    console.error('Question response error:', result.error);
                }
            } catch (error) {
                console.error('Error fetching question:', error);
                toast.error('Failed to load question');
            } finally {
                setLoading(false);
            }
        };
        fetchQuestion();
    }, [questionId]);

    const handleRunCode = async () => {
        if (!question?.testCases || question.testCases.length === 0) {
            toast.error('No test cases defined for this challenge. Please contact an admin.');
            return;
        }

        const defaultTemplate = `function solution() {\n  // Write your optimized code here\n  \n}`;
        if (!code || code.trim() === '' || code.trim() === defaultTemplate.trim()) {
            toast.error('Write some code first!');
            return;
        }

        setExecuting(true);
        setActiveResultTab('results');
        try {
            // Normalize testCase fields so both 'output' and 'expectedOutput' work
            const normalizedCases = question.testCases.map((tc: any) => ({
                input: String(tc.input ?? ''),
                expectedOutput: String(tc.expectedOutput ?? tc.output ?? ''),
            }));

            const response = await fetch('/api/execute-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language: 'javascript', testCases: normalizedCases })
            });

            const result = await response.json();
            if (response.ok) {
                setTestResults(result);
                if (result.allPassed) {
                    confetti({ particleCount: 180, spread: 80, origin: { y: 0.6 }, colors: ['#9333ea', '#db2777', '#f97316'] });
                    toast.success('🎉 All test cases passed!');
                    handleSaveSubmission(true, result);

                    // Fetch real ranking from database
                    let beaten = 70; // fallback
                    let totalSubmissions = 0;
                    let fasterThan = 0;
                    let betterComplexityThan = 0;
                    let isOptimalTime = false;
                    let isOptimalSpace = false;
                    let optTime = question?.optimalTimeComplexity || 'O(n)';
                    let optSpace = question?.optimalSpaceComplexity || 'O(1)';
                    try {
                        const rankRes = await fetch('/api/practice-rank', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                questionId,
                                executionTimeMs: result.totalTime,
                                timeComplexity: result.timeComplexity,
                                spaceComplexity: result.spaceComplexity,
                            }),
                        });
                        const rankData = await rankRes.json();
                        if (rankData.success) {
                            beaten = rankData.beaten;
                            totalSubmissions = rankData.totalSubmissions;
                            fasterThan = rankData.fasterThan;
                            betterComplexityThan = rankData.betterComplexityThan;
                            isOptimalTime = rankData.isOptimalTime;
                            isOptimalSpace = rankData.isOptimalSpace;
                            optTime = rankData.optimalTimeComplexity || optTime;
                            optSpace = rankData.optimalSpaceComplexity || optSpace;
                        }
                    } catch (e) { console.error('Rank fetch failed:', e); }

                    setCompletionData({
                        timeComplexity: result.timeComplexity,
                        spaceComplexity: result.spaceComplexity,
                        totalTime: result.totalTime,
                        beaten,
                        totalSubmissions,
                        fasterThan,
                        betterComplexityThan,
                        isOptimalTime,
                        isOptimalSpace,
                        optimalTimeComplexity: optTime,
                        optimalSpaceComplexity: optSpace,
                        passedCount: result.passedCount,
                        totalCount: result.totalCount,
                    });
                    setTimeout(() => setShowCompletion(true), 800);
                } else {
                    toast.error(`${result.failedCount ?? (result.totalCount - result.passedCount)} test case(s) failed`);
                }
            } else {
                toast.error(result.error || 'Execution failed');
            }
        } catch (error) {
            console.error('Run code error:', error);
            toast.error('Failed to execute code. Check your code syntax.');
        } finally {
            setExecuting(false);
        }
    };

    const handleSaveSubmission = async (allPassed: boolean, complexity: any) => {
        if (!session?.user?.id) return;

        await submitCode({
            userId: session.user.id,
            competitionId: 0, // 0 or null for practice
            questionId: questionId,
            code,
            language: 'javascript',
            timeComplexity: complexity?.timeComplexity || 'Unknown',
            spaceComplexity: complexity?.spaceComplexity || 'Unknown',
            allTestsPassed: allPassed,
            executionTimeMs: testResults?.totalTime || 0
        });
    };

    const handleSubmit = async () => {
        const defaultTemplate = `function solution() {\n  // Write your optimized code here\n  \n}`;
        if (!code || code.trim() === '' || code.trim() === defaultTemplate.trim()) {
            setIsAiPanelOpen(true);
            setAiAnalysisResult("**faahhh write code bitch**");
            return;
        }

        setSubmitting(true);
        setIsAiPanelOpen(true);
        setAiAnalysisResult("Analyzing your code with AI...");
        try {
            const response = await fetch('/api/analyze-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code,
                    language: 'typescript',
                    questionTitle: question?.title,
                    questionDescription: question?.description
                })
            });
            const result = await response.json();

            if (result.analysis) {
                setAiAnalysisResult(result.analysis);
            } else {
                setAiAnalysisResult("Failed to analyze code: " + (result.error || "Unknown error"));
            }
        } catch (error) {
            setAiAnalysisResult("Failed to connect to AI analysis service.");
            toast.error('Failed to analyze code');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Card className="p-8 text-center max-w-md border-dashed border-white/20 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-2xl">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold">Question Not Found</h3>
                    <p className="text-muted-foreground mt-2">The practice challenge you're looking for could not be loaded. It might have been removed or moved.</p>
                    <div className="flex flex-col gap-2 mt-6">
                        <Button onClick={onBack} className="bg-gradient-to-r from-purple-600 to-pink-600">
                            Back to Selection
                        </Button>
                        <p className="text-[10px] text-muted-foreground italic">Try running the optimal seed script if you're an admin.</p>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 bg-white/50 dark:bg-gray-900/50 p-4 rounded-xl backdrop-blur-sm border border-white/20">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            {question.title}
                            <Badge variant={
                                question.difficulty === 'Easy' ? 'secondary' :
                                    question.difficulty === 'Medium' ? 'default' : 'destructive'
                            }>
                                {question.difficulty}
                            </Badge>
                        </h1>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Code2 className="h-4 w-4" />
                            Optimization Challenge
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={handleRunCode}
                        disabled={executing || submitting}
                        className="border-blue-200 dark:border-blue-800 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                        {executing ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        ) : (
                            <Beaker className="h-4 w-4 mr-2" />
                        )}
                        Run Code
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            const newShow = !showSolution;
                            setShowSolution(newShow);
                            if (newShow) {
                                setActiveResultTab('problem');
                                if (!question?.canonicalSolution) {
                                    toast.info('Optimal solution is not available for this challenge yet.');
                                }
                            }
                        }}
                        className="border-purple-200 dark:border-purple-800"
                    >
                        <Lightbulb className="h-4 w-4 mr-2 text-yellow-500" />
                        {showSolution ? 'Hide Solution' : 'Reveal Solution'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
                {/* Left Side: Question & Analysis */}
                <div className="flex flex-col gap-4 min-h-0 overflow-auto">
                    <Card className="flex-1 min-h-0 overflow-auto border-white/20 shadow-xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl">
                        <Tabs value={activeResultTab} onValueChange={setActiveResultTab} className="flex flex-col h-full min-h-0">
                            <div className="px-4 pt-2 border-b border-white/20">
                                <TabsList className="bg-transparent gap-2">
                                    <TabsTrigger value="problem" className="data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/30">
                                        Problem Description
                                    </TabsTrigger>
                                    <TabsTrigger value="results" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/30">
                                        Test Results
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <ScrollArea className="flex-1 p-6">
                                <TabsContent value="problem" className="mt-0 space-y-6">
                                    <div>
                                        <h3 className="font-bold mb-2">The Task</h3>
                                        <div className="prose dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                                            {question.description}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-bold mb-2">Constraints</h3>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                            {(question.constraints || '').split('\n').filter(Boolean).map((c: string, i: number) => (
                                                <li key={i}>{c}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    {showSolution && (
                                        <div className="animate-in slide-in-from-top-4">
                                            <h3 className="font-bold mb-2 text-purple-600 flex items-center gap-2">
                                                <Sparkles className="h-4 w-4" />
                                                The Optimal Approach
                                            </h3>
                                            {question.canonicalSolution ? (
                                                <>
                                                    <div className="p-4 rounded-lg bg-gray-900 text-white font-mono text-xs whitespace-pre">
                                                        {question.canonicalSolution}
                                                    </div>
                                                    <div className="mt-2 text-xs text-muted-foreground italic">
                                                        Goal: {question.optimalTimeComplexity} Time | {question.optimalSpaceComplexity} Space
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="p-8 border-2 border-dashed border-purple-200 dark:border-purple-800 rounded-xl text-center">
                                                    <Bot className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                                                    <p className="text-sm text-muted-foreground italic">
                                                        The optimal solution for this challenge hasn't been verified by our AI architects yet.
                                                        Check back soon or try to find it yourself!
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="results" className="mt-0 space-y-6 px-1">
                                    {!testResults ? (
                                        <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-4">
                                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                                <Beaker className="h-8 w-8 text-blue-600" />
                                            </div>
                                            <h3 className="text-xl font-bold">No Results Yet</h3>
                                            <p className="text-muted-foreground">Click 'Run Code' to see how your solution performs against our test cases.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6 animate-in slide-in-from-right-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={testResults.allPassed ? 'default' : 'destructive'} className={cn(testResults.allPassed && "bg-green-500")}>
                                                        {testResults.allPassed ? 'Accepted' : 'Failed'}
                                                    </Badge>
                                                    <span className="text-sm font-medium">
                                                        {testResults.passedCount}/{testResults.totalCount} Test Cases Passed
                                                    </span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    Runtime: {testResults.totalTime}ms
                                                </span>
                                            </div>

                                            <div className="space-y-4 pb-20">
                                                {testResults.results.map((result: any, idx: number) => (
                                                    <Card key={idx} className={cn(
                                                        "border-l-4",
                                                        result.passed ? "border-l-green-500 bg-green-50/10" : "border-l-red-500 bg-red-50/10"
                                                    )}>
                                                        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-sm">Test Case {idx + 1}</span>
                                                                {result.passed ? (
                                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                                ) : (
                                                                    <X className="h-4 w-4 text-red-500" />
                                                                )}
                                                            </div>
                                                            <span className="text-[10px] text-muted-foreground">{result.time}ms</span>
                                                        </CardHeader>
                                                        <CardContent className="py-3 px-4 border-t border-white/10 space-y-3">
                                                            <div className="grid grid-cols-1 gap-2">
                                                                <div className="space-y-1">
                                                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Input</p>
                                                                    <pre className="p-2 bg-black/20 rounded text-xs font-mono whitespace-pre-wrap break-all">{JSON.stringify(result.input)}</pre>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="space-y-1">
                                                                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Output</p>
                                                                        <pre className={cn(
                                                                            "p-2 bg-black/20 rounded text-xs font-mono min-h-[40px] overflow-x-auto whitespace-pre-wrap break-all",
                                                                            result.passed ? "text-green-500" : "text-red-500"
                                                                        )}>
                                                                            {result.actual || (result.error ? "No output" : "Empty output")}
                                                                        </pre>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Expected</p>
                                                                        <pre className="p-2 bg-black/20 rounded text-xs font-mono text-gray-400 min-h-[40px] overflow-x-auto whitespace-pre-wrap break-all">
                                                                            {result.expected}
                                                                        </pre>
                                                                    </div>
                                                                </div>
                                                                {result.error && (
                                                                    <div className="p-2 bg-red-500/10 rounded border border-red-500/20 text-xs text-red-500 font-mono mt-2">
                                                                        {result.error}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>


                            </ScrollArea>
                        </Tabs>
                    </Card>
                </div>

                {/* Right Side: Code Editor */}
                <Card className="overflow-hidden border-white/20 shadow-xl flex flex-col">
                    <div className="bg-gray-900 p-4 border-b border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <span className="text-xs text-gray-400 ml-4 font-mono">TypeScript Editor</span>
                        </div>
                        <Badge variant="outline" className="text-gray-400 border-gray-700 text-[10px]">Auto-saved</Badge>
                    </div>
                    <div className="flex-1 min-h-0 bg-[#1e1e1e]">
                        <Editor
                            height="100%"
                            defaultLanguage="typescript"
                            theme="vs-dark"
                            value={code}
                            onChange={(val) => setCode(val || '')}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                fontFamily: "'Fira Code', monospace",
                                fontLigatures: true,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                padding: { top: 20 },
                                cursorSmoothCaretAnimation: "on",
                                smoothScrolling: true
                            }}
                        />
                    </div>
                    {isAiPanelOpen && (
                        <div className="h-64 border-t border-gray-800 bg-gray-900 overflow-auto flex flex-col relative animate-in slide-in-from-bottom-4 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                            <div className="flex justify-between items-center p-3 border-b border-gray-800 bg-black/40">
                                <span className="text-sm font-semibold text-purple-400 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" /> AI Code Analysis
                                </span>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white" onClick={() => setIsAiPanelOpen(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <ScrollArea className="flex-1 p-5">
                                {submitting ? (
                                    <div className="flex flex-col items-center justify-center h-full space-y-4 text-purple-400 min-h-[150px]">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                                        <p className="animate-pulse text-sm font-medium">The AI is reviewing your code...</p>
                                    </div>
                                ) : (
                                    <div className="prose dark:prose-invert max-w-none text-sm text-gray-300 whitespace-pre-wrap">
                                        {aiAnalysisResult === "**faahhh write code bitch**" ? (
                                            <div className="flex flex-col items-center justify-center min-h-[150px] space-y-4 text-center">
                                                <X className="h-12 w-12 text-red-500" />
                                                <span className="font-black text-red-500 text-2xl uppercase tracking-widest leading-relaxed">
                                                    faahhh write code bitch
                                                </span>
                                            </div>
                                        ) : (
                                            aiAnalysisResult
                                        )}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    )}
                    <div className="bg-gray-900 p-4 border-t border-gray-800 flex items-center justify-between shrink-0">
                        <span className="text-xs text-gray-400">Run your code first to verify against test cases.</span>
                        <Button
                            onClick={handleSubmit}
                            disabled={submitting || executing}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/20"
                        >
                            {submitting ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                                <Play className="h-4 w-4 mr-2" />
                            )}
                            Run Analysis
                        </Button>
                    </div>
                </Card>
            </div>


            {/* ── Completion Overlay ── */}
            {showCompletion && completionData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-purple-300 dark:border-purple-700 max-w-lg w-full mx-4 overflow-hidden">
                        {/* Top gradient bar */}
                        <div className="h-2 w-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400" />

                        {/* Close Button */}
                        <button
                            onClick={() => setShowCompletion(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="p-8 space-y-6">
                            {/* Header */}
                            <div className="text-center space-y-2">
                                <Trophy className="h-14 w-14 text-yellow-400 mx-auto animate-bounce" />
                                <h2 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    Challenge Complete!
                                </h2>
                                <p className="text-muted-foreground text-sm">
                                    {completionData.passedCount}/{completionData.totalCount} test cases passed
                                </p>
                            </div>

                            {/* Stats grid */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 p-4 text-center">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Time</p>
                                    <p className={cn("text-xl font-black", completionData.isOptimalTime ? "text-green-500" : "text-purple-600")}>{completionData.timeComplexity}</p>
                                    {completionData.isOptimalTime && <p className="text-[9px] text-green-500 font-bold mt-1">✓ Optimal</p>}
                                    {!completionData.isOptimalTime && <p className="text-[9px] text-muted-foreground mt-1">Goal: {completionData.optimalTimeComplexity}</p>}
                                </div>
                                <div className="rounded-2xl bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-700 p-4 text-center">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Space</p>
                                    <p className={cn("text-xl font-black", completionData.isOptimalSpace ? "text-green-500" : "text-pink-600")}>{completionData.spaceComplexity}</p>
                                    {completionData.isOptimalSpace && <p className="text-[9px] text-green-500 font-bold mt-1">✓ Optimal</p>}
                                    {!completionData.isOptimalSpace && <p className="text-[9px] text-muted-foreground mt-1">Goal: {completionData.optimalSpaceComplexity}</p>}
                                </div>
                                <div className="rounded-2xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 p-4 text-center">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Runtime</p>
                                    <p className="text-xl font-black text-orange-600">{completionData.totalTime}ms</p>
                                    <p className="text-[9px] text-muted-foreground mt-1">{completionData.totalSubmissions} total submissions</p>
                                </div>
                            </div>

                            {/* Detailed ranking breakdown */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 p-3 text-center">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Faster Than</p>
                                    <p className="text-lg font-black text-blue-600">{completionData.fasterThan} <span className="text-xs font-medium text-muted-foreground">users</span></p>
                                </div>
                                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 p-3 text-center">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Better Complexity</p>
                                    <p className="text-lg font-black text-emerald-600">{completionData.betterComplexityThan} <span className="text-xs font-medium text-muted-foreground">users</span></p>
                                </div>
                            </div>

                            {/* Leaderboard bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-semibold">
                                    <span className="flex items-center gap-1"><Zap className="h-4 w-4 text-yellow-500" /> You surpassed</span>
                                    <span className="text-green-600 font-black text-lg">{completionData.beaten}% of users</span>
                                </div>
                                <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-green-500 transition-all duration-1000"
                                        style={{ width: `${completionData.beaten}%` }}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground text-center">
                                    Based on speed, time complexity, and space complexity vs {completionData.totalSubmissions} submissions
                                </p>
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-col gap-3">
                                {pathId && onComplete && (
                                    <Button
                                        onClick={() => { setShowCompletion(false); onComplete(); }}
                                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-base py-6"
                                    >
                                        <ChevronRight className="mr-2 h-5 w-5" /> Next Challenge
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={() => { setShowCompletion(false); setCode(`function solution() {\n  // Optimise further...\n  \n}`); setTestResults(null); }}
                                    className="w-full border-purple-300 dark:border-purple-700 font-semibold"
                                >
                                    <Zap className="mr-2 h-4 w-4 text-purple-500" /> Try More Optimised Version
                                </Button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full border-blue-300 dark:border-blue-700 font-semibold text-blue-600 dark:text-blue-400">
                                            <Share2 className="mr-2 h-4 w-4" /> Share Challenge
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="center" className="w-56 bg-white dark:bg-gray-900 border-purple-200 dark:border-purple-800">
                                        <DropdownMenuItem onClick={() => handleShare('x')} className="cursor-pointer">
                                            <Twitter className="mr-2 h-4 w-4" /> Share on X
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleShare('facebook')} className="cursor-pointer">
                                            <Facebook className="mr-2 h-4 w-4" /> Share on Facebook
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleShare('whatsapp')} className="cursor-pointer">
                                            <MessageCircle className="mr-2 h-4 w-4" /> Share on WhatsApp
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleShare('instagram')} className="cursor-pointer">
                                            <Instagram className="mr-2 h-4 w-4" /> Share to Instagram
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleShare('copy')} className="cursor-pointer">
                                            <LinkIcon className="mr-2 h-4 w-4" /> Copy Link
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <Button variant="ghost" onClick={() => { setShowCompletion(false); onBack(); }} className="w-full text-muted-foreground">
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Problem List
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

