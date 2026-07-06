'use client';

export const ONBOARDING_STORAGE_KEY = 'castaminofen_onboarding_v1_complete';

export const ONBOARDING_SLIDES = [
  {
    emoji: '🧭',
    title: 'کاوش کنید',
    description: 'پادکست، کتاب صوتی و ویدیو را در یک جا پیدا کنید.',
  },
  {
    emoji: '▶️',
    title: 'گوش دهید',
    description: 'با یک کلیک پخش کنید و نوار پخش همیشه در دسترس است.',
  },
  {
    emoji: '📚',
    title: 'ذخیره کنید',
    description: 'محتوای مورد علاقه را به کتابخانه اضافه کنید و از همان‌جا ادامه دهید.',
  },
] as const;

export function isOnboardingComplete(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) === '1';
  } catch {
    return true;
  }
}

export function markOnboardingComplete(): void {
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, '1');
  } catch {
    // ignore quota errors
  }
}
