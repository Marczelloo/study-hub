// API route for AI-powered study material generation

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Request validation schema
const GenerateRequestSchema = z.object({
  notes: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      content: z.string(),
    })
  ),
  subjectId: z.string(),
  mode: z.enum(["flashcards", "quiz", "both"]),
  maxFlashcards: z.number().min(1).max(50).optional().default(10),
  maxQuizQuestions: z.number().min(1).max(20).optional().default(5),
  questionTypes: z
    .array(z.enum(["mcq", "truefalse", "short"]))
    .optional()
    .default(["mcq", "truefalse", "short"]),
});

// Strip HTML and extract text
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = GenerateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request", details: parsed.error.issues }, { status: 400 });
    }

    const { notes, mode, maxFlashcards, maxQuizQuestions, questionTypes } = parsed.data;
    // subjectId is passed through but used client-side for association

    // Check if AI is configured
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!openaiKey) {
      return NextResponse.json(
        { error: "AI generation not configured. Add OPENAI_API_KEY environment variable." },
        { status: 503 }
      );
    }

    // Prepare content for AI
    const combinedContent = notes.map((n) => `# ${n.title}\n\n${stripHtml(n.content)}`).join("\n\n---\n\n");

    // Build the AI prompt
    const systemPrompt = `You are an educational assistant that creates study materials from notes. 
Generate high-quality flashcards and/or quiz questions that help students learn and retain information.
Always respond with valid JSON matching the expected schema.`;

    let userPrompt = `Based on the following notes, generate study materials:\n\n${combinedContent}\n\n`;

    if (mode === "flashcards" || mode === "both") {
      userPrompt += `Generate up to ${maxFlashcards} flashcards with clear question/answer pairs.\n`;
    }

    if (mode === "quiz" || mode === "both") {
      userPrompt += `Generate a quiz with up to ${maxQuizQuestions} questions. Include these types: ${questionTypes.join(", ")}.\n`;
    }

    userPrompt += `\nRespond with JSON in this format:
{
  "flashcards": [{"question": "...", "answer": "...", "tags": ["..."]}],
  "quiz": {
    "title": "...",
    "questions": [
      {"id": "...", "type": "mcq|truefalse|short", "prompt": "...", "options": ["..."], "correctAnswer": "...", "explanation": "..."}
    ]
  }
}`;

    // Call OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      console.error("OpenAI API error:", errorData);
      return NextResponse.json({ error: "AI generation failed", details: errorData }, { status: 500 });
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: "No content generated from AI" }, { status: 500 });
    }

    // Parse the AI response
    const generatedContent = JSON.parse(content);

    // Validate and sanitize the response
    const result = {
      flashcards: mode === "quiz" ? [] : (generatedContent.flashcards || []).slice(0, maxFlashcards),
      quiz: mode === "flashcards" ? null : generatedContent.quiz || null,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Study generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
