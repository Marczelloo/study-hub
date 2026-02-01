import type {
  Semester,
  Subject,
  Note,
  Task,
  CalendarEvent,
  FlashcardSet,
  Flashcard,
  Quiz,
  QuizAttempt,
  StudySession,
} from "@/domain/types";
import { STORAGE_KEYS } from "@/domain/constants";
import { createLocalRepository } from "./base.repository";

export const localSemesterRepository = createLocalRepository<Semester>(STORAGE_KEYS.SEMESTERS);
export const localSubjectRepository = createLocalRepository<Subject>(STORAGE_KEYS.SUBJECTS);
export const localNoteRepository = createLocalRepository<Note>(STORAGE_KEYS.NOTES);
export const localTaskRepository = createLocalRepository<Task>(STORAGE_KEYS.TASKS);
export const localEventRepository = createLocalRepository<CalendarEvent>(STORAGE_KEYS.EVENTS);
export const localFlashcardSetRepository = createLocalRepository<FlashcardSet>(STORAGE_KEYS.FLASHCARD_SETS);
export const localFlashcardRepository = createLocalRepository<Flashcard>(STORAGE_KEYS.FLASHCARDS);
export const localQuizRepository = createLocalRepository<Quiz>(STORAGE_KEYS.QUIZZES);
export const localQuizAttemptRepository = createLocalRepository<QuizAttempt>(STORAGE_KEYS.QUIZ_ATTEMPTS);
export const localStudySessionRepository = createLocalRepository<StudySession>(STORAGE_KEYS.STUDY_SESSIONS);
