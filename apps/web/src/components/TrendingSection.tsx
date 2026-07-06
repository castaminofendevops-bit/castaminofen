'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ContentCard } from '@/components/ContentCard';
import { apiFetch } from '@/lib/api';

interface ContentItem {
  id: string;
  title: string;
  type: string;
  coverUrl?: string | null;
  episodeCount: number;
  isPremium: boolean;
  creator: { displayName: string };
}

export function TrendingSection() {
  const [items, setItems] = useState<ContentItem[]>([]);

  useEffect(() => {
    void apiFetch<ContentItem[]>('/trending').then((res) => {
      if (res.data) setItems(res.data);
    });
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="trending-section" aria-label="ترند">
      <div className="section-row">
        <h2 className="section-heading">ترند</h2>
        <Link href="/search" className="section-link">
          جستجو
        </Link>
      </div>
      <div className="trending-scroll">
        {items.map((item) => (
          <ContentCard
            key={item.id}
            id={item.id}
            title={item.title}
            type={item.type}
            coverUrl={item.coverUrl}
            episodeCount={item.episodeCount}
            isPremium={item.isPremium}
            creatorName={item.creator.displayName}
          />
        ))}
      </div>
    </section>
  );
}
