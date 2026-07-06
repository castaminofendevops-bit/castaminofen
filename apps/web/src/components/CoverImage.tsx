'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ContentTypeIcon } from './ContentTypeIcon';
import { COVER_BLUR_DATA_URL } from '@/lib/image';

interface CoverImageProps {
  coverUrl?: string | null;
  type: string;
  title: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

export function CoverImage({
  coverUrl,
  type,
  title,
  sizes = '(max-width: 768px) 50vw, 160px',
  priority = false,
  className = '',
}: CoverImageProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(coverUrl) && !failed;

  if (!showImage) {
    return (
      <div className={`cover-fallback ${className}`.trim()} aria-hidden="true">
        <ContentTypeIcon type={type} />
      </div>
    );
  }

  return (
    <Image
      src={coverUrl!}
      alt={`کاور ${title}`}
      fill
      sizes={sizes}
      quality={75}
      placeholder="blur"
      blurDataURL={COVER_BLUR_DATA_URL}
      loading={priority ? undefined : 'lazy'}
      priority={priority}
      className={`cover-image ${className}`.trim()}
      onError={() => setFailed(true)}
    />
  );
}
