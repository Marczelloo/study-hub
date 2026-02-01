"use client";

import React, { createContext, useContext, useState, useCallback, useSyncExternalStore } from "react";
import type { Session, User } from "@/domain/types";
import { authService } from "@/services";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (name: string, email: string, password: string) => boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  refreshSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple external store for hydration status
const hydrationStore = {
  isHydrated: false,
  listeners: new Set<() => void>(),
  subscribe(listener: () => void) {
    hydrationStore.listeners.add(listener);
    return () => hydrationStore.listeners.delete(listener);
  },
  getSnapshot() {
    return hydrationStore.isHydrated;
  },
  getServerSnapshot() {
    return false;
  },
  setHydrated() {
    hydrationStore.isHydrated = true;
    hydrationStore.listeners.forEach((listener) => listener());
  },
};

// Mark as hydrated after first client render
if (typeof window !== "undefined") {
  hydrationStore.setHydrated();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isHydrated = useSyncExternalStore(
    hydrationStore.subscribe,
    hydrationStore.getSnapshot,
    hydrationStore.getServerSnapshot
  );

  const [session, setSession] = useState<Session | null>(() => {
    if (typeof window !== "undefined") {
      return authService.getSession();
    }
    return null;
  });

  const refreshSession = useCallback(() => {
    const currentSession = authService.getSession();
    setSession(currentSession);
  }, []);

  const register = useCallback((name: string, email: string, password: string): boolean => {
    const newSession = authService.register(name, email, password);
    if (newSession) {
      setSession(newSession);
      return true;
    }
    return false;
  }, []);

  const login = useCallback((email: string, password: string): boolean => {
    const newSession = authService.login(email, password);
    if (newSession) {
      setSession(newSession);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setSession(null);
  }, []);

  const value: AuthContextType = {
    session,
    user: session?.user ?? null,
    isLoading: !isHydrated,
    isAuthenticated: session !== null,
    register,
    login,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
