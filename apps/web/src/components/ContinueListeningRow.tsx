'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CoverImage } from '@/components/CoverImage';
import { ProgressBar } from '@/components/ProgressBar';
import { usePlayerStore } from '@/store/player';
import { apiFetch } from '@/lib/api';

export function ContinueListeningRow() {
  const accessToken = usePlayerStore((s) => s.accessToken);
  const [items, setItems] = useState<
    Array<{
      position: number;
      episode: {
        id: string;
        title: string;
        duration: number;
        content: { id: string; title: string; type: string; coverUrl?: string | null };
      };
    }>
  >([]);

  useEffect(() => {
    if (!accessToken) return;
    apiFetch<typeof items>('/media/continue', {}, accessToken).then((r) => {
      if (r.data) setItems(r.data);
    });
  }, [accessToken]);

  if (!accessToken || items.length === 0) return null;

  return (
    <section className="continue-section" aria-label="ادامه گوش دادن">
      <div className="section-row">
        <h2 className="section-heading">ادامه گوش دادن</h2>
        <Link href="/library" className="section-link">
          همه
        </Link>
      </div>
      <div className="continue-scroll">
        {items.map((item) => (
          <Link
            key={item.episode.id}
            href={`/content/${item.episode.content.id}`}
            className="continue-card"
            aria-label={`ادامه گوش دادن: ${item.episode.title} از ${item.episode.content.title}`}
          >
            <div className="continue-card-inner">
              <div className="continue-card-cover">
                <CoverImage
                  coverUrl={item.episode.content.coverUrl}
                  type={item.episode.content.type}
                  title={item.episode.content.title}
                  sizes="48px"
                />
              </div>
              <div className="continue-card-body">
                <span className="continue-card-title">{item.episode.title}</span>
                <span className="continue-card-meta">{item.episode.content.title}</span>
                <ProgressBar
                  value={item.position}
                  max={item.episode.duration || 1}
                  label={`پیشرفت ${item.episode.title}`}
                  className="continue-progress"
                  readOnly
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
