import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { RssChannel } from './rss.types';

@Injectable()
export class RssFeedService {
  private readonly logger = new Logger(RssFeedService.name);
  private readonly cacheKeyPrefix = 'rss_feed_xml:';
  private readonly defaultTtlSeconds = 3600;

  constructor(private readonly prisma: PrismaService, private readonly redis: RedisService) {}

  async getFeedXml(slug: string, ttl?: number): Promise<string> {
    const content = await this.prisma.content.findFirst({
      where: { slug, status: 'PUBLISHED', type: 'PODCAST' },
      include: {
        creator: { include: { user: true } },
        episodes: { where: { mediaUrl: { not: null }, publishedAt: { not: null } }, orderBy: { episodeNumber: 'asc' } },
        tags: { include: { tag: true } },
      },
    });

    if (!content) throw new NotFoundException('Channel not found or not published');

    const cacheKey = `${this.cacheKeyPrefix}${slug}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const xml = this.buildXml(this.toRssChannel(content));
    const ttlSeconds = ttl ?? this.defaultTtlSeconds;
    await this.redis.set(cacheKey, xml, ttlSeconds);
    return xml;
  }

  async invalidateCache(slug: string) {
    await this.redis.del(`${this.cacheKeyPrefix}${slug}`);
  }

  private toRssChannel(content: any): RssChannel {
    const ownerName = content.creator?.user?.displayName || content.creator?.slug || 'Castaminofen';
    const ownerEmail = content.creator?.user?.email || 'no-reply@castaminofen.ir';
    const categories: string[] = [];
    const tags: string[] = content.tags?.map((t: any) => t.tag.name) || [];

    const episodes = content.episodes.map((episode: any) => ({
      title: episode.title,
      content: episode.description || '',
      audioUrl: episode.mediaUrl || '',
      coverUrl: episode.thumbnailUrl || content.coverUrl || undefined,
      tags: [],
      publishDate: episode.publishedAt?.toISOString() || new Date().toISOString(),
      guid: episode.rssGuid || episode.id,
      duration: this.secondsToDuration(episode.duration),
      seasonNumber: 1,
      episodeNumber: episode.episodeNumber,
    }));

    return {
      feedUrl: content.sourceFeedUrl || '',
      title: content.title,
      description: content.description || '',
      image: content.coverUrl || undefined,
      link: content.sourceFeedUrl || '',
      language: content.language || 'fa',
      author: ownerName,
      ownerName,
      ownerEmail,
      categories,
      tags,
      episodes,
    };
  }

  private buildXml(channel: RssChannel): string {
    const itemsXml = channel.episodes
      .map((episode) => {
        const type = episode.enclosureType || (episode.isVideo ? 'video/mp4' : 'audio/mpeg');
        return `
      <item>
        <title>${this.escape(episode.title)}</title>
        <link>${this.escape(episode.audioUrl)}</link>
        <guid isPermaLink="false">${this.escape(episode.guid || episode.audioUrl)}</guid>
        <pubDate>${new Date(episode.publishDate).toUTCString()}</pubDate>
        <description><![CDATA[${episode.content || ''}]]></description>
        <enclosure url="${this.escape(episode.audioUrl)}" length="0" type="${this.escape(type)}"/>
        <itunes:duration>${this.escape(episode.duration || '')}</itunes:duration>
      </item>`;
      })
      .join('');

    const categoriesXml = channel.categories
      .filter(Boolean)
      .map((category) => `<itunes:category text="${this.escape(category)}"/>`)
      .join('\n    ');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${this.escape(channel.title)}</title>
    <link>${this.escape(channel.feedUrl || '')}</link>
    <description><![CDATA[${channel.description || ''}]]></description>
    <language>${this.escape(channel.language || 'fa')}</language>
    <copyright>© ${this.escape(channel.ownerName || '')}</copyright>
    <itunes:author>${this.escape(channel.author || '')}</itunes:author>
    <itunes:owner>
      <itunes:name>${this.escape(channel.ownerName || '')}</itunes:name>
      <itunes:email>${this.escape(channel.ownerEmail || '')}</itunes:email>
    </itunes:owner>
    <itunes:explicit>no</itunes:explicit>
    ${channel.image ? `<itunes:image href="${this.escape(channel.image)}"/>` : ''}
    ${categoriesXml}
    ${itemsXml}
  </channel>
</rss>`;
  }

  private secondsToDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
  }

  private escape(value: string): string {
    return (value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
}
