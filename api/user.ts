import { apiRequest } from '@/api/client';

export type MeResponse = {
  id: string;
  email: string;
  fullName?: string | null;
  name?: string | null;
};

export type UpdateMePayload = {
  fullName?: string;
  gender?: 'female' | 'male' | 'other';
  birthDate?: string;
  heightCm?: number;
  weightKg?: number;
  goalType?: 'lose' | 'maintain' | 'gain';
  activityLevel?: 'low' | 'medium' | 'high';
  targetWeightKg?: number;
};

export async function getMe() {
  return apiRequest<MeResponse>('/api/me', {
    method: 'GET',
  });
}

export async function updateMe(payload: UpdateMePayload) {
  return apiRequest<MeResponse>('/api/me', {
    method: 'PATCH',
    body: payload,
  });
}
