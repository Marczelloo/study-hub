import { localNoteRepository, localSubjectRepository, localSemesterRepository } from "@/data/local";
import type { Note, Subject, Semester } from "@/domain/types";

export const noteService = {
  list(): Note[] {
    return localNoteRepository.list();
  },

  getById(id: string): Note | null {
    return localNoteRepository.getById(id);
  },

  create(payload: Omit<Note, "id" | "createdAt" | "updatedAt">): Note {
    return localNoteRepository.create(payload);
  },

  update(id: string, patch: Partial<Omit<Note, "id" | "createdAt" | "updatedAt">>): Note | null {
    return localNoteRepository.update(id, patch);
  },

  remove(id: string): boolean {
    return localNoteRepository.remove(id);
  },

  listBySubject(subjectId: string): Note[] {
    return this.list().filter((note) => note.subjectId === subjectId);
  },

  listBySemester(semesterId: string): Note[] {
    return this.list().filter((note) => note.semesterId === semesterId);
  },

  search(query: string): Note[] {
    const lowerQuery = query.toLowerCase();
    return this.list().filter(
      (note) => note.title.toLowerCase().includes(lowerQuery) || note.content.toLowerCase().includes(lowerQuery)
    );
  },

  getSubjects(): Subject[] {
    return localSubjectRepository.list();
  },

  getSemesters(): Semester[] {
    return localSemesterRepository.list();
  },
};
