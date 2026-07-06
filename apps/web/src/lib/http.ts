import type { ApiResponse } from '@castaminofen/shared';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

const NETWORK_RETRY_DELAY_MS = 400;
const NETWORK_RETRY_COUNT = 1;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeError(status: number, body: Record<string, unknown>): ApiResponse {
  const message = body.message;
  const text = Array.isArray(message)
    ? String(message[0])
    : typeof message === 'string'
      ? message
      : 'خطای ناشناخته';

  return {
    success: false,
    error: { code: String(status), message: text },
  };
}

async function fetchOnce<T>(
  path: string,
  options: RequestInit,
  token?: string | null,
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const body = (await res.json()) as ApiResponse<T> & Record<string, unknown>;

  if (body.success === false) return body as ApiResponse<T>;
  if (!res.ok) return normalizeError(res.status, body) as ApiResponse<T>;
  return body as ApiResponse<T>;
}

export async function rawFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<ApiResponse<T>> {
  let lastError: ApiResponse<T> = {
    success: false,
    error: {
      code: 'NETWORK_ERROR',
      message: 'سرور API در دسترس نیست. API Gateway و Docker را بررسی کنید.',
    },
  };

  for (let attempt = 0; attempt <= NETWORK_RETRY_COUNT; attempt++) {
    try {
      return await fetchOnce<T>(path, options, token);
    } catch {
      if (attempt < NETWORK_RETRY_COUNT) {
        await sleep(NETWORK_RETRY_DELAY_MS);
        continue;
      }
      return lastError;
    }
  }

  return lastError;
}
