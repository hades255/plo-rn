import { http, tokenStore } from './client';

type User = Record<string, unknown>;
type AuthResponse = { user?: User; token?: string };

async function handleAuthResponse(promise: Promise<AuthResponse>) {
  const data = await promise;
  if (data?.token) {
    await tokenStore.set(data.token);
  }
  return data;
}

export const api = {
  auth: {
    getSession: () => http.get<{ user?: User }>('/auth/session'),
    login: (credentials: { email: string; password: string }) =>
      handleAuthResponse(http.post<AuthResponse>('/auth/login', credentials)),
    signup: (userData: Record<string, unknown>) =>
      handleAuthResponse(http.post<AuthResponse>('/auth/signup', userData)),
    logout: async () => {
      try {
        await http.post('/auth/logout', {});
      } finally {
        await tokenStore.remove();
      }
    },
    sendOTP: ({ phone }: { phone: string }) => http.post('/auth/otp/send', { phone }),
    sendOTPSignin: ({ phone }: { phone: string }) =>
      http.post('/auth/otp/send/signin', { phone }),
    verifyOTP: ({ phone, code }: { phone: string; code: string }) =>
      handleAuthResponse(http.post<AuthResponse>('/auth/otp/verify', { phone, code })),
    sendEmailOTP: ({ email }: { email: string }) =>
      http.post('/auth/otp/email/send', { email }),
    verifyEmailOTP: ({ email, code }: { email: string; code: string }) =>
      http.post('/auth/otp/email/verify', { email, code }),
    requestPasswordReset: ({ email }: { email: string }) =>
      http.post('/auth/password/reset/request', { email }),
    verifyPasswordReset: ({ email, code }: { email: string; code: string }) =>
      http.post('/auth/password/reset/verify', { email, code }),
    completePasswordReset: ({
      email,
      code,
      password,
    }: {
      email: string;
      code: string;
      password: string;
    }) => http.post('/auth/password/reset/complete', { email, code, password }),
  },
  kyc: {
    getStatus: () =>
      http.get<{
        verifiedForOrdering?: boolean;
      }>('/kyc/status'),
  },
  games: {
    list: (filter = '') => http.get<Array<Record<string, unknown>>>(`/games/?filter=${filter}`),
    featured: () => http.get<Array<Record<string, unknown>>>('/games/featured'),
    getScratchById: (id: string) => http.get<Record<string, unknown>>(`/games/scratch/${id}`),
  },
  wallet: {
    getBalance: () => http.get<{ payable?: number; balance?: number }>('/wallet/'),
  },
  gameflow: {
    quote: ({
      gameId,
      lines,
      draws,
    }: {
      gameId: string;
      lines: Array<{ numbers: number[]; bonus: number | null }>;
      draws: number;
    }) => http.post<{ subtotal: number; serviceFee: number; total: number }>('/gameflow/draw/quote', { gameId, lines, draws }),
  },
  orders: {
    draw: {
      create: (payload: Record<string, unknown>) =>
        http.post<{ orderId: string }>('/orders/draw/', payload),
    },
  },
  token: tokenStore,
};
