// API route to check AI availability status

import { NextResponse } from "next/server";

export async function GET() {
  // Check if AI is configured
  // In a real implementation, this would check for API keys and service availability
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

  return NextResponse.json({
    available: hasOpenAIKey,
    message: hasOpenAIKey
      ? "AI generation is available"
      : "AI generation is not configured. Add OPENAI_API_KEY to enable.",
  });
}
