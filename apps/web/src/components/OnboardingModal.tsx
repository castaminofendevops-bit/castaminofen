'use client';

import { useEffect, useState } from 'react';
import {
  ONBOARDING_SLIDES,
  isOnboardingComplete,
  markOnboardingComplete,
} from '@/lib/onboarding';

export function OnboardingModal() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isOnboardingComplete()) setVisible(true);
  }, []);

  if (!visible) return null;

  const slide = ONBOARDING_SLIDES[step];
  const isLast = step === ONBOARDING_SLIDES.length - 1;

  const finish = () => {
    markOnboardingComplete();
    setVisible(false);
  };

  return (
    <div className="onboarding-backdrop" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="onboarding-modal">
        <div className="onboarding-dots" aria-hidden="true">
          {ONBOARDING_SLIDES.map((_, i) => (
            <span key={i} className={`onboarding-dot${i === step ? ' onboarding-dot--active' : ''}`} />
          ))}
        </div>

        <div className="onboarding-icon" aria-hidden="true">{slide.emoji}</div>
        <h2 id="onboarding-title" className="onboarding-title">{slide.title}</h2>
        <p className="onboarding-desc">{slide.description}</p>

        <div className="onboarding-actions">
          <button type="button" className="onboarding-skip" onClick={finish}>
            رد کردن
          </button>
          <button
            type="button"
            className="onboarding-next"
            onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
          >
            {isLast ? 'شروع کنید' : 'بعدی'}
          </button>
        </div>
      </div>
    </div>
  );
}
