// Storage utility for localStorage access

import { STORAGE_KEYS, STORAGE_VERSION } from "@/domain/constants";

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

class Storage {
  private isClient: boolean;

  constructor() {
    this.isClient = typeof window !== "undefined";
  }

  private checkVersion(): void {
    if (!this.isClient) return;

    const storedVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
    if (storedVersion !== STORAGE_VERSION) {
      // In future versions, handle migration here
      localStorage.setItem(STORAGE_KEYS.VERSION, STORAGE_VERSION);
    }
  }

  get<T>(key: string, defaultValue: T): T {
    if (!this.isClient) return defaultValue;

    this.checkVersion();

    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  }

  set<T>(key: string, value: T): void {
    if (!this.isClient) return;

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }

  remove(key: string): void {
    if (!this.isClient) return;
    localStorage.removeItem(key);
  }

  clear(): void {
    if (!this.isClient) return;

    const keys = Object.values(STORAGE_KEYS) as StorageKey[];
    keys.forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  exportAll(): string {
    if (!this.isClient) return "{}";

    const data: Record<string, unknown> = {
      version: STORAGE_VERSION,
    };

    const entries = Object.entries(STORAGE_KEYS) as [string, StorageKey][];
    entries.forEach(([name, key]) => {
      if (name !== "VERSION") {
        const value = localStorage.getItem(key);
        if (value) {
          data[name.toLowerCase()] = JSON.parse(value);
        }
      }
    });

    return JSON.stringify(data, null, 2);
  }

  importAll(jsonString: string): boolean {
    if (!this.isClient) return false;

    try {
      const data = JSON.parse(jsonString) as Record<string, unknown>;

      if (!data.version) {
        throw new Error("Invalid data format: missing version");
      }

      const entries = Object.entries(STORAGE_KEYS) as [string, StorageKey][];
      entries.forEach(([name, key]) => {
        const dataKey = name.toLowerCase();
        if (dataKey !== "version" && data[dataKey]) {
          localStorage.setItem(key, JSON.stringify(data[dataKey]));
        }
      });

      localStorage.setItem(STORAGE_KEYS.VERSION, STORAGE_VERSION);

      return true;
    } catch (error) {
      console.error("Failed to import data:", error);
      return false;
    }
  }
}

export const storage = new Storage();
