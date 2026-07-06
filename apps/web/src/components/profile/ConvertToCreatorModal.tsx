'use client';

import React, { useCallback, useState } from 'react';
import { usePlayerStore } from '@/store/player';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ConvertToCreatorModal({ open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [sampleUrl, setSampleUrl] = useState('');
  const [idFile, setIdFile] = useState<File | null>(null);

  const requestCreator = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const form = new FormData();
      form.append('fullName', fullName);
      form.append('bio', bio);
      form.append('sampleUrl', sampleUrl);
      if (idFile) form.append('idFile', idFile);

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'}/creators/request`;
      const token = usePlayerStore.getState().accessToken;
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: form,
      });

      const body = await res.json();
      setLoading(false);
      if (body.success) {
        setSuccess('درخواست ارسال شد. تیم ما در اسرع وقت بررسی می‌کند.');
        setTimeout(onClose, 1600);
      } else {
        setError(body.error?.message || 'ارسال درخواست امکان‌پذیر نیست.');
      }
    } catch (err) {
      setLoading(false);
      setError('خطا در ارسال درخواست. اتصال به سرور را بررسی کنید.');
    }
  }, [fullName, bio, sampleUrl, idFile, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal" role="dialog" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="بستن">×</button>
        <h3 className="modal-title">درخواست تبدیل به تولیدکننده</h3>
        <p className="modal-desc">با ارسال درخواست، تیم ما مشخصات شما را بررسی می‌کند و در صورت تأیید، دسترسی سازنده اختصاص می‌یابد.</p>

        <div className="mt-4">
          <div className="form-group">
            <label className="form-label">نام کامل</label>
            <input className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">معرفی کوتاه</label>
            <textarea className="form-input" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">لینک نمونه کار (اختیاری)</label>
            <input className="form-input" value={sampleUrl} onChange={(e) => setSampleUrl(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">مدرک هویتی (تصویر)</label>
            <input type="file" accept="image/*,application/pdf" onChange={(e) => setIdFile(e.target.files?.[0] ?? null)} />
          </div>

          <div className="flex gap-2">
            <button className="btn-primary" onClick={requestCreator} disabled={loading}>
              {loading ? 'در حال ارسال…' : 'ارسال درخواست'}
            </button>
            <button className="btn-secondary" onClick={onClose}>انصراف</button>
          </div>
        </div>

        {success ? <p className="text-success mt-3">{success}</p> : null}
        {error ? <p className="form-error mt-3">{error}</p> : null}
      </div>
    </div>
  );
}
