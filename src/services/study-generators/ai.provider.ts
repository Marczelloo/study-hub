// AI-based study material generator (uses server-side API)

import type { StudyGenerationProvider, GenerationRequest, GenerationResult, GeneratedFlashcard } from "./types";

export const aiProvider: StudyGenerationProvider = {
  type: "ai",
  name: "AI Generator",

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch("/api/study/status", {
        method: "GET",
      });
      if (!response.ok) return false;
      const data = await response.json();
      return data.available === true;
    } catch {
      return false;
    }
  },

  async generate(request: GenerationRequest): Promise<GenerationResult> {
    const {
      notes,
      subjectId,
      title,
      mode,
      maxFlashcards = 10,
      maxQuizQuestions = 5,
      questionTypes = ["mcq", "truefalse", "short"],
    } = request;

    try {
      const response = await fetch("/api/study/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notes: notes.map((n) => ({
            id: n.id,
            title: n.title,
            content: n.content,
          })),
          subjectId,
          title,
          mode,
          maxFlashcards,
          maxQuizQuestions,
          questionTypes,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "AI generation failed");
      }

      const result = await response.json();

      // Transform flashcards to flashcard set
      const flashcards: GeneratedFlashcard[] = (result.flashcards || []).map((card: Record<string, unknown>) => ({
        question: String(card.question || ""),
        answer: String(card.answer || ""),
        learned: false,
      }));

      return {
        flashcardSet:
          flashcards.length > 0
            ? {
                set: {
                  title: title || `AI Flashcards from ${notes.length} notes`,
                  subjectId,
                  noteIds: notes.map((n) => n.id),
                  source: "generated" as const,
                },
                cards: flashcards,
              }
            : null,
        quiz: result.quiz
          ? {
              subjectId,
              noteIds: notes.map((n) => n.id),
              title: String(result.quiz.title || title || `AI Quiz from ${notes.length} notes`),
              questions: (result.quiz.questions || []).map((q: Record<string, unknown>) => ({
                id: String(q.id || crypto.randomUUID()),
                type: q.type as "mcq" | "truefalse" | "short",
                prompt: String(q.prompt || ""),
                options: Array.isArray(q.options) ? q.options : undefined,
                correctAnswer: String(q.correctAnswer || ""),
                explanation: q.explanation ? String(q.explanation) : undefined,
              })),
              source: "generated" as const,
            }
          : null,
        warnings: result.warnings,
      };
    } catch (error) {
      console.error("AI generation error:", error);
      throw error;
    }
  },
};
