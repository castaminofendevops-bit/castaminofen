'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { getMediaDuration, isVideoFile, uploadMediaFile } from '@/lib/upload';

interface EpisodeUploadFormProps {
  contentId: string;
  contentType: string;
  nextEpisodeNumber: number;
  accessToken: string;
  onSuccess: () => void;
  onToast: (message: string) => void;
}

export function EpisodeUploadForm({
  contentId,
  contentType,
  nextEpisodeNumber,
  accessToken,
  onSuccess,
  onToast,
}: EpisodeUploadFormProps) {
  const [title, setTitle] = useState('');
  const [episodeNumber, setEpisodeNumber] = useState(nextEpisodeNumber);
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setEpisodeNumber(nextEpisodeNumber);
  }, [nextEpisodeNumber]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setMediaUrl('');
    setError('');
    if (selected && !title.trim()) {
      setTitle(selected.name.replace(/\.[^.]+$/, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('عنوان اپیزود الزامی است');
      return;
    }
    if (!file && !mediaUrl.trim()) {
      setError('فایل رسانه یا آدرس URL را وارد کنید');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let resolvedMediaUrl = mediaUrl.trim();
      let duration = 0;
      let isVideo = contentType === 'VIDEO';

      if (file) {
        duration = await getMediaDuration(file);
        isVideo = isVideoFile(file, contentType);
        const uploaded = await uploadMediaFile(file, accessToken);
        resolvedMediaUrl = uploaded.mediaUrl;
      }

      const res = await apiFetch(
        `/creator/contents/${contentId}/episodes`,
        {
          method: 'POST',
          body: JSON.stringify({
            title: title.trim(),
            episodeNumber,
            description: description.trim() || undefined,
            duration: duration || undefined,
            mediaUrl: resolvedMediaUrl,
            isVideo,
          }),
        },
        accessToken,
      );

      if (!res.success) {
        setError(res.error?.message || 'خطا در افزودن اپیزود');
        return;
      }

      onToast('اپیزود اضافه شد');
      setTitle('');
      setDescription('');
      setMediaUrl('');
      setFile(null);
      setEpisodeNumber((n) => n + 1);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در آپلود');
    } finally {
      setLoading(false);
    }
  };

  const accept =
    contentType === 'VIDEO' ? 'video/*,audio/*' : 'audio/*,video/mp4';

  return (
    <form className="episode-upload-form" onSubmit={handleSubmit}>
      <h3 className="episode-upload-title">افزودن اپیزود</h3>

      <div className="form-group">
        <label className="form-label" htmlFor={`ep-title-${contentId}`}>
          عنوان اپیزود
        </label>
        <input
          id={`ep-title-${contentId}`}
          className="form-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor={`ep-num-${contentId}`}>
            شماره
          </label>
          <input
            id={`ep-num-${contentId}`}
            className="form-input"
            type="number"
            min={1}
            value={episodeNumber}
            onChange={(e) => setEpisodeNumber(Number(e.target.value))}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group form-group-grow">
          <label className="form-label" htmlFor={`ep-file-${contentId}`}>
            فایل رسانه
          </label>
          <input
            id={`ep-file-${contentId}`}
            className="form-input file-input"
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={loading}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor={`ep-url-${contentId}`}>
          یا آدرس URL (اختیاری اگر فایل ندارید)
        </label>
        <input
          id={`ep-url-${contentId}`}
          className="form-input"
          type="url"
          dir="ltr"
          placeholder="https://..."
          value={mediaUrl}
          onChange={(e) => {
            setMediaUrl(e.target.value);
            if (e.target.value) setFile(null);
          }}
          disabled={loading || !!file}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor={`ep-desc-${contentId}`}>
          توضیحات (اختیاری)
        </label>
        <textarea
          id={`ep-desc-${contentId}`}
          className="form-input form-textarea"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
        />
      </div>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <button className="btn-primary" type="submit" disabled={loading}>
        {loading ? 'در حال آپلود…' : 'افزودن اپیزود'}
      </button>
    </form>
  );
}
