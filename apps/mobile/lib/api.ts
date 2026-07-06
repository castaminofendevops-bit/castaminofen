import type { ApiResponse } from '@castaminofen/shared';
import { resolveApiUrl } from '@/lib/apiUrl';

export const API_URL = resolveApiUrl();

if (__DEV__) {
  console.log(`[castaminofen] API_URL=${API_URL}`);
}

type AuthHandlers = {
  getAccessToken: () => string | null;
  refreshSession: () => Promise<boolean>;
  clearAuth: () => Promise<void>;
};

let authHandlers: AuthHandlers | null = null;

export function initApiAuth(handlers: AuthHandlers) {
  authHandlers = handlers;
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
    error: {
      code: String(status),
      message: text,
    },
  };
}

export async function rawFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<ApiResponse<T>> {
  const networkError: ApiResponse<T> = {
    success: false,
    error: {
      code: 'NETWORK_ERROR',
      message: 'خطا در اتصال به سرور. API در حال اجرا نیست.',
    },
  };

  for (let attempt = 0; attempt <= 1; attempt++) {
    try {
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
    } catch {
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 400));
        continue;
      }
      return networkError;
    }
  }

  return networkError;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<ApiResponse<T>> {
  const accessToken = token ?? authHandlers?.getAccessToken() ?? null;
  const result = await rawFetch<T>(path, options, accessToken);

  if (result.success || result.error?.code !== '401' || !authHandlers) {
    return result;
  }

  const refreshed = await authHandlers.refreshSession();
  if (!refreshed) {
    await authHandlers.clearAuth();
    return {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'نشست شما منقضی شده. دوباره وارد شوید.',
      },
    };
  }

  return rawFetch<T>(path, options, authHandlers.getAccessToken());
}
