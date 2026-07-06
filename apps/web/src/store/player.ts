'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResponse, AuthTokens, AuthUser } from '@castaminofen/shared';
import { rawFetch } from '@/lib/http';

interface Episode {
  id: string;
  title: string;
  duration: number;
  contentTitle?: string;
  coverUrl?: string | null;
}

interface PlayerState {
  currentEpisode: Episode | null;
  streamUrl: string | null;
  isPlaying: boolean;
  position: number;
  playbackSpeed: number;
  sleepTimerEnd: number | null;
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  authReady: boolean;

  setAuth: (tokens: Pick<AuthTokens, 'accessToken' | 'refreshToken'>, user: AuthUser) => void;
  hydrateProfile: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  logout: () => void;
  playEpisode: (episode: Episode, streamUrl: string) => void;
  togglePlay: () => void;
  setPosition: (position: number) => void;
  setSpeed: (speed: number) => void;
  setSleepTimer: (minutes: number | null) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentEpisode: null,
      streamUrl: null,
      isPlaying: false,
      position: 0,
      playbackSpeed: 1,
      sleepTimerEnd: null,
      accessToken: null,
      refreshToken: null,
      user: null,
      authReady: false,

      setAuth: (tokens, user) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user,
          authReady: true,
        }),

      hydrateProfile: async () => {
        const token = get().accessToken;
        if (!token) {
          set({ authReady: true });
          return;
        }

        const res = await rawFetch<AuthUser>('/auth/me', {}, token);
        if (res.success && res.data) {
          set({ user: res.data, authReady: true });
          return;
        }

        if (res.error?.code === '401') {
          const refreshed = await get().refreshSession();
          if (refreshed) await get().hydrateProfile();
          else set({ authReady: true });
          return;
        }

        set({ authReady: true });
      },

      refreshSession: async () => {
        const refreshToken = get().refreshToken;
        if (!refreshToken) return false;

        const res = await rawFetch<AuthTokens>('/auth/refresh', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });

        if (!res.success || !res.data) {
          get().logout();
          return false;
        }

        set({
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken,
        });
        return true;
      },

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          authReady: true,
          currentEpisode: null,
          streamUrl: null,
          isPlaying: false,
        }),

      playEpisode: (episode, streamUrl) =>
        set({ currentEpisode: episode, streamUrl, isPlaying: true, position: 0 }),

      togglePlay: () => set({ isPlaying: !get().isPlaying }),

      setPosition: (position) => set({ position }),

      setSpeed: (playbackSpeed) => set({ playbackSpeed }),

      setSleepTimer: (minutes) =>
        set({
          sleepTimerEnd: minutes ? Date.now() + minutes * 60 * 1000 : null,
        }),
    }),
    {
      name: 'castaminofen-player',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        playbackSpeed: state.playbackSpeed,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) void state.hydrateProfile();
      },
    },
  ),
);
