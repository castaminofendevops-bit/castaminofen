'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { AuthResponse } from '@castaminofen/shared';
import { usePlayerStore } from '@/store/player';
import { rawFetch } from '@/lib/http';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = usePlayerStore((s) => s.setAuth);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = displayName.trim();
    const mail = email.trim();

    if (name.length < 2) {
      setError('نام نمایشی باید حداقل ۲ کاراکتر باشد');
      return;
    }
    if (password.length < 8) {
      setError('رمز عبور باید حداقل ۸ کاراکتر باشد');
      return;
    }
    if (password !== confirmPassword) {
      setError('رمز عبور و تکرار آن یکسان نیست');
      return;
    }

    setLoading(true);
    setError('');

    const res = await rawFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email: mail, password, displayName: name }),
    });

    setLoading(false);
    if (res.success && res.data) {
      setAuth(
        { accessToken: res.data.accessToken, refreshToken: res.data.refreshToken },
        res.data.user,
      );
      router.push('/');
    } else {
      setError(res.error?.message || 'خطا در ثبت‌نام');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">ثبت‌نام در کستامینوفن</h1>
        <p className="auth-subtitle">به جامعه شنوندگان و سازندگان بپیوندید</p>
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">نام نمایشی</label>
            <input
              className="form-input"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              minLength={2}
            />
          </div>
          <div className="form-group">
            <label className="form-label">ایمیل</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">رمز عبور</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="form-group">
            <label className="form-label">تکرار رمز عبور</label>
            <input
              className="form-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
          </button>
        </form>
        <p className="auth-footer">
          قبلاً ثبت‌نام کرده‌اید؟ <Link href="/login">ورود</Link>
        </p>
      </div>
    </div>
  );
}
