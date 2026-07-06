import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PATH = '/api/v1';
const DEFAULT_PORT = process.env.EXPO_PUBLIC_API_PORT ?? '3000';
const LOCALHOST_API = `http://localhost:${DEFAULT_PORT}${API_PATH}`;

function normalizeUrl(url: string): string {
  return url.replace(/\/$/, '');
}

function getMetroLanHost(): string | null {
  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost ??
    (Constants.manifest as { debuggerHost?: string } | null)?.debuggerHost;

  if (debuggerHost) {
    const host = debuggerHost.split(':')[0];
    if (host) return host;
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host) return host;
  }

  return null;
}

function getWebDevHost(): string | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const host = window.location.hostname;
  if (!host || host === 'localhost' || host === '127.0.0.1') return null;
  return host;
}

function isLocalhostUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return url.includes('localhost') || url.includes('127.0.0.1');
  }
}

/**
 * Resolves API base URL for Expo Go / emulator / web.
 * Physical devices cannot reach the dev machine via localhost — use Metro LAN IP.
 */
export function resolveApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  const fromExtra = Constants.expoConfig?.extra?.apiUrl as string | undefined;
  const configured = fromEnv ?? fromExtra;

  if (configured && !isLocalhostUrl(configured)) {
    return normalizeUrl(configured);
  }

  if (__DEV__) {
    const lanHost = getMetroLanHost() ?? getWebDevHost();
    if (lanHost) {
      return `http://${lanHost}:${DEFAULT_PORT}${API_PATH}`;
    }
  }

  if (configured) {
    return normalizeUrl(configured);
  }

  return LOCALHOST_API;
}
