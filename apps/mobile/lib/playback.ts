import { apiFetch } from '@/lib/api';

export async function syncPlaybackPosition(
  accessToken: string,
  episodeId: string,
  position: number,
  playbackSpeed: number,
  duration?: number,
) {
  await apiFetch(
    `/media/playback/${episodeId}`,
    {
      method: 'POST',
      body: JSON.stringify({
        position: Math.floor(position),
        duration,
        playbackSpeed,
      }),
    },
    accessToken,
  );
}
