'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/player';
import { apiFetch } from '@/lib/api';

interface CreatorRequestItem {
  id: string;
  fullName: string;
  bio?: string;
  sampleUrl?: string;
  idFileUrl?: string;
  status: string;
  reviewComment?: string;
  createdAt: string;
  user: { id: string; email: string; displayName: string };
}

export default function AdminPage() {
  const accessToken = usePlayerStore((s) => s.accessToken);
  const user = usePlayerStore((s) => s.user);
  const [requests, setRequests] = useState<CreatorRequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'ADMIN';

  const loadRequests = useCallback(async () => {
    if (!accessToken || !isAdmin) return;
    setLoading(true);
    const res = await apiFetch<CreatorRequestItem[]>('/creators/requests', {}, accessToken);
    setLoading(false);
    if (res.success && res.data) {
      setRequests(res.data);
      setError('');
    } else {
      setError(res.error?.message || 'خطا در بارگذاری درخواست‌ها');
    }
  }, [accessToken, isAdmin]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const reviewRequest = async (id: string, action: 'APPROVE' | 'REJECT') => {
    if (!accessToken) return;
    setLoading(true);
    const res = await apiFetch(`/creators/requests/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
    }, accessToken);
    setLoading(false);
    if (res.success) {
      loadRequests();
    } else {
      setError(res.error?.message || 'خطا در بروزرسانی درخواست');
    }
  };

  if (!accessToken) {
    return <p>برای دسترسی به این صفحه باید وارد شوید.</p>;
  }

  if (!isAdmin) {
    return <p>این صفحه فقط برای مدیران قابل دسترسی است.</p>;
  }

  return (
    <div>
      <h1 className="section-title">درخواست‌های تبدیل به سازنده</h1>
      <p className="section-subtitle">درخواست‌های جدید را بررسی و تایید یا رد کنید.</p>

      {error ? <p className="form-error">{error}</p> : null}

      {loading ? <p>در حال بارگذاری...</p> : null}

      {!loading && requests.length === 0 ? (
        <p className="section-subtitle">درخواست جدیدی موجود نیست.</p>
      ) : null}

      <div className="admin-request-list">
        {requests.map((request) => (
          <div key={request.id} className="admin-request-card">
            <div className="admin-request-header">
              <div>
                <strong>{request.user.displayName}</strong>
                <p className="text-muted">{request.user.email}</p>
              </div>
              <span className={`badge ${request.status === 'APPROVED' ? 'badge-success' : request.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
                {request.status}
              </span>
            </div>
            <p className="text-muted">درخواست ارسال‌شده: {new Date(request.createdAt).toLocaleString('fa-IR')}</p>
            <p className="content-desc">{request.bio}</p>
            {request.sampleUrl ? (
              <p>
                <a href={request.sampleUrl} target="_blank" rel="noreferrer">
                  مشاهده نمونه کار
                </a>
              </p>
            ) : null}
            {request.idFileUrl ? (
              <p>
                <a href={request.idFileUrl} target="_blank" rel="noreferrer">
                  مشاهده مدرک
                </a>
              </p>
            ) : null}
            <div className="content-actions">
              {request.status === 'PENDING' ? (
                <>
                  <button className="btn-primary" onClick={() => reviewRequest(request.id, 'APPROVE')}>
                    تایید
                  </button>
                  <button className="btn-secondary" onClick={() => reviewRequest(request.id, 'REJECT')}>
                    رد
                  </button>
                </>
              ) : (
                <p className="text-muted">این درخواست قبلاً بررسی شده است.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
