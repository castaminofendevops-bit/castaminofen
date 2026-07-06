import { useEffect } from 'react';
import { initApiAuth } from '@/lib/api';
import { usePlayerStore } from '@/store/player';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initApiAuth({
      getAccessToken: () => usePlayerStore.getState().accessToken,
      refreshSession: () => usePlayerStore.getState().refreshSession(),
      clearAuth: () => usePlayerStore.getState().logout(),
    });
    void usePlayerStore.getState().loadAuth();
  }, []);

  return <>{children}</>;
}
