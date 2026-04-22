import { apiRequest } from '@/api/client';

export type AuthUser = {
  id: string;
  email: string;
  fullName?: string | null;
  name?: string | null;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignUpPayload = {
  email: string;
  password: string;
  fullName?: string;
};

export type AuthResponse = {
  accessToken?: string;
  access_token?: string;
  user?: AuthUser;
};

export async function login(payload: LoginPayload) {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export async function signUp(payload: SignUpPayload) {
  return apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export function extractAccessToken(data: AuthResponse) {
  return data.accessToken ?? data.access_token ?? null;
}