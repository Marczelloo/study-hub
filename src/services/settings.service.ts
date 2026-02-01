import { storage } from "@/data/storage";
import { STORAGE_KEYS, DEFAULT_SETTINGS } from "@/domain/constants";
import type { Settings, User } from "@/domain/types";
import { authService } from "./auth.service";

export const settingsService = {
  getSettings(): Settings {
    return storage.get<Settings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  updateSettings(patch: Partial<Settings>): Settings {
    const current = this.getSettings();
    const updated = { ...current, ...patch };
    storage.set(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  updateUser(patch: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>): User | null {
    const session = authService.getSession();
    if (!session) return null;

    const users = storage.get<User[]>(STORAGE_KEYS.USERS, []);
    const index = users.findIndex((u) => u.id === session.user.id);
    if (index === -1) return null;

    const updatedUser = {
      ...users[index],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    users[index] = updatedUser;
    storage.set(STORAGE_KEYS.USERS, users);

    // Update session with new user data
    const updatedSession = { ...session, user: updatedUser };
    storage.set(STORAGE_KEYS.SESSION, updatedSession);

    return updatedUser;
  },

  exportData(): string {
    return storage.exportAll();
  },

  importData(jsonString: string): boolean {
    return storage.importAll(jsonString);
  },

  resetData(): void {
    storage.clear();
  },
};
