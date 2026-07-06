interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  devHint?: string;
}

export function EmptyState({ title, description, actionLabel, onAction, devHint }: EmptyStateProps) {
  return (
    <div className="empty-state" role="status" aria-live="polite">
      <p className="empty-state-title">{title}</p>
      {description && <p className="empty-state-desc">{description}</p>}
      {actionLabel && onAction && (
        <button type="button" className="btn-primary empty-state-action" onClick={onAction} aria-label={actionLabel}>
          {actionLabel}
        </button>
      )}
      {process.env.NODE_ENV === 'development' && devHint && (
        <p className="empty-state-dev">{devHint}</p>
      )}
    </div>
  );
}
