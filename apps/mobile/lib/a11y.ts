/** Persian-friendly labels for screen readers */
export function formatTimeA11y(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m === 0) return `${s} ثانیه`;
  if (s === 0) return `${m} دقیقه`;
  return `${m} دقیقه و ${s} ثانیه`;
}

export function formatPlaybackA11y(positionSec: number, durationSec?: number): string {
  if (!durationSec || durationSec <= 0) {
    return `${formatTimeA11y(positionSec)} گذشته`;
  }
  const pct = Math.round((positionSec / durationSec) * 100);
  return `${formatTimeA11y(positionSec)} از ${formatTimeA11y(durationSec)}، ${pct} درصد`;
}

export function formatPercentA11y(percent: number): string {
  return `${Math.round(Math.min(100, Math.max(0, percent)))} درصد`;
}
