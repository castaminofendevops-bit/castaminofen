'use client';

import Link from 'next/link';
import { CoverImage } from './CoverImage';

interface ContentCardProps {
  id: string;
  title: string;
  type: string;
  coverUrl?: string | null;
  episodeCount: number;
  isPremium: boolean;
  creatorName: string;
}

export function ContentCard({
  id,
  title,
  type,
  coverUrl,
  episodeCount,
  isPremium,
  creatorName,
}: ContentCardProps) {
  return (
    <Link href={`/content/${id}`} className="content-card">
      <div className="content-card-cover">
        <CoverImage coverUrl={coverUrl} type={type} title={title} />
      </div>
      <div className="content-card-body">
        <div className="content-card-title">{title}</div>
        <div className="content-card-meta">
          {creatorName} · {episodeCount} اپیزود
          {isPremium && ' · '}
          {isPremium && <span className="badge">پریمیوم</span>}
        </div>
      </div>
    </Link>
  );
}
