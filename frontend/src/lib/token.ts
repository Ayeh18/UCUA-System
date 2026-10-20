// Same key as the previous version of the app, so existing sessions survive the upgrade.
const STORAGE_KEY = 'accessToken';

interface TokenClaims {
  sub?: string;
  exp?: number;
}

export const tokenStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(STORAGE_KEY, token);
    } catch {
      // Storage unavailable (private mode); the session will last for this tab only.
    }
  },
  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  },
};

/** Read a JWT's payload without verifying it; the server is the authority on validity. */
export function decodeToken(token: string): TokenClaims | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded)) as TokenClaims;
  } catch {
    return null;
  }
}

/** Milliseconds until the token expires (<= 0 when expired or unreadable). */
export function msUntilExpiry(token: string, now: number = Date.now()): number {
  const exp = decodeToken(token)?.exp;
  return exp ? exp * 1000 - now : 0;
}
