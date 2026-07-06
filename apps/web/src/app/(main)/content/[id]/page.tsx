'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { CoverImage } from '@/components/CoverImage';
import { PaywallModal } from '@/components/PaywallModal';
import { RelatedContentSection } from '@/components/RelatedContentSection';
import { usePlayerStore } from '@/store/player';
import { apiFetch } from '@/lib/api';
import { isPremiumError } from '@/lib/premium';

interface Episode {
  id: string;
  title: string;
  duration: number;
  episodeNumber: number;
  isVideo?: boolean;
}

interface ContentDetail {
  id: string;
  title: string;
  description: string;
  type: string;
  coverUrl?: string | null;
  isPremium: boolean;
  episodes: Episode[];
  creator: { displayName: string; id: string };
}

export default function ContentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { accessToken, playEpisode } = usePlayerStore();
  const [content, setContent] = useState<ContentDetail | null>(null);
  const [inLibrary, setInLibrary] = useState(false);
  const [following, setFollowing] = useState(false);
  const [toast, setToast] = useState('');
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [pendingEpisode, setPendingEpisode] = useState<Episode | null>(null);

  useEffect(() => {
    apiFetch<ContentDetail>(`/contents/${id}`).then((res) => {
      if (res.data) setContent(res.data);
    });
  }, [id]);

  useEffect(() => {
    if (!accessToken) return;
    apiFetch<Array<{ content: { id: string } }>>('/user/library', {}, accessToken).then((res) => {
      if (res.data) setInLibrary(res.data.some((item) => item.content.id === id));
    });
    apiFetch<Array<{ creator: { id: string } }>>('/user/following', {}, accessToken).then((res) => {
      if (res.data && content) {
        setFollowing(res.data.some((f) => f.creator.id === content.creator.id));
      }
    });
  }, [accessToken, id, content]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const toggleLibrary = async () => {
    if (!accessToken) {
      router.push('/login');
      return;
    }
    if (inLibrary) {
      const res = await apiFetch(`/user/library/${id}`, { method: 'DELETE' }, accessToken);
      if (res.success) {
        setInLibrary(false);
        showToast('از کتابخانه حذف شد');
      } else {
        showToast(res.error?.message || 'خطا');
      }
      return;
    }
    const res = await apiFetch(`/user/library/${id}`, { method: 'POST' }, accessToken);
    if (res.success) {
      setInLibrary(true);
      showToast('به کتابخانه اضافه شد');
    } else {
      showToast(res.error?.message || 'خطا');
    }
  };

  const toggleFollow = async () => {
    if (!accessToken || !content) {
      router.push('/login');
      return;
    }
    const path = `/user/follow/${content.creator.id}`;
    const res = await apiFetch(path, { method: following ? 'DELETE' : 'POST' }, accessToken);
    if (res.success) {
      setFollowing(!following);
      showToast(following ? 'لغو دنبال کردن' : 'سازنده را دنبال می‌کنید');
    }
  };

  const handlePlay = async (episode: Episode) => {
    if (!accessToken) {
      router.push('/login');
      return;
    }
    const res = await apiFetch<{ url: string }>(`/media/stream/${episode.id}`, {}, accessToken);
    if (!res.success || !res.data?.url) {
      if (isPremiumError(res.error?.message, res.error?.code)) {
        setPendingEpisode(episode);
        setPaywallOpen(true);
      } else {
        showToast(res.error?.message || 'خطا در پخش');
      }
      return;
    }
    if (content?.type === 'VIDEO' || episode.isVideo) {
      router.push(`/video/${episode.id}`);
      return;
    }
    playEpisode(
      {
        id: episode.id,
        title: episode.title,
        duration: episode.duration,
        contentTitle: content?.title,
        coverUrl: content?.coverUrl,
      },
      res.data.url,
    );
  };

  const handlePaywallUnlocked = () => {
    if (pendingEpisode) void handlePlay(pendingEpisode);
  };

  if (!content) {
    return <p className="search-status">در حال بارگذاری...</p>;
  }

  return (
    <>
      {toast && <div className="toast-banner">{toast}</div>}
      <div className="content-hero-cover">
        <CoverImage
          coverUrl={content.coverUrl}
          type={content.type}
          title={content.title}
          sizes="200px"
          priority
        />
      </div>
      <h1 className="section-title">{content.title}</h1>
      <p className="section-subtitle">
        {content.creator.displayName} · {content.type}
        {content.isPremium && ' · پریمیوم'}
      </p>

      <div className="content-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={toggleLibrary}
          aria-pressed={inLibrary}
          aria-label={inLibrary ? 'در کتابخانه' : 'ذخیره در کتابخانه'}
        >
          {inLibrary ? '✓ در کتابخانه' : 'ذخیره در کتابخانه'}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={toggleFollow}
          aria-pressed={following}
          aria-label={following ? 'دنبال می‌کنید' : 'دنبال کردن سازنده'}
        >
          {following ? '✓ دنبال می‌کنید' : 'دنبال کردن سازنده'}
        </button>
      </div>

      {content.description && <p className="content-desc">{content.description}</p>}

      <h2 className="section-heading">اپیزودها</h2>
      <ul className="episode-list" aria-label="فهرست اپیزودها">
        {content.episodes.map((ep) => (
          <li key={ep.id}>
            <button
              type="button"
              className="episode-item"
              onClick={() => handlePlay(ep)}
              aria-label={`پخش اپیزود ${ep.episodeNumber}: ${ep.title}، ${Math.floor(ep.duration / 60)} دقیقه`}
            >
              <span>
                {ep.episodeNumber}. {ep.title}
              </span>
              <span className="text-muted">{Math.floor(ep.duration / 60)} دقیقه ▶</span>
            </button>
          </li>
        ))}
      </ul>

      <RelatedContentSection contentId={content.id} />

      <PaywallModal
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        contentId={content.id}
        contentTitle={content.title}
        onUnlocked={handlePaywallUnlocked}
      />
    </>
  );
}
