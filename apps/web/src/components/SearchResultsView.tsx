'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ContentCard } from '@/components/ContentCard';
import { ContentTypeIcon } from '@/components/ContentTypeIcon';
import type { SearchResults } from '@/lib/search';

interface SearchResultsViewProps {
  results: SearchResults;
}

function formatDuration(seconds: number) {
  if (!seconds) return '';
  return `${Math.floor(seconds / 60)} دقیقه`;
}

export function SearchResultsView({ results }: SearchResultsViewProps) {
  const router = useRouter();

  return (
    <div className="search-results">
      {results.creators.length > 0 ? (
        <section className="search-section" aria-label="سازندگان">
          <h2 className="search-section-title">سازندگان</h2>
          <ul className="search-list">
            {results.creators.map((creator) => (
              <li key={creator.id}>
                <button
                  type="button"
                  className="search-row search-row-creator"
                  onClick={() => router.push(`/search?q=${encodeURIComponent(creator.displayName)}`)}
                >
                  <span className="search-row-avatar" aria-hidden="true">
                    {creator.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={creator.avatarUrl} alt="" />
                    ) : (
                      <span className="search-avatar-fallback">{creator.displayName.charAt(0)}</span>
                    )}
                  </span>
                  <span className="search-row-body">
                    <span className="search-row-title">
                      {creator.displayName}
                      {creator.isVerified ? ' ✓' : ''}
                    </span>
                    <span className="search-row-meta">@{creator.slug}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {results.episodes.length > 0 ? (
        <section className="search-section" aria-label="اپیزودها">
          <h2 className="search-section-title">اپیزودها</h2>
          <ul className="search-list">
            {results.episodes.map((episode) => (
              <li key={episode.id}>
                <Link href={`/content/${episode.contentId}`} className="search-row search-row-episode">
                  <span className="search-row-icon" aria-hidden="true">
                    {episode.isVideo ? (
                      <ContentTypeIcon type="VIDEO" size={28} />
                    ) : (
                      <ContentTypeIcon type="PODCAST" size={28} />
                    )}
                  </span>
                  <span className="search-row-body">
                    <span className="search-row-title">{episode.title}</span>
                    <span className="search-row-meta">
                      {episode.contentTitle}
                      {episode.duration ? ` · ${formatDuration(episode.duration)}` : ''}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {results.contents.length > 0 ? (
        <section className="search-section" aria-label="محتوا">
          <h2 className="search-section-title">محتوا</h2>
          <div className="content-grid">
            {results.contents.map((c) => (
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
        </section>
      ) : null}
    </div>
  );
}
