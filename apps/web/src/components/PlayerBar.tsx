'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/player';
import { apiFetch } from '@/lib/api';
import { ProgressBar } from '@/components/ProgressBar';
import { formatPlaybackTime } from '@/lib/env';
import { PLAYBACK_SPEEDS, SLEEP_TIMER_OPTIONS } from '@castaminofen/shared';

const SKIP_SECONDS = 15;

export function PlayerBar() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const syncTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const {
    currentEpisode,
    streamUrl,
    isPlaying,
    position,
    playbackSpeed,
    sleepTimerEnd,
    accessToken,
    togglePlay,
    setPosition,
    setSpeed,
    setSleepTimer,
  } = usePlayerStore();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying, streamUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  useEffect(() => {
    if (!sleepTimerEnd) return;
    const interval = setInterval(() => {
      if (Date.now() >= sleepTimerEnd) {
        usePlayerStore.setState({ isPlaying: false });
        setSleepTimer(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [sleepTimerEnd, setSleepTimer]);

  useEffect(() => {
    if (!accessToken || !currentEpisode) return;
    syncTimer.current = setInterval(() => {
      void syncPlayback(Math.floor(position));
    }, 30000);
    return () => {
      if (syncTimer.current) clearInterval(syncTimer.current);
    };
  }, [accessToken, currentEpisode, position, playbackSpeed]);

  const syncPlayback = async (pos: number) => {
    if (!accessToken || !currentEpisode) return;
    await apiFetch(
      `/media/playback/${currentEpisode.id}`,
      {
        method: 'POST',
        body: JSON.stringify({ position: pos, playbackSpeed }),
      },
      accessToken,
    );
  };

  if (!currentEpisode) return null;

  const duration = currentEpisode.duration || 0;
  const remaining = Math.max(0, duration - position);

  const handleSeek = (newPos: number) => {
    if (audioRef.current) audioRef.current.currentTime = newPos;
    setPosition(newPos);
  };

  const skip = (delta: number) => {
    const next = Math.min(Math.max(0, position + delta), duration || position + delta);
    handleSeek(next);
  };

  return (
    <div className="player-bar" role="region" aria-label="نوار پخش">
      {streamUrl && (
        <audio
          ref={audioRef}
          src={streamUrl}
          onTimeUpdate={(e) => setPosition(e.currentTarget.currentTime)}
          onPause={() => syncPlayback(Math.floor(audioRef.current?.currentTime ?? position))}
          onEnded={() => {
            togglePlay();
            syncPlayback(currentEpisode.duration);
          }}
        />
      )}
      <div className="player-info">
        <div className="player-title">{currentEpisode.title}</div>
        <div className="player-subtitle">{currentEpisode.contentTitle}</div>
      </div>
      <div className="player-controls">
        <button
          type="button"
          className="btn-icon player-skip"
          onClick={() => skip(-SKIP_SECONDS)}
          aria-label={`${SKIP_SECONDS} ثانیه به عقب`}
        >
          −{SKIP_SECONDS}
        </button>
        <button
          type="button"
          className="btn-icon btn-play"
          onClick={togglePlay}
          aria-label={isPlaying ? 'توقف' : 'پخش'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          type="button"
          className="btn-icon player-skip"
          onClick={() => skip(SKIP_SECONDS)}
          aria-label={`${SKIP_SECONDS} ثانیه به جلو`}
        >
          +{SKIP_SECONDS}
        </button>
        <div className="player-time-row">
          <span className="player-time" aria-hidden="true">
            {formatPlaybackTime(position)}
          </span>
          <ProgressBar
            value={position}
            max={duration || 1}
            onChange={handleSeek}
            label={`پیشرفت پخش: ${currentEpisode.title}`}
            className="player-progress"
          />
          <span className="player-time" aria-hidden="true">
            −{formatPlaybackTime(remaining)}
          </span>
        </div>
        <select
          value={playbackSpeed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          className="player-select"
          aria-label="سرعت پخش"
        >
          {PLAYBACK_SPEEDS.map((s) => (
            <option key={s} value={s}>
              {s}x
            </option>
          ))}
        </select>
        <select
          onChange={(e) => setSleepTimer(e.target.value ? parseInt(e.target.value, 10) : null)}
          defaultValue=""
          className="player-select"
          aria-label="تایمر خواب"
        >
          <option value="">تایمر</option>
          {SLEEP_TIMER_OPTIONS.map((m) => (
            <option key={m} value={m}>
              {m} دقیقه
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
