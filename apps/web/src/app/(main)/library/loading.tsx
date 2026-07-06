import { PageHeaderSkeleton, ListSkeleton } from '@/components/Skeleton';

export default function LibraryLoading() {
  return (
    <>
      <PageHeaderSkeleton />
      <ListSkeleton rows={6} />
    </>
  );
}
