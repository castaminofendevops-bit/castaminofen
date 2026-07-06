import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RssParserService } from './rss-parser.service';
import { RssFeedService } from './rss-feed.service';
import { ImportRssDto } from './rss.dto';
import { RssImportSummary, RssImportFeedResult } from './rss.types';

@Injectable()
export class RssImporterService {
  private readonly logger = new Logger(RssImporterService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly rssParser: RssParserService,
    private readonly rssFeedService: RssFeedService,
  ) {}

  async importFeeds(dto: ImportRssDto): Promise<RssImportSummary> {
    const feedUrls = this.normalizeFeeds(dto.feeds || []);
    const emailDomain = dto.emailDomain || 'castaminofen.ir';
    const dryRun = dto.dryRun ?? false;
    const skipExisting = dto.skipExisting ?? true;
    const limitEpisodes = dto.limitEpisodes ?? 0;
    const results: RssImportFeedResult[] = [];

    const normalizedSet = new Set<string>();
    const normalizedEmailMap: Record<string, string> = {};
    for (const [key, value] of Object.entries(dto.emailMap || {})) {
      try {
        normalizedEmailMap[this.rssParser.normalizeFeedUrl(key)] = value;
      } catch {
        normalizedEmailMap[key] = value;
      }
    }

    for (const url of feedUrls) {
      try {
        const normalizedUrl = this.rssParser.normalizeFeedUrl(url);
        if (normalizedSet.has(normalizedUrl)) {
          results.push({
            feedUrl: normalizedUrl,
            title: '',
            podcastId: null,
            episodesCount: 0,
            episodesCreated: 0,
            episodesUpdated: 0,
            episodesSkipped: 0,
            status: 'error',
            error: 'Duplicate in same batch',
          });
          continue;
        }
        normalizedSet.add(normalizedUrl);
      } catch (err) {
        results.push({
          feedUrl: url,
          title: '',
          podcastId: null,
          episodesCount: 0,
          episodesCreated: 0,
          episodesUpdated: 0,
          episodesSkipped: 0,
          status: 'error',
          error: (err as Error).message,
        });
      }
    }

    for (const url of Array.from(normalizedSet)) {
      const result = await this.importFeed(url, normalizedEmailMap[url], emailDomain, dryRun, skipExisting, limitEpisodes);
      results.push(result);
    }

    return { feeds: results, errors: results.filter((r) => r.error).map((r) => `${r.feedUrl}: ${r.error}`) };
  }

  private normalizeFeeds(feeds: string[]): string[] {
    return feeds.filter(Boolean).map((url) => url.trim());
  }

  private async importFeed(
    feedUrl: string,
    mappedEmail: string | undefined,
    emailDomain: string,
    dryRun: boolean,
    skipExisting: boolean,
    limitEpisodes: number,
  ): Promise<RssImportFeedResult> {
    try {
      const normalizedUrl = this.rssParser.normalizeFeedUrl(feedUrl);
      const xml = await this.fetchFeed(normalizedUrl);
      const parsed = this.rssParser.parseFeed(xml, normalizedUrl);
      const ownerEmail = mappedEmail || parsed.ownerEmail || this.generateFallbackEmail(parsed.title, emailDomain);
      const creatorProfile = await this.getOrCreateCreator(ownerEmail, parsed.title, dryRun);
      const existingContent = await this.prisma.content.findFirst({ where: { sourceFeedUrl: normalizedUrl } });
      const commonContentData = {
        creatorId: creatorProfile?.id ?? '',
        type: 'PODCAST' as const,
        title: parsed.title || `Podcast ${Date.now()}`,
        slug: this.slugify(parsed.title || `podcast-${Date.now()}`),
        description: parsed.description || undefined,
        coverUrl: parsed.image || undefined,
        status: 'PUBLISHED' as const,
        language: parsed.language || 'fa',
        sourceFeedUrl: normalizedUrl,
      };
      const contentCreateData = {
        ...commonContentData,
        publishedAt: new Date(),
      };
      const contentUpdateData = { ...commonContentData };

      let content;
      let status: RssImportFeedResult['status'] = existingContent ? 'updated' : 'imported';
      if (dryRun) {
        content = existingContent || null;
      } else {
        if (existingContent) {
          content = await this.prisma.content.update({ where: { id: existingContent.id }, data: contentUpdateData });
        } else {
          content = await this.prisma.content.create({ data: contentCreateData });
        }
      }

      const episodeItems = limitEpisodes > 0 ? parsed.episodes.slice(0, limitEpisodes) : parsed.episodes;
      let created = 0;
      let updated = 0;
      let skipped = 0;

      if (dryRun && !content) {
        return {
          feedUrl,
          title: parsed.title,
          podcastId: null,
          episodesCount: episodeItems.length,
          episodesCreated: 0,
          episodesUpdated: 0,
          episodesSkipped: 0,
          status: 'dry_run',
        };
      }

      for (const item of episodeItems) {
        const existingEpisode = await this.findExistingEpisode(content.id, item.guid, item.audioUrl);
        if (existingEpisode) {
          if (skipExisting) {
            skipped += 1;
            continue;
          }
          if (!dryRun) {
            const updateData: any = {
              title: item.title,
              description: item.content || undefined,
              thumbnailUrl: item.coverUrl || undefined,
              publishedAt: new Date(item.publishDate),
              duration: item.duration ? this.durationToSeconds(item.duration) : undefined,
              rssGuid: item.guid || existingEpisode.rssGuid,
            };
            await this.prisma.episode.update({ where: { id: existingEpisode.id }, data: updateData });
          }
          updated += 1;
          continue;
        }

        if (!dryRun) {
          await this.prisma.episode.create({
            data: {
              contentId: content.id,
              title: item.title,
              slug: `${this.slugify(item.title)}-${item.episodeNumber}`,
              description: item.content || undefined,
              episodeNumber: item.episodeNumber,
              duration: this.durationToSeconds(item.duration),
              mediaUrl: item.audioUrl,
              thumbnailUrl: item.coverUrl || undefined,
              publishedAt: new Date(item.publishDate),
              rssGuid: item.guid,
            },
          });
          await this.prisma.content.update({ where: { id: content.id }, data: { episodeCount: { increment: 1 } } });
        }
        created += 1;
      }

      if (!dryRun && content?.slug) {
        await this.rssFeedService.invalidateCache(content.slug);
      }

      return {
        feedUrl: normalizedUrl,
        title: parsed.title,
        podcastId: content?.id ?? null,
        episodesCount: episodeItems.length,
        episodesCreated: created,
        episodesUpdated: updated,
        episodesSkipped: skipped,
        status: dryRun ? 'dry_run' : status,
      };
    } catch (error) {
      this.logger.error(`Failed to import feed ${feedUrl}`, (error as Error).stack);
      return {
        feedUrl,
        title: '',
        podcastId: null,
        episodesCount: 0,
        episodesCreated: 0,
        episodesUpdated: 0,
        episodesSkipped: 0,
        status: 'error',
        error: (error as Error).message,
      };
    }
  }

  private async fetchFeed(url: string): Promise<string> {
    await this.ensureFetchSlot();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'User-Agent': 'PodcastRSSImporter/1.0' },
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status} for ${url}`);
      }
      const text = await response.text();
      if (!text) throw new Error(`Empty feed body for ${url}`);
      return text;
    } finally {
      clearTimeout(timeout);
    }
  }

  private async ensureFetchSlot() {
    const now = Date.now();
    RssImporterService.fetchTimestamps = RssImporterService.fetchTimestamps.filter(
      (timestamp) => now - timestamp < 60000,
    );
    if (RssImporterService.fetchTimestamps.length >= 100) {
      const earliest = RssImporterService.fetchTimestamps[0];
      const waitTime = 60000 - (now - earliest) + 50;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    RssImporterService.fetchTimestamps.push(Date.now());
  }

  private static fetchTimestamps: number[] = [];

  private async getOrCreateCreator(email: string, title: string, dryRun: boolean) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      const profile = await this.prisma.creatorProfile.findUnique({ where: { userId: user.id } });
      return profile ?? (dryRun ? ({} as any) : this.prisma.creatorProfile.create({ data: { userId: user.id, slug: this.slugify(`${title}-${user.id}`) } }));
    }

    if (dryRun) {
      return { id: 'dryrun', userId: 'dryrun' } as any;
    }

    const newUser = await this.prisma.user.create({ data: { email, displayName: title || 'Podcast Owner', role: 'CREATOR', passwordHash: '' } });
    return this.prisma.creatorProfile.create({ data: { userId: newUser.id, slug: this.slugify(`${title}-${newUser.id}`) } });
  }

  private async findExistingEpisode(contentId: string, guid?: string, audioUrl?: string) {
    if (guid) {
      const episode = await this.prisma.episode.findFirst({ where: { contentId, rssGuid: guid } });
      if (episode) return episode;
    }
    if (audioUrl) {
      return this.prisma.episode.findFirst({ where: { contentId, mediaUrl: audioUrl } });
    }
    return null;
  }

  private generateFallbackEmail(title: string, domain: string): string {
    const slug = this.slugify(title || 'podcast');
    return `${slug}@${domain}`;
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFKD')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\u0600-\u06FF-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 100);
  }

  private durationToSeconds(duration?: string): number {
    if (!duration) return 0;
    const parts = duration.split(':').map(Number).reverse();
    let seconds = 0;
    if (parts[0]) seconds += parts[0];
    if (parts[1]) seconds += parts[1] * 60;
    if (parts[2]) seconds += parts[2] * 3600;
    return seconds;
  }
}
