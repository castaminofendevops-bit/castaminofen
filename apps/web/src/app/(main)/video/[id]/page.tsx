'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { PaywallModal } from '@/components/PaywallModal';
import { usePlayerStore } from '@/store/player';
import { apiFetch } from '@/lib/api';
import { isPremiumError } from '@/lib/premium';

interface EpisodeDetail {
  id: string;
  title: string;
  duration: number;
  isVideo: boolean;
  content: {
    id: string;
    title: string;
    coverUrl?: string | null;
    isPremium: boolean;
  };
}

export default function VideoPlayerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const accessToken = usePlayerStore((s) => s.accessToken);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [episode, setEpisode] = useState<EpisodeDetail | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const loadStream = async () => {
    if (!accessToken) {
      setLoading(false);
      setError('برای تماشا وارد شوید');
      return;
    }

    setLoading(true);
    setError('');

    const [epRes, streamRes] = await Promise.all([
      apiFetch<EpisodeDetail>(`/episodes/${id}`),
      apiFetch<{ url: string }>(`/media/stream/${id}`, {}, accessToken),
    ]);

    if (epRes.success && epRes.data) {
      setEpisode(epRes.data);
    }

    if (!streamRes.success) {
      if (isPremiumError(streamRes.error?.message, streamRes.error?.code)) {
        setPaywallOpen(true);
      } else {
        setError(streamRes.error?.message || 'خطا در دریافت ویدیو');
      }
      setStreamUrl(null);
      setLoading(false);
      return;
    }

    setStreamUrl(streamRes.data?.url ?? null);
    setLoading(false);
  };

  useEffect(() => {
    void loadStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, accessToken, retryKey]);

  useEffect(() => {
    const video = videoRef.current;
    if (video && streamUrl) {
      void video.play().catch(() => {});
    }
  }, [streamUrl]);

  const handleUnlocked = () => {
    setRetryKey((k) => k + 1);
  };

  if (!accessToken) {
    return (
      <div className="video-page">
        <p>برای تماشای ویدیو <Link href="/login">وارد شوید</Link></p>
      </div>
    );
  }

  return (
    <div className="video-page">
      <div className="video-page-header">
        <button type="button" className="btn-secondary compact" onClick={() => router.back()}>
          بازگشت
        </button>
        {episode ? (
          <div className="video-page-titles">
            <h1 className="video-page-title">{episode.title}</h1>
            <p className="video-page-subtitle">{episode.content.title}</p>
          </div>
        ) : null}
      </div>

      <div className="video-player-wrap">
        {loading ? <p className="search-status">در حال بارگذاری ویدیو…</p> : null}
        {error ? <p className="form-error">{error}</p> : null}
        {streamUrl ? (
          <video
            ref={videoRef}
            className="video-player"
            src={streamUrl}
            controls
            playsInline
            preload="metadata"
            aria-label={episode?.title ?? 'پخش ویدیو'}
          />
        ) : null}
      </div>

      {episode ? (
        <div className="video-page-actions">
          <Link href={`/content/${episode.content.id}`} className="btn-secondary">
            مشاهده همه اپیزودها
          </Link>
        </div>
      ) : null}

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        contentId={episode?.content.id}
        contentTitle={episode?.content.title}
        onUnlocked={handleUnlocked}
      />
    </div>
  );
}
