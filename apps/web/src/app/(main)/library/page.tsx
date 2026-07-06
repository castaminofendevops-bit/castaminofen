'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CoverImage } from '@/components/CoverImage';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { usePlayerStore } from '@/store/player';
import { apiFetch } from '@/lib/api';
import { formatPlaybackTime } from '@/lib/env';

export default function LibraryPage() {
  const accessToken = usePlayerStore((s) => s.accessToken);
  const [library, setLibrary] = useState<
    Array<{ content: { id: string; title: string; type: string; coverUrl?: string | null } }>
  >([]);
  const [continueItems, setContinueItems] = useState<
    Array<{
      position: number;
      episode: {
        id: string;
        title: string;
        content: { title: string; id: string; type: string; coverUrl?: string | null };
      };
    }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);

    const [libRes, contRes] = await Promise.all([
      apiFetch<typeof library>('/user/library', {}, accessToken),
      apiFetch<typeof continueItems>('/media/continue', {}, accessToken),
    ]);

    if (!libRes.success || !contRes.success) {
      setError(libRes.error?.message || contRes.error?.message || 'خطا در بارگذاری کتابخانه');
      setLoading(false);
      return;
    }

    if (libRes.data) setLibrary(libRes.data);
    if (contRes.data) setContinueItems(contRes.data);
    setLoading(false);
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!accessToken) {
    return (
      <EmptyState
        title="کتابخانه شخصی"
        description="برای ذخیره محتوا و ادامه گوش دادن وارد حساب شوید."
        actionLabel="ورود"
        onAction={() => {
          window.location.href = '/login';
        }}
      />
    );
  }

  return (
    <>
      <h1 className="section-title">کتابخانه</h1>

      {error ? <ErrorBanner message={error} onRetry={load} /> : null}
      {loading && <p className="search-status">در حال بارگذاری...</p>}

      {continueItems.length > 0 && (
        <>
          <h2 className="section-heading">ادامه گوش دادن</h2>
          <ul className="library-list">
            {continueItems.map((item) => (
              <li key={item.episode.id}>
                <Link href={`/content/${item.episode.content.id}`} className="library-row">
                  <CoverImage
                    coverUrl={item.episode.content.coverUrl}
                    type={item.episode.content.type}
                    title={item.episode.content.title}
                    sizes="56px"
                  />
                  <span className="library-row-body">
                    <span className="library-row-title">{item.episode.title}</span>
                    <span className="library-row-meta">
                      {item.episode.content.title} · {formatPlaybackTime(item.position)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2 className="section-heading spaced">ذخیره‌شده‌ها</h2>
      {!loading && library.length === 0 && !error ? (
        <EmptyState title="کتابخانه خالی است" description="از صفحه محتوا، «ذخیره در کتابخانه» را بزنید." />
      ) : (
        <ul className="library-list">
          {library.map((item) => (
            <li key={item.content.id}>
              <Link href={`/content/${item.content.id}`} className="library-row">
                <CoverImage
                  coverUrl={item.content.coverUrl}
                  type={item.content.type}
                  title={item.content.title}
                  sizes="56px"
                />
                <span className="library-row-body">
                  <span className="library-row-title">{item.content.title}</span>
                  <span className="library-row-meta">{item.content.type}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
