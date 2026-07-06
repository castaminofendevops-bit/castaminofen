import SearchClient from './SearchClient';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const params = await searchParams;
  return <SearchClient initialQ={params.q ?? ''} initialType={params.type ?? ''} />;
}
