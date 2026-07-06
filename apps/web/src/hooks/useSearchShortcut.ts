'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function useSearchShortcut() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      e.preventDefault();
      if (pathname === '/search') {
        window.dispatchEvent(new CustomEvent('castaminofen:focus-search'));
      } else {
        router.push('/search');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pathname, router]);
}
