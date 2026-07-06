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

interface RelatedContentSectionProps {
  contentId: string;
}

export function RelatedContentSection({ contentId }: RelatedContentSectionProps) {
  const [items, setItems] = useState<ContentItem[]>([]);

  useEffect(() => {
    void apiFetch<ContentItem[]>(`/contents/${contentId}/related`).then((res) => {
      if (res.data) setItems(res.data);
    });
  }, [contentId]);

  if (items.length === 0) return null;

  return (
    <section className="related-section" aria-label="محتوای مرتبط">
      <h2 className="section-heading spaced">محتوای مرتبط</h2>
      <div className="related-grid">
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
      <Link href="/search" className="section-link related-more">
        کاوش بیشتر
      </Link>
    </section>
  );
}
