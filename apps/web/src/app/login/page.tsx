'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { AuthResponse } from '@castaminofen/shared';
import { usePlayerStore } from '@/store/player';
import { rawFetch } from '@/lib/http';
import { showDemoHints } from '@/lib/env';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = usePlayerStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('ایمیل و رمز عبور را وارد کنید');
      return;
    }

    setLoading(true);
    setError('');

    const res = await rawFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), password }),
    });

    setLoading(false);
    if (res.success && res.data) {
      setAuth(
        { accessToken: res.data.accessToken, refreshToken: res.data.refreshToken },
        res.data.user,
      );
      router.push('/');
    } else {
      setError(res.error?.message || 'خطا در ورود');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">ورود به کستامینوفن</h1>
        {showDemoHints ? (
          <p className="auth-subtitle">demo: user@castaminofen.ir / password123</p>
        ) : null}
        <form onSubmit={handleLogin}>
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
            />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'در حال ورود...' : 'ورود'}
          </button>
        </form>
        <p className="auth-footer">
          حساب ندارید؟ <Link href="/register">ثبت‌نام</Link>
        </p>
      </div>
    </div>
  );
}
