import type { Session, User } from "@/domain/types";

export interface AuthRepository {
  register(name: string, email: string, password: string): Session | null;
  login(email: string, password: string): Session | null;
  logout(): void;
  getSession(): Session | null;
  resetPassword(email: string): boolean;
}
