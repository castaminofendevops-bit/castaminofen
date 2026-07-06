import { Injectable, Logger } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';
import { RssChannel, RssFeedItem } from './rss.types';

const defaultOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseAttributeValue: false,
  trimValues: true,
  parseTagValue: true,
  ignoreNameSpace: false,
};

@Injectable()
export class RssParserService {
  private readonly logger = new Logger(RssParserService.name);

  normalizeFeedUrl(url: string): string {
    try {
      const trimmed = url.trim();
      const parsed = new URL(trimmed);
      parsed.protocol = 'https:';
      parsed.hostname = parsed.hostname.toLowerCase();
      return parsed.toString();
    } catch (error) {
      this.logger.warn(`Invalid feed URL: ${url}`);
      throw new Error(`Invalid feed URL: ${url}`);
    }
  }

  parseDuration(value?: string | number): string | undefined {
    if (!value && value !== 0) return undefined;

    const raw = String(value).trim();
    if (!raw) return undefined;

    if (/^\d+$/.test(raw)) {
      const seconds = Number(raw);
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
    }

    const parts = raw.split(':').map((p) => Number(p));
    if (parts.some((n) => Number.isNaN(n))) return undefined;
    if (parts.length === 3) return `${parts[0]}:${String(parts[1]).padStart(2, '0')}:${String(parts[2]).padStart(2, '0')}`;
    if (parts.length === 2) return `${parts[0]}:${String(parts[1]).padStart(2, '0')}`;
    return raw;
  }

  extractText(node: any): string {
    if (!node) return '';
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map((item) => this.extractText(item)).join(' ');
    if (typeof node === 'object') {
      if ('#text' in node) return String(node['#text']);
      if ('@_text' in node) return String(node['@_text']);
      return Object.values(node).map((value) => this.extractText(value)).join(' ');
    }
    return '';
  }

  extractArray(node: any): string[] {
    if (!node) return [];
    if (typeof node === 'string') return node.split(/[\s,;|،]+/).map((item) => item.trim()).filter(Boolean);
    if (Array.isArray(node)) return node.flatMap((item) => this.extractArray(item));
    if (typeof node === 'object') return Object.values(node).flatMap((value) => this.extractArray(value));
    return [];
  }

  parseFeed(xml: string, feedUrl: string): RssChannel {
    const parser = new XMLParser(defaultOptions);
    const parsed = parser.parse(xml) as any;
    const channel = parsed?.rss?.channel || parsed?.feed;
    if (!channel) throw new Error('Invalid RSS feed structure');

    const episodes = this.normalizeItems(channel.item || channel.items || []);

    const ownerName = this.extractText(channel['itunes:owner']?.name) || this.extractText(channel['itunes:author']);
    const ownerEmail = this.extractText(channel['itunes:owner']?.email);
    const image = this.extractFeedImage(channel);
    const categories = this.extractCategories(channel);
    const tags = this.extractTags(channel);

    return {
      feedUrl,
      title: this.extractText(channel.title) || '',
      description: this.extractText(channel.description) || this.extractText(channel['itunes:summary']) || '',
      image,
      link: this.extractText(channel.link) || undefined,
      language: this.extractText(channel.language) || undefined,
      author: this.extractText(channel['itunes:author']) || ownerName || undefined,
      ownerName: ownerName || undefined,
      ownerEmail: ownerEmail || undefined,
      categories,
      tags,
      episodes,
    };
  }

  private normalizeItems(rawItems: any): RssFeedItem[] {
    const items = Array.isArray(rawItems) ? rawItems : [rawItems];
    return items.map((item: any, index: number) => {
      const audioUrl = this.extractAudioUrl(item);
      const title = this.extractText(item.title) || '';
      const content = this.extractText(item['content:encoded']) || this.extractText(item.description) || this.extractText(item['itunes:summary']) || '';
      const coverUrl = this.extractEpisodeImage(item);
      const tags = [...this.extractArray(item['itunes:keywords']), ...this.extractArray(item['podcast:tag'])];
      const publishDate = this.extractText(item.pubDate) || this.extractText(item.published) || new Date().toISOString();
      const guid = this.extractText(item.guid) || audioUrl;
      const duration = this.parseDuration(this.extractText(item['itunes:duration']) || this.extractText(item.duration));
      const seasonNumber = Number(this.extractText(item['itunes:season']) || 1) || 1;
      const episodeNumber = Number(this.extractText(item['itunes:episode']) || this.extractText(item['itunes:episodeNumber']) || index + 1) || index + 1;

      return {
        title,
        content,
        audioUrl,
        coverUrl: coverUrl || undefined,
        tags,
        publishDate,
        guid: guid || undefined,
        duration: duration || undefined,
        seasonNumber,
        episodeNumber,
      };
    }).filter((item) => Boolean(item.audioUrl));
  }

  private extractAudioUrl(item: any): string {
    const enclosureUrl = this.extractText(item.enclosure?.['@_url']);
    if (enclosureUrl) return enclosureUrl;
    const mediaContentUrl = this.extractText(item['media:content']?.['@_url']);
    if (mediaContentUrl) return mediaContentUrl;
    return '';
  }

  private extractFeedImage(channel: any): string | undefined {
    const itunesImage = this.extractText(channel['itunes:image']?.['@_href']);
    if (itunesImage) return itunesImage;
    const channelImage = this.extractText(channel.image?.url) || this.extractText(channel.image);
    return channelImage || undefined;
  }

  private extractEpisodeImage(item: any): string | undefined {
    const itunesImage = this.extractText(item['itunes:image']?.['@_href']);
    if (itunesImage) return itunesImage;
    const mediaThumbnail = this.extractText(item['media:thumbnail']?.['@_url']);
    if (mediaThumbnail) return mediaThumbnail;
    const mediaContentUrl = this.extractText(item['media:content']?.['@_url']);
    return mediaContentUrl || undefined;
  }

  private extractCategories(channel: any): string[] {
    return [...this.extractArray(channel['itunes:category']), ...this.extractArray(channel['podcast:category'])].filter(Boolean);
  }

  private extractTags(channel: any): string[] {
    return [...this.extractArray(channel['itunes:keywords']), ...this.extractArray(channel['podcast:tag'])].filter(Boolean);
  }
}
