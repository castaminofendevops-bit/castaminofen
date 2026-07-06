'use client';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatValueText(value: number, max: number): string {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return `${formatTime(value)} از ${formatTime(max)} (${pct}٪)`;
}

interface ProgressBarProps {
  value: number;
  max: number;
  onChange?: (value: number) => void;
  label?: string;
  className?: string;
  /** Decorative bars (e.g. continue listening) — not keyboard-focusable */
  readOnly?: boolean;
}

export function ProgressBar({
  value,
  max,
  onChange,
  label = 'پیشرفت پخش',
  className = '',
  readOnly = false,
}: ProgressBarProps) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const seekable = Boolean(onChange) && !readOnly;
  const valueText = formatValueText(value, max);

  const seek = (clientX: number, rect: DOMRect) => {
    if (!onChange) return;
    const p = (rect.right - clientX) / rect.width;
    onChange(Math.min(max, Math.max(0, p * max)));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onChange) return;
    const step = Math.max(max * 0.05, 1);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(Math.min(max, value + step));
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(Math.max(0, value - step));
    }
    if (e.key === 'Home') {
      e.preventDefault();
      onChange(0);
    }
    if (e.key === 'End') {
      e.preventDefault();
      onChange(max);
    }
  };

  return (
    <div
      className={`progress-bar ${seekable ? 'progress-bar-seekable' : ''} ${className}`.trim()}
      role={seekable ? 'slider' : 'progressbar'}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      aria-valuetext={valueText}
      tabIndex={seekable ? 0 : undefined}
      onClick={seekable ? (e) => seek(e.clientX, e.currentTarget.getBoundingClientRect()) : undefined}
      onKeyDown={seekable ? onKeyDown : undefined}
    >
      <div className="progress-fill" style={{ width: `${pct}%` }} aria-hidden="true" />
    </div>
  );
}
