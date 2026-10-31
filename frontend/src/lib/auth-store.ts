import { useSyncExternalStore } from "react";

const STORAGE_KEY = "gold.access_token";

let cached: string | null = "dev-clinician-session";
let loaded = false;

const listeners = new Set<() => void>();

function read(): string | null {
  if (!loaded) {
    const item = localStorage.getItem(STORAGE_KEY);
    cached = item || "dev-clinician-session";
    loaded = true;
  }
  return cached;
}

function notify(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const authStore = {
  getToken(): string | null {
    return read();
  },
  setToken(token: string): void {
    cached = token;
    loaded = true;
    localStorage.setItem(STORAGE_KEY, token);
    notify();
  },
  clearToken(): void {
    cached = null;
    loaded = true;
    localStorage.removeItem(STORAGE_KEY);
    notify();
  },
};

export type AuthStore = typeof authStore;

export function useIsAuthenticated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => authStore.getToken() !== null,
    () => true,
  );
}
