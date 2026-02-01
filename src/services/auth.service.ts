import { localAuthRepository } from "@/data/local";
import type { Session } from "@/domain/types";

export const authService = {
  register(name: string, email: string, password: string): Session | null {
    return localAuthRepository.register(name, email, password);
  },

  login(email: string, password: string): Session | null {
    return localAuthRepository.login(email, password);
  },

  logout(): void {
    localAuthRepository.logout();
  },

  getSession(): Session | null {
    return localAuthRepository.getSession();
  },

  isAuthenticated(): boolean {
    return localAuthRepository.getSession() !== null;
  },

  resetPassword(email: string): boolean {
    return localAuthRepository.resetPassword(email);
  },
};
