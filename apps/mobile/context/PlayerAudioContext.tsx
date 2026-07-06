import { createContext, useContext, type ReactNode } from 'react';
import { useAudioEngine } from '@/hooks/useAudioEngine';

type AudioEngine = ReturnType<typeof useAudioEngine>;

const AudioEngineContext = createContext<AudioEngine | null>(null);

export function PlayerAudioProvider({ children }: { children: ReactNode }) {
  const engine = useAudioEngine();
  return <AudioEngineContext.Provider value={engine}>{children}</AudioEngineContext.Provider>;
}

export function useAudioEngineContext(): AudioEngine {
  const ctx = useContext(AudioEngineContext);
  if (!ctx) throw new Error('useAudioEngineContext must be used within PlayerAudioProvider');
  return ctx;
}
