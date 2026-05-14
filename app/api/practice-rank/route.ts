import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Complexity ranking map: lower number = better complexity.
 * Used to score how optimal a user's solution is.
 */
const COMPLEXITY_RANK: Record<string, number> = {
  'O(1)': 1,
  'O(log n)': 2,
  'O(n)': 3,
  'O(n log n)': 4,
  'O(n²)': 5,
  'O(n³)': 6,
  'O(2^n)': 7,
  'O(n!)': 8,
};

function getComplexityScore(complexity: string): number {
  return COMPLEXITY_RANK[complexity] ?? 5; // default mid-tier
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      questionId,
      executionTimeMs,
      timeComplexity,
      spaceComplexity,
    } = body as {
      questionId: number;
      executionTimeMs: number;
      timeComplexity: string;
      spaceComplexity: string;
    };

    if (!questionId) {
      return NextResponse.json({ error: 'questionId is required' }, { status: 400 });
    }

    // 1. Get the question's optimal complexities
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        optimalTimeComplexity: true,
        optimalSpaceComplexity: true,
      },
    });

    const optimalTime = question?.optimalTimeComplexity || 'O(n)';
    const optimalSpace = question?.optimalSpaceComplexity || 'O(1)';

    // 2. Get all successful submissions for this question
    const allSubmissions = await prisma.submission.findMany({
      where: {
        questionId,
        allTestsPassed: true,
      },
      select: {
        executionTimeMs: true,
        timeComplexity: true,
        spaceComplexity: true,
      },
      orderBy: { executionTimeMs: 'asc' },
    });

    const totalSubmissions = allSubmissions.length;

    // 3. Score the current user's solution
    //    Score = weighted combination of:
    //      - Time complexity match (40%)
    //      - Space complexity match (20%)
    //      - Execution speed (40%)

    const userTimeRank = getComplexityScore(timeComplexity);
    const optimalTimeRank = getComplexityScore(optimalTime);
    const userSpaceRank = getComplexityScore(spaceComplexity);
    const optimalSpaceRank = getComplexityScore(optimalSpace);

    // Time complexity score: 100 if matches or better, decreasing for worse
    const timeComplexityScore = Math.max(0, 100 - (userTimeRank - optimalTimeRank) * 25);
    // Space complexity score: same logic
    const spaceComplexityScore = Math.max(0, 100 - (userSpaceRank - optimalSpaceRank) * 25);

    // 4. Calculate how many existing submissions this user beat in execution speed
    let fasterThanCount = 0;
    if (totalSubmissions > 0) {
      fasterThanCount = allSubmissions.filter(
        (s) => s.executionTimeMs > executionTimeMs
      ).length;
    }

    // 5. Calculate how many had worse complexity
    let betterComplexityThanCount = 0;
    if (totalSubmissions > 0) {
      betterComplexityThanCount = allSubmissions.filter((s) => {
        const sTimeRank = getComplexityScore(s.timeComplexity);
        const sSpaceRank = getComplexityScore(s.spaceComplexity);
        return userTimeRank < sTimeRank || (userTimeRank === sTimeRank && userSpaceRank < sSpaceRank);
      }).length;
    }

    // 6. Composite percentile calculation
    let beatenPercentage: number;

    if (totalSubmissions === 0) {
      // First submission ever — base score on complexity match
      const compositeScore = (timeComplexityScore * 0.5) + (spaceComplexityScore * 0.3);
      // Scale from 50-95% range for first submissions
      beatenPercentage = Math.round(50 + (compositeScore / 100) * 45);
    } else {
      // Speed percentile (what % of submissions were slower)
      const speedPercentile = (fasterThanCount / totalSubmissions) * 100;
      // Complexity percentile (what % had worse complexity)
      const complexityPercentile = (betterComplexityThanCount / totalSubmissions) * 100;

      // Weighted final: 40% speed + 35% time complexity + 25% space complexity
      beatenPercentage = Math.round(
        speedPercentile * 0.40 +
        complexityPercentile * 0.35 +
        (timeComplexityScore * 0.15) +
        (spaceComplexityScore * 0.10)
      );
    }

    // Clamp between 1 and 99
    beatenPercentage = Math.max(1, Math.min(99, beatenPercentage));

    // Is complexity optimal?
    const isOptimalTime = userTimeRank <= optimalTimeRank;
    const isOptimalSpace = userSpaceRank <= optimalSpaceRank;

    return NextResponse.json({
      success: true,
      beaten: beatenPercentage,
      totalSubmissions,
      fasterThan: fasterThanCount,
      betterComplexityThan: betterComplexityThanCount,
      isOptimalTime,
      isOptimalSpace,
      optimalTimeComplexity: optimalTime,
      optimalSpaceComplexity: optimalSpace,
    });
  } catch (err) {
    console.error('[practice-rank] Error:', err);
    return NextResponse.json(
      { error: 'Failed to calculate rank', message: err instanceof Error ? err.message : 'Unknown' },
      { status: 500 }
    );
  }
}
