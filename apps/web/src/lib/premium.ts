export function isPremiumError(message?: string, code?: string) {
  return code === '403' || /premium|purchase|دسترسی/i.test(message ?? '');
}
