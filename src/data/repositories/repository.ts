// Generic repository interface

import type { BaseEntity } from "@/domain/types";

export interface Repository<T extends BaseEntity> {
  list(): T[];
  getById(id: string): T | null;
  create(payload: Omit<T, "id" | "createdAt" | "updatedAt">): T;
  update(id: string, patch: Partial<Omit<T, "id" | "createdAt" | "updatedAt">>): T | null;
  remove(id: string): boolean;
}
