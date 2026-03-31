import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/api';
import { ApiError } from '../api/client';

type User = Record<string, unknown> | null;
type Result = { success: boolean; error?: string; status?: number; user?: User };

type AuthContextValue = {
  user: User;
  isAuthenticated: boolean;
  loading: boolean;
  checkSession: () => Promise<void>;
  login: (credentials: { email: string; password: string }) => Promise<Result>;
  signup: (data: Record<string, unknown>) => Promise<Result>;
  logout: () => Promise<void>;
  sendOTP: (phone: string) => Promise<Result>;
  sendOTPSignin: (phone: string) => Promise<Result>;
  verifyOTP: (phone: string, code: string) => Promise<Result>;
};

const defaultValue: AuthContextValue = {
  user: null,
  isAuthenticated: false,
  loading: true,
  checkSession: async () => {},
  login: async () => ({ success: false, error: 'Not initialized' }),
  signup: async () => ({ success: false, error: 'Not initialized' }),
  logout: async () => {},
  sendOTP: async () => ({ success: false, error: 'Not initialized' }),
  sendOTPSignin: async () => ({ success: false, error: 'Not initialized' }),
  verifyOTP: async () => ({ success: false, error: 'Not initialized' }),
};

const AuthContext = createContext<AuthContextValue>(defaultValue);

function getErrorMessage(err: unknown, fallback: string) {
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}

function getStatus(err: unknown) {
  return (err as ApiError)?.status;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(async () => {
    setLoading(true);
    try {
      const token = await api.token.get();
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }
      const data = await api.auth.getSession();
      if (data?.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        await api.token.remove();
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
      await api.token.remove();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    try {
      const data = await api.auth.login(credentials);
      if (data?.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, user: data.user };
      }
      return { success: false, error: 'Login failed' };
    } catch (err) {
      return {
        success: false,
        error: getErrorMessage(err, 'Login failed'),
        status: getStatus(err),
      };
    }
  }, []);

  const signup = useCallback(async (data: Record<string, unknown>) => {
    try {
      const result = await api.auth.signup(data);
      if (result?.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true, user: result.user };
      }
      return { success: false, error: 'Signup failed' };
    } catch (err) {
      return {
        success: false,
        error: getErrorMessage(err, 'Signup failed'),
        status: getStatus(err),
      };
    }
  }, []);

  const sendOTP = useCallback(async (phone: string) => {
    try {
      await api.auth.sendOTP({ phone });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: getErrorMessage(err, 'Failed to send OTP'),
        status: getStatus(err),
      };
    }
  }, []);

  const sendOTPSignin = useCallback(async (phone: string) => {
    try {
      await api.auth.sendOTPSignin({ phone });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: getErrorMessage(err, 'Failed to send OTP'),
        status: getStatus(err),
      };
    }
  }, []);

  const verifyOTP = useCallback(async (phone: string, code: string) => {
    try {
      const data = await api.auth.verifyOTP({ phone, code });
      if (data?.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, user: data.user };
      }
      return { success: false, error: 'Invalid code' };
    } catch (err) {
      return {
        success: false,
        error: getErrorMessage(err, 'Invalid code'),
        status: getStatus(err),
      };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      loading,
      checkSession,
      login,
      signup,
      logout,
      sendOTP,
      sendOTPSignin,
      verifyOTP,
    }),
    [user, isAuthenticated, loading, checkSession, login, signup, logout, sendOTP, sendOTPSignin, verifyOTP],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
