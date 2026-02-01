// Study generation types

import type { FlashcardSet, Flashcard, Quiz, QuizQuestion, Note } from "@/domain/types";

export type GenerationMode = "flashcards" | "quiz" | "both";

export interface GenerationRequest {
  notes: Note[];
  subjectId: string;
  title: string;
  mode: GenerationMode;
  // Optional configuration
  maxFlashcards?: number;
  maxQuizQuestions?: number;
  questionTypes?: QuizQuestion["type"][];
}

// Flashcard without setId (will be assigned when saving)
export type GeneratedFlashcard = Omit<Flashcard, "id" | "createdAt" | "updatedAt" | "setId">;

export interface GeneratedFlashcardSet {
  set: Omit<FlashcardSet, "id" | "createdAt" | "updatedAt">;
  cards: GeneratedFlashcard[];
}

export interface GenerationResult {
  flashcardSet: GeneratedFlashcardSet | null;
  quiz: Omit<Quiz, "id" | "createdAt" | "updatedAt"> | null;
  warnings?: string[];
}

export type GeneratorType = "ai" | "basic";

export interface StudyGenerationProvider {
  readonly type: GeneratorType;
  readonly name: string;
  generate(request: GenerationRequest): Promise<GenerationResult>;
  isAvailable(): Promise<boolean>;
}
