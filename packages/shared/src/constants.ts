export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;

export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;
export const DEFAULT_PLAYBACK_SPEED = 1;
export const SLEEP_TIMER_OPTIONS = [5, 10, 15, 30, 45, 60] as const;

export const CONTENT_TYPES = {
  PODCAST: 'PODCAST',
  AUDIOBOOK: 'AUDIOBOOK',
  VIDEO: 'VIDEO',
} as const;

export const SUBSCRIPTION_PLANS = {
  FREE: { name: 'رایگان', price: 0 },
  PREMIUM: { name: 'پریمیوم', price: 149000 },
  CREATOR: { name: 'سازنده', price: 299000 },
} as const;

export const MEDIA_QUALITIES = ['low', 'medium', 'high'] as const;

export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PREMIUM_REQUIRED: 'PREMIUM_REQUIRED',
  PURCHASE_REQUIRED: 'PURCHASE_REQUIRED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
