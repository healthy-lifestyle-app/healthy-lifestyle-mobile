import { apiRequest } from '@/api/client';

export type MeResponse = {
  id: string;
  email: string;
  fullName?: string | null;
  name?: string | null;
};

export async function getMe() {
  return apiRequest<MeResponse>('/api/me', {
    method: 'GET',
  });
}