import { API_URL } from '@/lib/http';

type UploadResponse = {
  mediaUrl: string;
  mediaKey: string;
};

export async function uploadMediaFile(
  file: File,
  accessToken: string,
): Promise<{ mediaUrl: string; mediaKey: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/creator/media/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });

  const body = (await res.json()) as {
    success: boolean;
    data?: UploadResponse;
    error?: { message: string };
  };

  if (!body.success || !body.data) {
    throw new Error(body.error?.message || 'خطا در آپلود فایل');
  }

  return body.data;
}

export function getMediaDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video/');
    const media = document.createElement(isVideo ? 'video' : 'audio');

    const cleanup = () => {
      URL.revokeObjectURL(url);
      media.removeAttribute('src');
      media.load();
    };

    media.preload = 'metadata';
    media.onloadedmetadata = () => {
      const duration = Number.isFinite(media.duration) ? Math.floor(media.duration) : 0;
      cleanup();
      resolve(duration);
    };
    media.onerror = () => {
      cleanup();
      resolve(0);
    };
    media.src = url;
  });
}

export function isVideoFile(file: File, contentType: string): boolean {
  if (file.type.startsWith('video/')) return true;
  if (contentType === 'VIDEO') return true;
  return /\.(mp4|webm|mov|m4v)$/i.test(file.name);
}
