import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { ApiError } from '@/api/client';
import {
  extractAccessToken,
  login as loginRequest,
  signUp as signUpRequest,
  type LoginPayload,
  type SignUpPayload,
} from '@/api/auth';
import { getMe, type MeResponse } from '@/api/user';
import {
  clearSession,
  getAccessToken,
  removeAccessToken,
  setAccessToken,
} from '@/lib/storage';

type AuthContextValue = {
  user: MeResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (payload: LoginPayload) => Promise<void>;
  signUp: (payload: SignUpPayload) => Promise<void>;
  signOut: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleInvalidSession = useCallback(async () => {
    await clearSession();
    setUser(null);
    setToken(null);
  }, []);

  const bootstrap = useCallback(async () => {
    try {
      const storedToken = await getAccessToken();

      if (!storedToken) {
        setUser(null);
        setToken(null);
        return;
      }

      setToken(storedToken);

      const me = await getMe();
      setUser(me);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await handleInvalidSession();
        return;
      }

      await handleInvalidSession();
    } finally {
      setIsLoading(false);
    }
  }, [handleInvalidSession]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const refreshMe = useCallback(async () => {
    try {
      const me = await getMe();
      setUser(me);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await handleInvalidSession();
        return;
      }

      throw error;
    }
  }, [handleInvalidSession]);

  const signIn = useCallback(async (payload: LoginPayload) => {
    const response = await loginRequest(payload);
    const nextToken = extractAccessToken(response);

    if (!nextToken) {
      throw new Error('Token alınamadı.');
    }

    await setAccessToken(nextToken);
    setToken(nextToken);

    const me = await getMe();
    setUser(me);
  }, []);

  const signUp = useCallback(async (payload: SignUpPayload) => {
    const response = await signUpRequest(payload);
    const nextToken = extractAccessToken(response);

    if (!nextToken) {
      throw new Error('Token alınamadı.');
    }

    await setAccessToken(nextToken);
    setToken(nextToken);

    const me = await getMe();
    setUser(me);
  }, []);

  const signOut = useCallback(async () => {
    await removeAccessToken();
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!user && !!token,
      isLoading,
      signIn,
      signUp,
      signOut,
      refreshMe,
    }),
    [user, token, isLoading, signIn, signUp, signOut, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}