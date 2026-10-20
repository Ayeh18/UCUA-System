import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { toast } from 'sonner';

import { UNAUTHORIZED_EVENT } from '@/lib/api-client';
import { decodeToken, msUntilExpiry, tokenStorage } from '@/lib/token';

import { AuthContext, type AuthContextValue } from './auth-context';

function readValidToken(): string | null {
  const stored = tokenStorage.get();
  if (stored && msUntilExpiry(stored) > 0) return stored;
  tokenStorage.clear();
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(readValidToken);

  const signIn = useCallback((newToken: string) => {
    tokenStorage.set(newToken);
    setToken(newToken);
  }, []);

  const signOut = useCallback<AuthContextValue['signOut']>(
    (reason = 'manual') => {
      const hadSession = tokenStorage.get() !== null;
      tokenStorage.clear();
      queryClient.clear();
      setToken(null);
      if (hadSession && reason === 'expired') {
        toast.warning('Your session has expired. Please sign in again.');
      }
    },
    [queryClient],
  );

  // Sign out automatically when the token expires or the API rejects it.
  useEffect(() => {
    if (!token) return;
    const timer = window.setTimeout(() => signOut('expired'), Math.max(msUntilExpiry(token), 0));
    const onUnauthorized = () => signOut('expired');
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    };
  }, [token, signOut]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      staffId: token ? (decodeToken(token)?.sub ?? null) : null,
      isAuthenticated: Boolean(token),
      signIn,
      signOut,
    }),
    [token, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
