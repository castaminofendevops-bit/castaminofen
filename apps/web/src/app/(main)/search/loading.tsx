import { PageHeaderSkeleton, ContentGridSkeleton } from '@/components/Skeleton';

export default function SearchLoading() {
  return (
    <>
      <PageHeaderSkeleton />
      <div className="skeleton skeleton-search-bar" aria-hidden="true" />
      <ContentGridSkeleton count={6} />
    </>
  );
}
