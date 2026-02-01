import { localSemesterRepository, localSubjectRepository } from "@/data/local";
import type { Semester, Subject } from "@/domain/types";

export const semesterService = {
  list(): Semester[] {
    return localSemesterRepository.list();
  },

  getById(id: string): Semester | null {
    return localSemesterRepository.getById(id);
  },

  getCurrent(): Semester | null {
    return this.list().find((s) => s.isCurrent) ?? null;
  },

  create(payload: Omit<Semester, "id" | "createdAt" | "updatedAt">): Semester {
    return localSemesterRepository.create(payload);
  },

  update(id: string, patch: Partial<Omit<Semester, "id" | "createdAt" | "updatedAt">>): Semester | null {
    return localSemesterRepository.update(id, patch);
  },

  remove(id: string): boolean {
    return localSemesterRepository.remove(id);
  },
};

export const subjectService = {
  list(): Subject[] {
    return localSubjectRepository.list();
  },

  getById(id: string): Subject | null {
    return localSubjectRepository.getById(id);
  },

  getBySemester(semesterId: string): Subject[] {
    return this.list().filter((s) => s.semesterId === semesterId);
  },

  create(payload: Omit<Subject, "id" | "createdAt" | "updatedAt">): Subject {
    return localSubjectRepository.create(payload);
  },

  update(id: string, patch: Partial<Omit<Subject, "id" | "createdAt" | "updatedAt">>): Subject | null {
    return localSubjectRepository.update(id, patch);
  },

  remove(id: string): boolean {
    return localSubjectRepository.remove(id);
  },
};
