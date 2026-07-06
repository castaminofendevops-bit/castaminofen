import { RssParserService } from './rss-parser.service';

describe('RssParserService', () => {
  let service: RssParserService;

  beforeEach(() => {
    service = new RssParserService();
  });

  it('should normalize feed URL to https and lowercase host', () => {
    const input = 'http://RSS.CastBox.FM/Everest/Feed.xml';
    const normalized = service.normalizeFeedUrl(input);

    expect(normalized).toBe('https://rss.castbox.fm/Everest/Feed.xml');
  });

  it('should parse RSS feed channel and items', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Test Podcast</title>
    <link>https://example.com/podcast</link>
    <description>Summary of the podcast</description>
    <itunes:author>Host Name</itunes:author>
    <itunes:owner>
      <itunes:name>Owner</itunes:name>
      <itunes:email>owner@example.com</itunes:email>
    </itunes:owner>
    <itunes:image href="https://example.com/image.jpg"/>
    <item>
      <title>Episode 1</title>
      <description>Episode description</description>
      <enclosure url="https://example.com/episode1.mp3" type="audio/mpeg" />
      <itunes:duration>123</itunes:duration>
      <guid>ep1-guid</guid>
      <pubDate>Wed, 01 Jan 2025 10:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

    const result = service.parseFeed(xml, 'https://example.com/feed.xml');

    expect(result.feedUrl).toBe('https://example.com/feed.xml');
    expect(result.title).toBe('Test Podcast');
    expect(result.ownerEmail).toBe('owner@example.com');
    expect(result.image).toBe('https://example.com/image.jpg');
    expect(result.episodes).toHaveLength(1);
    expect(result.episodes[0].audioUrl).toBe('https://example.com/episode1.mp3');
    expect(result.episodes[0].guid).toBe('ep1-guid');
    expect(result.episodes[0].duration).toBe('2:03');
  });
});
