import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { getThemeColors, type ThemeMode } from '@castaminofen/ui-tokens';

const STORAGE_KEY = 'castaminofen-theme';

type ThemeContextValue = {
  mode: ThemeMode;
  colors: ReturnType<typeof getThemeColors>;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

async function readStoredMode(): Promise<ThemeMode | null> {
  try {
    const value = await SecureStore.getItemAsync(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    void readStoredMode().then((stored) => {
      if (stored) {
        setModeState(stored);
        return;
      }
      if (systemScheme === 'light' || systemScheme === 'dark') {
        setModeState(systemScheme);
      }
    });
  }, [systemScheme]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    void SecureStore.setItemAsync(STORAGE_KEY, next);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((current) => {
      const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
      void SecureStore.setItemAsync(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const colors = useMemo(() => getThemeColors(mode), [mode]);

  const value = useMemo(
    () => ({ mode, colors, setMode, toggleMode }),
    [mode, colors, setMode, toggleMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within ThemeProvider');
  return ctx;
}
