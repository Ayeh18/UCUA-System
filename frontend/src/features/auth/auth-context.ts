import { createContext, useContext } from 'react';

export interface AuthContextValue {
  token: string | null;
  staffId: string | null;
  isAuthenticated: boolean;
  signIn: (token: string) => void;
  signOut: (reason?: 'manual' | 'expired') => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>');
  return value;
}
