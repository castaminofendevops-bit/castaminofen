'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { EpisodeUploadForm } from '@/components/EpisodeUploadForm';

type CreatorContentSummary = {
  id: string;
  title: string;
  type: string;
  status: string;
  _count?: { episodes: number };
};

type CreatorEpisode = {
  id: string;
  title: string;
  episodeNumber: number;
  duration: number;
  isVideo: boolean;
};

interface CreatorContentCardProps {
  content: CreatorContentSummary;
  accessToken: string;
  onToast: (message: string) => void;
  onPublish: (id: string) => void;
  onRefreshList: () => void;
}

export function CreatorContentCard({
  content,
  accessToken,
  onToast,
  onPublish,
  onRefreshList,
}: CreatorContentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [episodes, setEpisodes] = useState<CreatorEpisode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  const episodeCount = content._count?.episodes ?? episodes.length;

  const loadEpisodes = useCallback(async () => {
    setLoadingEpisodes(true);
    const res = await apiFetch<{ episodes: CreatorEpisode[] }>(
      `/creator/contents/${content.id}`,
      {},
      accessToken,
    );
    if (res.success && res.data?.episodes) {
      setEpisodes(res.data.episodes);
    }
    setLoadingEpisodes(false);
  }, [accessToken, content.id]);

  useEffect(() => {
    if (expanded) loadEpisodes();
  }, [expanded, loadEpisodes]);

  const handlePublish = () => {
    if (episodeCount === 0) {
      onToast('حداقل یک اپیزود قبل از انتشار اضافه کنید');
      return;
    }
    if (!window.confirm(`«${content.title}» منتشر شود؟`)) return;
    onPublish(content.id);
  };

  const nextEpisodeNumber =
    episodes.length > 0 ? Math.max(...episodes.map((e) => e.episodeNumber)) + 1 : 1;

  return (
    <li className="creator-item creator-item-expanded">
      <div className="creator-item-header">
        <button
          type="button"
          className="creator-expand-btn"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          <span className="creator-expand-icon" aria-hidden="true">
            {expanded ? '▾' : '◂'}
          </span>
          <span>
            <strong>{content.title}</strong>
            <span className="creator-meta">
              {' '}
              — {content.type} · {content.status} · {episodeCount} اپیزود
            </span>
          </span>
        </button>
        {content.status === 'DRAFT' ? (
          <button type="button" className="btn-secondary compact" onClick={handlePublish}>
            انتشار
          </button>
        ) : null}
      </div>

      {expanded ? (
        <div className="creator-item-body">
          {loadingEpisodes ? (
            <p className="creator-loading">در حال بارگذاری اپیزودها…</p>
          ) : episodes.length > 0 ? (
            <ul className="creator-episode-list">
              {episodes.map((ep) => (
                <li key={ep.id} className="creator-episode-row">
                  <span>
                    {ep.episodeNumber}. {ep.title}
                  </span>
                  <span className="creator-episode-meta">
                    {ep.duration > 0 ? `${Math.floor(ep.duration / 60)} دقیقه` : '—'}
                    {ep.isVideo ? ' · ویدیو' : ''}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="creator-empty-episodes">هنوز اپیزودی اضافه نشده.</p>
          )}

          <EpisodeUploadForm
            contentId={content.id}
            contentType={content.type}
            nextEpisodeNumber={nextEpisodeNumber}
            accessToken={accessToken}
            onSuccess={() => {
              loadEpisodes();
              onRefreshList();
            }}
            onToast={onToast}
          />
        </div>
      ) : null}
    </li>
  );
}
