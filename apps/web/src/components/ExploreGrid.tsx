'use client';

import { useCallback, useEffect, useState } from 'react';
import { ContentCard } from '@/components/ContentCard';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { ContentGridSkeleton } from '@/components/Skeleton';
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

interface ExploreGridProps {
  initialContents?: ContentItem[];
  initialError?: string | null;
}

export function ExploreGrid({ initialContents, initialError }: ExploreGridProps) {
  const [contents, setContents] = useState<ContentItem[]>(initialContents ?? []);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [loading, setLoading] = useState(!initialContents && !initialError);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await apiFetch<ContentItem[]>('/explore');
    if (res.success && res.data) {
      setContents(res.data);
    } else {
      setError(res.error?.message || 'خطا در بارگذاری محتوا');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!initialContents && !initialError) {
      void load();
    }
  }, [initialContents, initialError, load]);

  if (loading) return <ContentGridSkeleton />;

  return (
    <>
      {error ? <ErrorBanner message={error} onRetry={load} /> : null}
      {contents.length === 0 && !error ? (
        <EmptyState
          title="فعلاً محتوایی برای نمایش نیست"
          description="به‌زودی پادکست و کتاب صوتی جدید اضافه می‌شود."
          devHint="برای توسعه: pnpm docker:up && pnpm --filter @castaminofen/api-gateway dev"
        />
      ) : (
        <div className="content-grid">
          {contents.map((c) => (
            <ContentCard
              key={c.id}
              id={c.id}
              title={c.title}
              type={c.type}
              coverUrl={c.coverUrl}
              episodeCount={c.episodeCount}
              isPremium={c.isPremium}
              creatorName={c.creator.displayName}
            />
          ))}
        </div>
      )}
    </>
  );
}
