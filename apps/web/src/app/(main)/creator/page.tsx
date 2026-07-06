'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePlayerStore } from '@/store/player';
import { apiFetch } from '@/lib/api';
import { CreatorContentCard } from '@/components/CreatorContentCard';

type CreatorContent = {
  id: string;
  title: string;
  type: string;
  status: string;
  _count?: { episodes: number };
};

export default function CreatorPage() {
  const accessToken = usePlayerStore((s) => s.accessToken);
  const user = usePlayerStore((s) => s.user);
  const isCreator = user?.role === 'CREATOR' || user?.role === 'ADMIN';
  const [contents, setContents] = useState<CreatorContent[]>([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('PODCAST');
  const [toast, setToast] = useState('');
  const [creating, setCreating] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const loadContents = useCallback(async () => {
    if (!accessToken || !isCreator) return;
    const r = await apiFetch<CreatorContent[]>('/creator/contents', {}, accessToken);
    if (r.data) setContents(r.data);
  }, [accessToken, isCreator]);

  useEffect(() => {
    loadContents();
  }, [loadContents]);

  const createContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !title.trim()) return;
    setCreating(true);
    const res = await apiFetch(
      '/creator/contents',
      {
        method: 'POST',
        body: JSON.stringify({ title: title.trim(), type }),
      },
      accessToken,
    );
    setCreating(false);
    if (res.success) {
      setTitle('');
      showToast('محتوا ایجاد شد');
      loadContents();
    } else {
      showToast(res.error?.message || 'خطا در ایجاد');
    }
  };

  const publish = async (id: string) => {
    if (!accessToken) return;
    const res = await apiFetch(`/creator/contents/${id}/publish`, { method: 'POST' }, accessToken);
    if (res.success) {
      showToast('محتوا منتشر شد');
      loadContents();
    } else {
      showToast(res.error?.message || 'خطا در انتشار');
    }
  };

  return (
    <>
      {toast ? <div className="toast-banner">{toast}</div> : null}
      <h1 className="section-title">پنل سازنده</h1>
      <p className="section-subtitle">محتوا بسازید، اپیزود آپلود کنید و منتشر کنید.</p>

      {!accessToken ? (
        <p>
          برای دسترسی به پنل سازنده <Link href="/login">وارد شوید</Link>
        </p>
      ) : !isCreator ? (
        <div>
          <p>این بخش فقط برای حساب سازنده است.</p>
          <p className="section-subtitle">اگر مایل هستید می‌توانید درخواست تبدیل به سازنده را ارسال کنید.</p>
          <Link href="/creator/request" className="btn-primary" style={{ display: 'inline-flex', marginTop: '1rem' }}>
            درخواست سازنده
          </Link>
        </div>
      ) : (
        <>
          <form onSubmit={createContent} className="creator-form">
            <div className="form-group">
              <label className="form-label" htmlFor="content-title">
                عنوان محتوا
              </label>
              <input
                id="content-title"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={creating}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="content-type">
                نوع
              </label>
              <select
                id="content-type"
                className="form-input"
                value={type}
                onChange={(e) => setType(e.target.value)}
                disabled={creating}
              >
                <option value="PODCAST">پادکست</option>
                <option value="AUDIOBOOK">کتاب صوتی</option>
                <option value="VIDEO">ویدیو</option>
              </select>
            </div>
            <button className="btn-primary" type="submit" disabled={creating}>
              {creating ? 'در حال ایجاد…' : 'ایجاد محتوا'}
            </button>
          </form>

          <h2 className="section-heading spaced">محتوای من</h2>
          {contents.length === 0 ? (
            <p className="creator-empty">هنوز محتوایی نساخته‌اید.</p>
          ) : (
            <ul className="plain-list creator-list">
              {contents.map((c) => (
                <CreatorContentCard
                  key={c.id}
                  content={c}
                  accessToken={accessToken}
                  onToast={showToast}
                  onPublish={publish}
                  onRefreshList={loadContents}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}
