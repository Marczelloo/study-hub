// Study service - application logic for study module

import type { FlashcardSet, Flashcard, Quiz, QuizAttempt, Note, QuizQuestion } from "@/domain/types";
import {
  localFlashcardSetRepository,
  localFlashcardRepository,
  localQuizRepository,
  localQuizAttemptRepository,
} from "@/data/local";
import { getStudyGenerationProvider } from "./study-generators";
import type { GeneratorType, GenerationMode, GenerationResult, GeneratedFlashcardSet } from "./study-generators/types";
import { generateId } from "@/lib/ids";

// ============================================================================
// FLASHCARD SETS
// ============================================================================

export function listFlashcardSets(): FlashcardSet[] {
  return localFlashcardSetRepository.list();
}

export function getFlashcardSetById(id: string): FlashcardSet | null {
  return localFlashcardSetRepository.getById(id);
}

export function getFlashcardSetsBySubject(subjectId: string): FlashcardSet[] {
  return localFlashcardSetRepository.list().filter((s) => s.subjectId === subjectId);
}

export function createFlashcardSet(payload: Omit<FlashcardSet, "id" | "createdAt" | "updatedAt">): FlashcardSet {
  return localFlashcardSetRepository.create(payload);
}

export function updateFlashcardSet(
  id: string,
  patch: Partial<Omit<FlashcardSet, "id" | "createdAt" | "updatedAt">>
): FlashcardSet | null {
  return localFlashcardSetRepository.update(id, patch);
}

export function deleteFlashcardSet(id: string): boolean {
  // Also delete all flashcards in this set
  const cards = getFlashcardsBySet(id);
  cards.forEach((c) => localFlashcardRepository.remove(c.id));
  return localFlashcardSetRepository.remove(id);
}

// ============================================================================
// FLASHCARDS
// ============================================================================

export function listFlashcards(): Flashcard[] {
  return localFlashcardRepository.list();
}

export function getFlashcardById(id: string): Flashcard | null {
  return localFlashcardRepository.getById(id);
}

export function getFlashcardsBySet(setId: string): Flashcard[] {
  return localFlashcardRepository.list().filter((f) => f.setId === setId);
}

export function createFlashcard(payload: Omit<Flashcard, "id" | "createdAt" | "updatedAt">): Flashcard {
  return localFlashcardRepository.create(payload);
}

export function updateFlashcard(
  id: string,
  patch: Partial<Omit<Flashcard, "id" | "createdAt" | "updatedAt">>
): Flashcard | null {
  return localFlashcardRepository.update(id, patch);
}

export function deleteFlashcard(id: string): boolean {
  return localFlashcardRepository.remove(id);
}

export function markFlashcardLearned(id: string, learned: boolean): Flashcard | null {
  return localFlashcardRepository.update(id, { learned });
}

// ============================================================================
// QUIZZES
// ============================================================================

export function listQuizzes(): Quiz[] {
  return localQuizRepository.list();
}

export function getQuizById(id: string): Quiz | null {
  return localQuizRepository.getById(id);
}

export function getQuizzesBySubject(subjectId: string): Quiz[] {
  return localQuizRepository.list().filter((q) => q.subjectId === subjectId);
}

export function createQuiz(payload: Omit<Quiz, "id" | "createdAt" | "updatedAt">): Quiz {
  return localQuizRepository.create(payload);
}

export function updateQuiz(id: string, patch: Partial<Omit<Quiz, "id" | "createdAt" | "updatedAt">>): Quiz | null {
  return localQuizRepository.update(id, patch);
}

export function deleteQuiz(id: string): boolean {
  // Also delete all attempts for this quiz
  const attempts = getQuizAttempts(id);
  attempts.forEach((a) => localQuizAttemptRepository.remove(a.id));
  return localQuizRepository.remove(id);
}

export function addQuizQuestion(quizId: string, question: Omit<QuizQuestion, "id">): Quiz | null {
  const quiz = getQuizById(quizId);
  if (!quiz) return null;
  const newQuestion: QuizQuestion = { ...question, id: generateId() };
  return updateQuiz(quizId, { questions: [...quiz.questions, newQuestion] });
}

export function updateQuizQuestion(
  quizId: string,
  questionId: string,
  patch: Partial<Omit<QuizQuestion, "id">>
): Quiz | null {
  const quiz = getQuizById(quizId);
  if (!quiz) return null;
  const questions = quiz.questions.map((q) => (q.id === questionId ? { ...q, ...patch } : q));
  return updateQuiz(quizId, { questions });
}

export function deleteQuizQuestion(quizId: string, questionId: string): Quiz | null {
  const quiz = getQuizById(quizId);
  if (!quiz) return null;
  const questions = quiz.questions.filter((q) => q.id !== questionId);
  return updateQuiz(quizId, { questions });
}

// ============================================================================
// QUIZ ATTEMPTS
// ============================================================================

export function getQuizAttempts(quizId: string): QuizAttempt[] {
  return localQuizAttemptRepository.list().filter((a) => a.quizId === quizId);
}

export function createQuizAttempt(payload: Omit<QuizAttempt, "id" | "createdAt" | "updatedAt">): QuizAttempt {
  return localQuizAttemptRepository.create(payload);
}

export function getBestAttempt(quizId: string): QuizAttempt | undefined {
  const attempts = getQuizAttempts(quizId);
  if (attempts.length === 0) return undefined;
  return attempts.reduce((best, curr) =>
    curr.score / curr.totalQuestions > best.score / best.totalQuestions ? curr : best
  );
}

export function getLatestAttempt(quizId: string): QuizAttempt | undefined {
  const attempts = getQuizAttempts(quizId);
  if (attempts.length === 0) return undefined;
  return attempts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
}

// ============================================================================
// GENERATION
// ============================================================================

export interface GenerateAndSaveRequest {
  notes: Note[];
  subjectId: string;
  title: string;
  mode: GenerationMode;
  generatorType: GeneratorType;
  maxFlashcards?: number;
  maxQuizQuestions?: number;
}

export interface GenerateAndSaveResult {
  flashcardSet: FlashcardSet | null;
  flashcards: Flashcard[];
  quiz: Quiz | null;
  warnings: string[];
}

export async function generateStudyMaterials(request: GenerateAndSaveRequest): Promise<GenerateAndSaveResult> {
  const provider = getStudyGenerationProvider(request.generatorType);

  const result = await provider.generate({
    notes: request.notes,
    subjectId: request.subjectId,
    title: request.title,
    mode: request.mode,
    maxFlashcards: request.maxFlashcards,
    maxQuizQuestions: request.maxQuizQuestions,
  });

  return saveGenerationResult(result);
}

export function saveGenerationResult(result: GenerationResult): GenerateAndSaveResult {
  const warnings = result.warnings ?? [];
  let savedSet: FlashcardSet | null = null;
  let savedCards: Flashcard[] = [];
  let savedQuiz: Quiz | null = null;

  // Save flashcard set and cards
  if (result.flashcardSet) {
    savedSet = createFlashcardSet(result.flashcardSet.set);
    savedCards = result.flashcardSet.cards.map((card) =>
      createFlashcard({
        setId: savedSet!.id,
        question: card.question,
        answer: card.answer,
        learned: card.learned,
      })
    );
  }

  // Save quiz
  if (result.quiz) {
    savedQuiz = createQuiz(result.quiz);
  }

  return {
    flashcardSet: savedSet,
    flashcards: savedCards,
    quiz: savedQuiz,
    warnings,
  };
}

// ============================================================================
// MANUAL CREATION HELPERS
// ============================================================================

export function createEmptyFlashcardSet(subjectId: string, title: string, description?: string): FlashcardSet {
  return createFlashcardSet({
    title,
    description,
    subjectId,
    noteIds: [],
    source: "manual",
  });
}

export function createEmptyQuiz(subjectId: string, title: string, description?: string): Quiz {
  return createQuiz({
    title,
    description,
    subjectId,
    noteIds: [],
    questions: [],
    source: "manual",
  });
}

export function addFlashcardToSet(setId: string, question: string, answer: string): Flashcard {
  return createFlashcard({
    setId,
    question,
    answer,
    learned: false,
  });
}

// ============================================================================
// STATS
// ============================================================================

export interface StudyStats {
  totalFlashcardSets: number;
  totalFlashcards: number;
  learnedFlashcards: number;
  totalQuizzes: number;
  totalQuizAttempts: number;
  averageQuizScore: number;
}

export function getStudyStats(): StudyStats {
  const sets = listFlashcardSets();
  const cards = listFlashcards();
  const quizzes = listQuizzes();
  const allAttempts = localQuizAttemptRepository.list();

  const learnedCards = cards.filter((c) => c.learned).length;
  const avgScore =
    allAttempts.length > 0
      ? allAttempts.reduce((sum, a) => sum + (a.score / a.totalQuestions) * 100, 0) / allAttempts.length
      : 0;

  return {
    totalFlashcardSets: sets.length,
    totalFlashcards: cards.length,
    learnedFlashcards: learnedCards,
    totalQuizzes: quizzes.length,
    totalQuizAttempts: allAttempts.length,
    averageQuizScore: Math.round(avgScore),
  };
}
