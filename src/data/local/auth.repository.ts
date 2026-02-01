import type { Session, User } from "@/domain/types";
import type { AuthRepository } from "@/data/repositories/auth.repository";
import { storage } from "@/data/storage";
import { STORAGE_KEYS } from "@/domain/constants";
import { generateId, generateTimestamp } from "@/lib/ids";

interface StoredUser extends User {
  passwordHash: string;
}

function hashPassword(password: string): string {
  // Simple hash for demo - in production use bcrypt or similar
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

export function createLocalAuthRepository(): AuthRepository {
  return {
    register(name: string, email: string, password: string): Session | null {
      if (!email.includes("@") || password.length < 6) {
        return null;
      }

      const users = storage.get<StoredUser[]>(STORAGE_KEYS.USERS, []);
      const existingUser = users.find((u) => u.email === email);

      if (existingUser) {
        return null; // User already exists
      }

      const now = generateTimestamp();
      const newUser: StoredUser = {
        id: generateId(),
        name,
        email,
        studentId: `CS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        passwordHash: hashPassword(password),
        createdAt: now,
        updatedAt: now,
      };

      users.push(newUser);
      storage.set(STORAGE_KEYS.USERS, users);

      const session: Session = {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          studentId: newUser.studentId,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
        },
        token: generateId(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      storage.set(STORAGE_KEYS.SESSION, session);
      return session;
    },

    login(email: string, password: string): Session | null {
      if (!email.includes("@") || password.length < 1) {
        return null;
      }

      const users = storage.get<StoredUser[]>(STORAGE_KEYS.USERS, []);
      const user = users.find((u) => u.email === email);

      if (!user) {
        return null; // User not found
      }

      if (user.passwordHash && user.passwordHash !== hashPassword(password)) {
        return null; // Wrong password
      }

      const session: Session = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          studentId: user.studentId,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token: generateId(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      storage.set(STORAGE_KEYS.SESSION, session);
      return session;
    },

    resetPassword(email: string): boolean {
      const users = storage.get<StoredUser[]>(STORAGE_KEYS.USERS, []);
      const user = users.find((u) => u.email === email);
      return user !== undefined;
    },

    logout(): void {
      storage.remove(STORAGE_KEYS.SESSION);
    },

    getSession(): Session | null {
      const session = storage.get<Session | null>(STORAGE_KEYS.SESSION, null);
      if (!session) return null;

      // Check if session is expired
      if (new Date(session.expiresAt) < new Date()) {
        storage.remove(STORAGE_KEYS.SESSION);
        return null;
      }

      return session;
    },
  };
}

export const localAuthRepository = createLocalAuthRepository();
