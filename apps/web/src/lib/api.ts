import type { ApiResponse } from '@castaminofen/shared';
import { usePlayerStore } from '@/store/player';
import { rawFetch } from '@/lib/http';

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<ApiResponse<T>> {
  const accessToken = token ?? usePlayerStore.getState().accessToken;
  const result = await rawFetch<T>(path, options, accessToken);

  if (result.success || result.error?.code !== '401') {
    return result;
  }

  const refreshed = await usePlayerStore.getState().refreshSession();
  if (!refreshed) {
    usePlayerStore.getState().logout();
    return {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'نشست شما منقضی شده. دوباره وارد شوید.',
      },
    };
  }

  return rawFetch<T>(path, options, usePlayerStore.getState().accessToken);
}

export { rawFetch, API_URL } from '@/lib/http';
