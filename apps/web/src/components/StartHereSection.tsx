'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CoverImage } from '@/components/CoverImage';
import { usePlayerStore } from '@/store/player';
import { apiFetch } from '@/lib/api';

interface ContentPick {
  id: string;
  title: string;
  type: string;
  coverUrl?: string | null;
  creator: { displayName: string };
}

interface StartHereSectionProps {
  picks: ContentPick[];
}

export function StartHereSection({ picks }: StartHereSectionProps) {
  const accessToken = usePlayerStore((s) => s.accessToken);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      setVisible(false);
      return;
    }

    void Promise.all([
      apiFetch<Array<{ content: { id: string } }>>('/user/library', {}, accessToken),
      apiFetch<unknown[]>('/media/continue', {}, accessToken),
    ]).then(([libRes, contRes]) => {
      const libraryEmpty = !libRes.data?.length;
      const continueEmpty = !contRes.data?.length;
      setVisible(libraryEmpty && continueEmpty);
    });
  }, [accessToken]);

  if (!visible || picks.length === 0) return null;

  return (
    <section className="start-here-section" aria-label="شروع کنید">
      <div className="section-row">
        <div>
          <h2 className="section-heading">شروع کنید</h2>
          <p className="start-here-desc">کتابخانه‌تان خالی است — با یکی از این محتواها شروع کنید.</p>
        </div>
      </div>
      <div className="start-here-grid">
        {picks.slice(0, 4).map((item) => (
          <Link key={item.id} href={`/content/${item.id}`} className="start-here-card">
            <CoverImage coverUrl={item.coverUrl} type={item.type} title={item.title} sizes="120px" />
            <span className="start-here-card-title">{item.title}</span>
            <span className="start-here-card-meta">{item.creator.displayName}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
