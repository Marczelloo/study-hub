// Application constants

export const STORAGE_VERSION = "1.0.0";
export const STORAGE_PREFIX = "student_helper";

export const STORAGE_KEYS = {
  VERSION: `${STORAGE_PREFIX}.version`,
  SESSION: `${STORAGE_PREFIX}.session`,
  SETTINGS: `${STORAGE_PREFIX}.settings`,
  USERS: `${STORAGE_PREFIX}.users`,
  SEMESTERS: `${STORAGE_PREFIX}.semesters`,
  SUBJECTS: `${STORAGE_PREFIX}.subjects`,
  NOTES: `${STORAGE_PREFIX}.notes`,
  TASKS: `${STORAGE_PREFIX}.tasks`,
  EVENTS: `${STORAGE_PREFIX}.events`,
  FLASHCARD_SETS: `${STORAGE_PREFIX}.flashcard_sets`,
  FLASHCARDS: `${STORAGE_PREFIX}.flashcards`,
  QUIZZES: `${STORAGE_PREFIX}.quizzes`,
  QUIZ_ATTEMPTS: `${STORAGE_PREFIX}.quiz_attempts`,
  STUDY_SESSIONS: `${STORAGE_PREFIX}.study_sessions`,
  LESSONS: `${STORAGE_PREFIX}.lessons`,
  HOLIDAYS: `${STORAGE_PREFIX}.holidays`,
  HOLIDAYS_LAST_FETCH: `${STORAGE_PREFIX}.holidays_last_fetch`,
  COUNTRY_CONFIGURED: `${STORAGE_PREFIX}.country_configured`,
} as const;

export const DEFAULT_SETTINGS = {
  theme: "dark" as const,
  taskReminders: true,
  eventNotifications: true,
  studySessionReminders: false,
  defaultStudyGenerator: "basic" as const,
  allowAiNoteProcessing: true,
  country: "US", // Default to US, can be changed in settings
};

export const SUBJECT_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ef4444", // red
  "#22c55e", // green
  "#f59e0b", // amber
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#f97316", // orange
] as const;

export const PRIORITY_LABELS = {
  low: "low",
  med: "medium",
  high: "high",
} as const;

export const EVENT_TYPE_COLORS: Record<string, string> = {
  exam: "bg-red-500/20 border-red-500 text-red-400",
  assignment: "bg-blue-500/20 border-blue-500 text-blue-400",
  project: "bg-purple-500/20 border-purple-500 text-purple-400",
  class: "bg-green-500/20 border-green-500 text-green-400",
  personal: "bg-gray-500/20 border-gray-500 text-gray-400",
} as const;
