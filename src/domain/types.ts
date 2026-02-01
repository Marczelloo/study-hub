// Domain types for Study Hub application

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface User extends BaseEntity {
  name: string;
  email: string;
  studentId?: string;
}

export interface Semester extends BaseEntity {
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface Subject extends BaseEntity {
  name: string;
  semesterId: string;
  color: string;
  description?: string;
}

// Ink stroke for drawing on notes
export interface InkStroke {
  id: string;
  tool: "pen" | "highlighter" | "line" | "rectangle" | "circle";
  points: { x: number; y: number }[];
  color: string;
  width: number;
  opacity: number;
}

export interface Note extends BaseEntity {
  title: string;
  content: string;
  subjectId: string;
  semesterId: string;
  attachments?: Attachment[];
  inkStrokes?: InkStroke[];
}

export interface Task extends BaseEntity {
  title: string;
  description?: string;
  subjectId?: string;
  dueDate?: string;
  priority: "low" | "med" | "high";
  status: "todo" | "done";
}

export type CalendarEventType = "exam" | "assignment" | "project" | "class" | "personal";

export interface CalendarEvent extends BaseEntity {
  title: string;
  description?: string;
  type: CalendarEventType;
  startAt: string;
  endAt?: string;
  subjectId?: string;
  isAllDay?: boolean;
}

export interface Attachment extends BaseEntity {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: string;
}

export interface Settings {
  theme: "dark" | "light";
  taskReminders: boolean;
  eventNotifications: boolean;
  studySessionReminders: boolean;
  defaultStudyGenerator: "ai" | "basic";
  allowAiNoteProcessing: boolean;
}

// Study module types

export interface FlashcardSet extends BaseEntity {
  title: string;
  description?: string;
  subjectId: string;
  noteIds: string[];
  source: "manual" | "generated";
}

export interface Flashcard extends BaseEntity {
  setId: string;
  question: string;
  answer: string;
  learned: boolean;
}

export type QuizQuestionType = "mcq" | "truefalse" | "short";

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  prompt: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface Quiz extends BaseEntity {
  subjectId: string;
  noteIds: string[];
  title: string;
  description?: string;
  questions: QuizQuestion[];
  source: "manual" | "generated";
}

export interface QuizAttempt extends BaseEntity {
  quizId: string;
  score: number;
  totalQuestions: number;
  answers: { questionId: string; answer: string; correct: boolean }[];
}

export type StudySessionMode = "flashcards" | "quiz" | "mixed";

export interface StudySession extends BaseEntity {
  subjectId: string;
  mode: StudySessionMode;
  minutes: number;
  itemIds: string[];
}
