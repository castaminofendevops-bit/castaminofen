'use client';

import { Nav } from '@/components/Nav';
import { PlayerBar } from '@/components/PlayerBar';
import { OnboardingModal } from '@/components/OnboardingModal';
import { KeyboardShortcutsModal, useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useSearchShortcut } from '@/hooks/useSearchShortcut';

export function AppShell({ children }: { children: React.ReactNode }) {
  useSearchShortcut();
  const { helpOpen, setHelpOpen, shortcuts } = useKeyboardShortcuts();

  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-link">
        رفتن به محتوای اصلی
      </a>
      <Nav />
      <main id="main-content" className="main-content">
        {children}
      </main>
      <PlayerBar />
      <OnboardingModal />
      <KeyboardShortcutsModal open={helpOpen} onClose={() => setHelpOpen(false)} shortcuts={shortcuts} />
    </div>
  );
}
