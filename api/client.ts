import { getAccessToken } from '@/lib/storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('EXPO_PUBLIC_API_URL tanımlı değil.');
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

type ApiRequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
};

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function extractMessage(data: unknown) {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const message = (data as { message: unknown }).message;

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    if (typeof message === 'string') {
      return message;
    }
  }

  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  return 'Bir hata oluştu.';
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, token } = options;
  const authToken = token ?? (await getAccessToken());

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const contentType = response.headers.get('content-type');
  let data: unknown = null;

  if (contentType?.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text || null;
  }

  if (!response.ok) {
    throw new ApiError(extractMessage(data), response.status, data);
  }

  return data as T;
}

export const apiClient = {
  get: <T>(path: string, token?: string | null) =>
    apiRequest<T>(path, { method: 'GET', token }),

  post: <T>(path: string, body?: unknown, token?: string | null) =>
    apiRequest<T>(path, { method: 'POST', body, token }),

  patch: <T>(path: string, body?: unknown, token?: string | null) =>
    apiRequest<T>(path, { method: 'PATCH', body, token }),

  put: <T>(path: string, body?: unknown, token?: string | null) =>
    apiRequest<T>(path, { method: 'PUT', body, token }),

  delete: <T>(path: string, token?: string | null) =>
    apiRequest<T>(path, { method: 'DELETE', token }),
};