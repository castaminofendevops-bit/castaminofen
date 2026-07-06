interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

export function Skeleton({ className = '', width, height, rounded }: SkeletonProps) {
  const style: React.CSSProperties = {};
  if (width !== undefined) style.width = width;
  if (height !== undefined) style.height = height;

  return (
    <div
      className={`skeleton ${rounded ? 'skeleton-rounded' : ''} ${className}`.trim()}
      style={style}
      aria-hidden="true"
    />
  );
}

export function PageHeaderSkeleton() {
  return (
    <>
      <Skeleton className="skeleton-heading" />
      <Skeleton className="skeleton-subheading" />
    </>
  );
}

export function ContentGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="content-grid skeleton-grid" aria-busy="true" aria-label="در حال بارگذاری">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <Skeleton className="skeleton-cover" />
          <Skeleton className="skeleton-line skeleton-line-title" />
          <Skeleton className="skeleton-line skeleton-line-meta" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="list-skeleton" aria-busy="true" aria-label="در حال بارگذاری">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="list-skeleton-row">
          <Skeleton className="list-skeleton-thumb" />
          <div className="list-skeleton-text">
            <Skeleton className="skeleton-line skeleton-line-title" />
            <Skeleton className="skeleton-line skeleton-line-meta" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ContentDetailSkeleton() {
  return (
    <div aria-busy="true" aria-label="در حال بارگذاری محتوا">
      <Skeleton className="content-detail-cover" />
      <div className="content-detail-header-skeleton">
        <Skeleton className="skeleton-heading" />
        <Skeleton className="skeleton-subheading" />
      </div>
      <div className="content-detail-actions">
        <Skeleton className="skeleton-action-btn" />
        <Skeleton className="skeleton-action-btn" />
      </div>
      <ListSkeleton rows={4} />
    </div>
  );
}
