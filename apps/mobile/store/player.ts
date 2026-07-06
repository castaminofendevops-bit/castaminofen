import { create } from 'zustand';
import type { AuthResponse, AuthTokens, AuthUser } from '@castaminofen/shared';
import * as storage from '@/lib/storage';
import { rawFetch } from '@/lib/api';

interface Episode {
  id: string;
  title: string;
  duration: number;
  contentTitle?: string;
  contentType?: string;
  coverUrl?: string | null;
}

interface PlayerState {
  currentEpisode: Episode | null;
  streamUrl: string | null;
  isPlaying: boolean;
  position: number;
  playbackSpeed: number;
  sleepTimerEnd: number | null;
  isBookmarked: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  authReady: boolean;
  playerSheetExpanded: boolean;

  setAuth: (tokens: Pick<AuthTokens, 'accessToken' | 'refreshToken'>, user: AuthUser) => Promise<void>;
  setPlayerSheetExpanded: (expanded: boolean) => void;
  loadAuth: () => Promise<void>;
  hydrateProfile: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  logout: () => Promise<void>;
  playEpisode: (episode: Episode, streamUrl: string) => void;
  togglePlay: () => void;
  setPosition: (position: number) => void;
  setSpeed: (speed: number) => void;
  setSleepTimer: (minutes: number | null) => void;
  toggleBookmark: () => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
}

const STORAGE = {
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  user: 'user',
} as const;

async function persistAuth(tokens: Pick<AuthTokens, 'accessToken' | 'refreshToken'>, user: AuthUser) {
  await storage.setItem(STORAGE.accessToken, tokens.accessToken);
  await storage.setItem(STORAGE.refreshToken, tokens.refreshToken);
  await storage.setItem(STORAGE.user, JSON.stringify(user));
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentEpisode: null,
  streamUrl: null,
  isPlaying: false,
  position: 0,
  playbackSpeed: 1.25,
  sleepTimerEnd: null,
  isBookmarked: false,
  accessToken: null,
  refreshToken: null,
  user: null,
  authReady: false,
  playerSheetExpanded: false,

  setPlayerSheetExpanded: (playerSheetExpanded) => set({ playerSheetExpanded }),

  setAuth: async (tokens, user) => {
    await persistAuth(tokens, user);
    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
      authReady: true,
    });
  },

  loadAuth: async () => {
    const accessToken = await storage.getItem(STORAGE.accessToken);
    const refreshToken = await storage.getItem(STORAGE.refreshToken);
    const userJson = await storage.getItem(STORAGE.user);

    if (!accessToken) {
      set({ authReady: true });
      return;
    }

    let user: AuthUser | null = null;
    if (userJson) {
      try {
        user = JSON.parse(userJson) as AuthUser;
      } catch {
        user = null;
      }
    }

    set({ accessToken, refreshToken, user, authReady: true });
    await get().hydrateProfile();
  },

  hydrateProfile: async () => {
    const token = get().accessToken;
    if (!token) return;

    const res = await rawFetch<AuthUser>('/auth/me', {}, token);
    if (res.success && res.data) {
      await storage.setItem(STORAGE.user, JSON.stringify(res.data));
      set({ user: res.data });
      return;
    }

    if (res.error?.code === '401') {
      const refreshed = await get().refreshSession();
      if (refreshed) await get().hydrateProfile();
    }
  },

  refreshSession: async () => {
    const refreshToken = get().refreshToken;
    if (!refreshToken) return false;

    const res = await rawFetch<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.success || !res.data) {
      await get().logout();
      return false;
    }

    const user = get().user;
    if (user) {
      await persistAuth(res.data, user);
    } else {
      await storage.setItem(STORAGE.accessToken, res.data.accessToken);
      await storage.setItem(STORAGE.refreshToken, res.data.refreshToken);
    }

    set({
      accessToken: res.data.accessToken,
      refreshToken: res.data.refreshToken,
    });
    return true;
  },

  logout: async () => {
    await storage.removeItem(STORAGE.accessToken);
    await storage.removeItem(STORAGE.refreshToken);
    await storage.removeItem(STORAGE.user);
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      authReady: true,
      currentEpisode: null,
      streamUrl: null,
      isPlaying: false,
      position: 0,
      playerSheetExpanded: false,
    });
  },

  playEpisode: (episode, streamUrl) =>
    set({ currentEpisode: episode, streamUrl, isPlaying: true, position: 0, isBookmarked: false }),

  togglePlay: () => set({ isPlaying: !get().isPlaying }),

  setPosition: (position) => set({ position }),

  setSpeed: (playbackSpeed) => set({ playbackSpeed }),

  setSleepTimer: (minutes) =>
    set({ sleepTimerEnd: minutes ? Date.now() + minutes * 60 * 1000 : null }),

  toggleBookmark: () => set({ isBookmarked: !get().isBookmarked }),

  skipForward: (seconds = 15) => {
    const ep = get().currentEpisode;
    const max = ep?.duration ?? 0;
    set({ position: Math.min(get().position + seconds, max) });
  },

  skipBackward: (seconds = 15) => {
    set({ position: Math.max(0, get().position - seconds) });
  },
}));
