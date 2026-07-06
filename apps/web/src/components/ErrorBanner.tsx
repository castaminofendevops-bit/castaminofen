interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="error-banner" role="alert">
      <span className="error-banner-icon" aria-hidden="true">
        ⚠
      </span>
      <p className="error-banner-message">{message}</p>
      {onRetry ? (
        <button type="button" className="error-banner-retry" onClick={onRetry}>
          تلاش مجدد
        </button>
      ) : null}
    </div>
  );
}
