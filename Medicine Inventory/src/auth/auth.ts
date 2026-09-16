import type { LoginResponse } from '../types';

const TOKEN_KEY = 'jezmeds_token';
const USER_KEY = 'jezmeds_user';

export interface SessionUser {
  username: string;
  displayName: string;
  role: string;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): SessionUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function setSession(response: LoginResponse): void {
  localStorage.setItem(TOKEN_KEY, response.token);
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      username: response.username,
      displayName: response.displayName,
      role: response.role,
    }),
  );
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}
