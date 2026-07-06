'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/player';
import { useTheme } from '@/components/ThemeProvider';

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const user = usePlayerStore((s) => s.user);
  const logout = usePlayerStore((s) => s.logout);
  const isCreator = user?.role === 'CREATOR' || user?.role === 'ADMIN';

  const links = [
    { href: '/', label: 'کاوش' },
    { href: '/search', label: 'جستجو' },
    { href: '/library', label: 'کتابخانه' },
    ...(isCreator ? [{ href: '/creator', label: 'پنل سازنده' }] : []),
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <nav className="nav" aria-label="ناوبری اصلی">
      <Link href="/" className="nav-logo" aria-label="کستامینوفن — صفحه اصلی">
        کستامینوفن
      </Link>
      <div className="nav-links">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`nav-link ${isActive(l.href) ? 'active' : ''}`}
            aria-current={isActive(l.href) ? 'page' : undefined}
          >
            {l.label}
          </Link>
        ))}
        <button
          type="button"
          className="nav-theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'فعال‌سازی حالت روشن' : 'فعال‌سازی حالت تیره'}
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
        {user ? (
          <>
            <span className="nav-link" aria-label={`کاربر: ${user.displayName}`}>
              {user.displayName}
            </span>
            <button type="button" className="nav-link nav-logout" onClick={handleLogout} aria-label="خروج از حساب">
              خروج
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="nav-link nav-login">
              ورود
            </Link>
            <Link href="/register" className="nav-link nav-register">
              ثبت‌نام
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
