export type SearchContentResult = {
  id: string;
  title: string;
  type: string;
  coverUrl?: string | null;
  episodeCount: number;
  isPremium: boolean;
  creator: { displayName: string };
};

export type SearchEpisodeResult = {
  id: string;
  title: string;
  slug: string;
  duration: number;
  episodeNumber: number;
  contentId: string;
  contentTitle: string;
  isVideo: boolean;
};

export type SearchCreatorResult = {
  id: string;
  slug: string;
  displayName: string;
  avatarUrl: string | null;
  isVerified: boolean;
};

export type SearchResults = {
  contents: SearchContentResult[];
  episodes: SearchEpisodeResult[];
  creators: SearchCreatorResult[];
};

export function emptySearchResults(): SearchResults {
  return { contents: [], episodes: [], creators: [] };
}

export function hasSearchResults(results: SearchResults): boolean {
  return results.contents.length > 0 || results.episodes.length > 0 || results.creators.length > 0;
}

export function normalizeSearchResponse(
  data: SearchResults | SearchContentResult[] | null | undefined,
): SearchResults {
  if (!data) return emptySearchResults();
  if (Array.isArray(data)) return { contents: data, episodes: [], creators: [] };
  return {
    contents: data.contents ?? [],
    episodes: data.episodes ?? [],
    creators: data.creators ?? [],
  };
}
