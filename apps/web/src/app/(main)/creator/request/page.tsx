'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePlayerStore } from '@/store/player';
import { API_URL, apiFetch } from '@/lib/api';

type CreatorRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

type RequestStatusData = {
  id: string;
  fullName: string;
  bio?: string | null;
  sampleUrl?: string | null;
  idFileUrl?: string | null;
  status: CreatorRequestStatus;
  reviewComment?: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function CreatorRequestPage() {
  const accessToken = usePlayerStore((s) => s.accessToken);
  const [request, setRequest] = useState<RequestStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [sampleUrl, setSampleUrl] = useState('');
  const [idFile, setIdFile] = useState<File | null>(null);

  useEffect(() => {
    const loadRequest = async () => {
      if (!accessToken) return;
      setLoading(true);
      setError('');
      const res = await apiFetch<RequestStatusData>('/creators/request', {}, accessToken);
      setLoading(false);

      if (res.success && res.data) {
        setRequest(res.data);
        setFullName(res.data.fullName || '');
        setBio(res.data.bio || '');
        setSampleUrl(res.data.sampleUrl || '');
      } else if (res.error) {
        setError(res.error.message || 'خطا در بارگذاری وضعیت درخواست');
      }
    };

    void loadRequest();
  }, [accessToken]);

  const submitRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const form = new FormData();
      form.append('fullName', fullName);
      form.append('bio', bio);
      form.append('sampleUrl', sampleUrl);
      if (idFile) form.append('idFile', idFile);

      const res = await fetch(`${API_URL}/creators/request`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
      });

      const body = await res.json();
      if (body.success) {
        setSuccess('درخواست با موفقیت ارسال شد. نتیجه به زودی به شما اعلام می‌شود.');
        setRequest(body.data ?? null);
      } else {
        setError(body.error?.message || 'ارسال درخواست امکان‌پذیر نیست.');
      }
    } catch (err) {
      setError('خطا در ارسال درخواست. اتصال به سرور را بررسی کنید.');
    }

    setSubmitting(false);
  };

  if (!accessToken) {
    return (
      <div>
        <h1 className="section-title">درخواست سازنده</h1>
        <p className="section-subtitle">برای ارسال درخواست باید ابتدا وارد شوید.</p>
        <Link href="/login" className="btn-primary">
          ورود به حساب کاربری
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="section-title">درخواست تبدیل به تولیدکننده</h1>
      <p className="section-subtitle">در این صفحه می‌توانید وضعیت درخواست خود را ببینید یا درخواست جدید ارسال کنید.</p>

      {error ? <p className="form-error">{error}</p> : null}
      {success ? <p className="text-success">{success}</p> : null}

      {loading ? (
        <p>در حال بارگذاری وضعیت درخواست…</p>
      ) : request ? (
        <div className="request-status-card">
          <div className="admin-request-header">
            <div>
              <strong>وضعیت فعلی</strong>
              <p className="text-muted">درخواست ارسالی در تاریخ {new Date(request.createdAt).toLocaleString('fa-IR')}</p>
            </div>
            <span className={`badge ${request.status === 'APPROVED' ? 'badge-success' : request.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
              {request.status}
            </span>
          </div>

          {request.bio ? <p className="content-desc">معرفی: {request.bio}</p> : null}
          {request.sampleUrl ? (
            <p>
              <a href={request.sampleUrl} target="_blank" rel="noreferrer">نمونه کار ارسال‌شده</a>
            </p>
          ) : null}
          {request.idFileUrl ? (
            <p>
              <a href={request.idFileUrl} target="_blank" rel="noreferrer">مدرک ارسال‌شده</a>
            </p>
          ) : null}

          {request.reviewComment ? (
            <p className="text-muted">نظر کارشناس: {request.reviewComment}</p>
          ) : null}

          {request.status === 'APPROVED' ? (
            <div className="content-actions">
              <Link href="/creator" className="btn-primary">
                رفتن به پنل سازنده
              </Link>
            </div>
          ) : request.status === 'PENDING' ? (
            <p className="section-subtitle">درخواست شما در حال بررسی است. لطفاً کمی صبر کنید.</p>
          ) : null}
        </div>
      ) : null}

      {request?.status === 'APPROVED' ? null : (
        <form className="creator-form" onSubmit={submitRequest}>
          <div className="form-group">
            <label className="form-label" htmlFor="creator-fullname">نام کامل</label>
            <input
              id="creator-fullname"
              className="form-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={submitting}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="creator-bio">معرفی کوتاه</label>
            <textarea
              id="creator-bio"
              className="form-input"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="creator-sample">لینک نمونه کار (اختیاری)</label>
            <input
              id="creator-sample"
              className="form-input"
              type="url"
              value={sampleUrl}
              onChange={(e) => setSampleUrl(e.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="creator-idfile">مدرک هویتی (تصویر یا PDF)</label>
            <input
              id="creator-idfile"
              className="form-input"
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setIdFile(e.target.files?.[0] ?? null)}
              disabled={submitting}
            />
          </div>

          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'در حال ارسال…' : request?.status === 'REJECTED' ? 'ارسال مجدد درخواست' : 'ارسال درخواست'}
          </button>
        </form>
      )}
    </div>
  );
}
