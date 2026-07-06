'use client';

import { useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/player';

const SHORTCUTS = [
  { keys: '/', desc: 'فوکوس جستجو' },
  { keys: 'Space', desc: 'پخش / توقف (وقتی اپیزود فعال است)' },
  { keys: '?', desc: 'نمایش این راهنما' },
  { keys: 'Esc', desc: 'بستن راهنما' },
] as const;

export function useKeyboardShortcuts() {
  const [helpOpen, setHelpOpen] = useState(false);
  const currentEpisode = usePlayerStore((s) => s.currentEpisode);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (inField) return;
        e.preventDefault();
        setHelpOpen((open) => !open);
        return;
      }

      if (e.key === 'Escape' && helpOpen) {
        setHelpOpen(false);
        return;
      }

      if (e.key === ' ' && currentEpisode) {
        if (inField) return;
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentEpisode, helpOpen, togglePlay]);

  return { helpOpen, setHelpOpen, shortcuts: SHORTCUTS };
}

export function KeyboardShortcutsModal({
  open,
  onClose,
  shortcuts,
}: {
  open: boolean;
  onClose: () => void;
  shortcuts: ReadonlyArray<{ keys: string; desc: string }>;
}) {
  if (!open) return null;

  return (
    <div className="shortcuts-backdrop" role="dialog" aria-modal="true" aria-labelledby="shortcuts-title" onClick={onClose}>
      <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
        <h2 id="shortcuts-title" className="shortcuts-title">میانبرهای صفحه‌کلید</h2>
        <ul className="shortcuts-list">
          {shortcuts.map((item) => (
            <li key={item.keys} className="shortcuts-row">
              <kbd className="shortcuts-kbd">{item.keys}</kbd>
              <span>{item.desc}</span>
            </li>
          ))}
        </ul>
        <button type="button" className="shortcuts-close" onClick={onClose}>
          بستن
        </button>
      </div>
    </div>
  );
}
