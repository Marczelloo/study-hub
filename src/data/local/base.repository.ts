import type { BaseEntity } from "@/domain/types";
import type { Repository } from "@/data/repositories/repository";
import { storage } from "@/data/storage";
import { generateId, generateTimestamp } from "@/lib/ids";

export function createLocalRepository<T extends BaseEntity>(storageKey: string): Repository<T> {
  return {
    list(): T[] {
      return storage.get<T[]>(storageKey, []);
    },

    getById(id: string): T | null {
      const items = this.list();
      return items.find((item) => item.id === id) ?? null;
    },

    create(payload: Omit<T, "id" | "createdAt" | "updatedAt">): T {
      const items = this.list();
      const now = generateTimestamp();
      const newItem = {
        ...payload,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      } as T;
      items.push(newItem);
      storage.set(storageKey, items);
      return newItem;
    },

    update(id: string, patch: Partial<Omit<T, "id" | "createdAt" | "updatedAt">>): T | null {
      const items = this.list();
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return null;

      const updated = {
        ...items[index],
        ...patch,
        updatedAt: generateTimestamp(),
      };
      items[index] = updated;
      storage.set(storageKey, items);
      return updated;
    },

    remove(id: string): boolean {
      const items = this.list();
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return false;

      items.splice(index, 1);
      storage.set(storageKey, items);
      return true;
    },
  };
}
