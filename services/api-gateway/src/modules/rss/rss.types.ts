export interface RssFeedItem {
  title: string;
  content: string;
  audioUrl: string;
  coverUrl?: string;
  tags: string[];
  publishDate: string;
  guid?: string;
  duration?: string;
  seasonNumber: number;
  episodeNumber: number;
}

export interface RssChannel {
  feedUrl: string;
  title: string;
  description: string;
  image?: string;
  link?: string;
  language?: string;
  author?: string;
  ownerName?: string;
  ownerEmail?: string;
  categories: string[];
  tags: string[];
  episodes: RssFeedItem[];
}

export interface RssImportFeedResult {
  feedUrl: string;
  title: string;
  podcastId: string | null;
  episodesCount: number;
  episodesCreated: number;
  episodesUpdated: number;
  episodesSkipped: number;
  status: 'imported' | 'updated' | 'dry_run' | 'error';
  error?: string;
}

export interface RssImportSummary {
  feeds: RssImportFeedResult[];
  errors: string[];
}