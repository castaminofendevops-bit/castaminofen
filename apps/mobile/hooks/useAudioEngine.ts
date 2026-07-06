import { useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import { usePlayerStore } from '@/store/player';
import { syncPlaybackPosition } from '@/lib/playback';

/** Keeps expo-av playback in sync with the player store — mount once at tab root. */
export function useAudioEngine() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const syncRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const streamUrl = usePlayerStore((s) => s.streamUrl);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playbackSpeed = usePlayerStore((s) => s.playbackSpeed);
  const sleepTimerEnd = usePlayerStore((s) => s.sleepTimerEnd);
  const currentEpisode = usePlayerStore((s) => s.currentEpisode);
  const position = usePlayerStore((s) => s.position);
  const accessToken = usePlayerStore((s) => s.accessToken);
  const setPosition = usePlayerStore((s) => s.setPosition);
  const setSleepTimer = usePlayerStore((s) => s.setSleepTimer);

  useEffect(() => () => { void soundRef.current?.unloadAsync(); }, []);

  useEffect(() => {
    if (!streamUrl) return;
    (async () => {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: true });
      if (soundRef.current) await soundRef.current.unloadAsync();
      const { sound } = await Audio.Sound.createAsync(
        { uri: streamUrl },
        { shouldPlay: isPlaying, rate: playbackSpeed, shouldCorrectPitch: true },
        (status) => {
          if (status.isLoaded) setPosition(status.positionMillis / 1000);
        },
      );
      soundRef.current = sound;
    })();
  }, [streamUrl, setPosition]);

  useEffect(() => {
    if (!soundRef.current) return;
    if (isPlaying) void soundRef.current.playAsync();
    else void soundRef.current.pauseAsync();
  }, [isPlaying]);

  useEffect(() => {
    void soundRef.current?.setRateAsync(playbackSpeed, true);
  }, [playbackSpeed]);

  useEffect(() => {
    if (!sleepTimerEnd) return;
    const timer = setInterval(() => {
      if (Date.now() >= sleepTimerEnd) {
        usePlayerStore.setState({ isPlaying: false });
        setSleepTimer(null);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [sleepTimerEnd, setSleepTimer]);

  useEffect(() => {
    if (!accessToken || !currentEpisode) return;
    syncRef.current = setInterval(() => {
      void syncPlaybackPosition(accessToken, currentEpisode.id, position, playbackSpeed, currentEpisode.duration);
    }, 30000);
    return () => {
      if (syncRef.current) clearInterval(syncRef.current);
    };
  }, [accessToken, currentEpisode, position, playbackSpeed]);

  const seekTo = useCallback(async (percent: number) => {
    const ep = usePlayerStore.getState().currentEpisode;
    if (!ep) return;
    const next = percent * ep.duration;
    setPosition(next);
    await soundRef.current?.setPositionAsync(next * 1000);
  }, [setPosition]);

  const skipForward = useCallback(async (seconds = 15) => {
    const { position: pos, currentEpisode: ep } = usePlayerStore.getState();
    const next = Math.min(pos + seconds, ep?.duration ?? 0);
    usePlayerStore.getState().skipForward(seconds);
    await soundRef.current?.setPositionAsync(next * 1000);
  }, []);

  const skipBackward = useCallback(async (seconds = 15) => {
    const { position: pos } = usePlayerStore.getState();
    const next = Math.max(0, pos - seconds);
    usePlayerStore.getState().skipBackward(seconds);
    await soundRef.current?.setPositionAsync(next * 1000);
  }, []);

  return { seekTo, skipForward, skipBackward };
}
