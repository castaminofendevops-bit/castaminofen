# درخواست پیاده‌سازی: سیستم کامل RSS پادکست (Import + Export)

## هدف

یک سیستم دوطرفه RSS برای پلتفرم پادکست پیاده‌سازی کن که:

1. پادکست‌ها و اپیزودها را از فیدهای RSS خارجی import کند
2. برای هر کانال/پادکست داخلی، فید RSS استاندارد تولید کند

**مهم:** تکنولوژی، فریم‌ورک، زبان برنامه‌نویسی و دیتابیس را خودت بر اساس پروژه‌ی مقصد انتخاب کن. منطق و رفتار سیستم باید دقیقاً مطابق مشخصات زیر باشد؛ وابستگی به WordPress، PHP یا هر پلتفرم خاصی نداشته باش.

---

## مدل داده (حداقل)

### موجودیت‌ها

- **User/Creator** — مالک پادکست
- **Podcast/Channel** — یک نمایش/کانال پادکست
- **Episode** — یک قسمت صوتی

### فیلدهای Podcast

| فیلد | توضیح |
|------|--------|
| id | شناسه یکتا |
| slug | برای URL و فید |
| title | عنوان |
| description | توضیحات (HTML مجاز) |
| cover_image_url | کاور |
| author/host_name | نام مجری |
| language | زبان |
| source_feed_url | URL فید RSS منبع (برای import و sync) |
| owner_user_id | مالک |
| status | published / pending / draft |
| categories | آرایه دسته‌بندی |
| tags | آرایه تگ |
| created_at, updated_at | |

### فیلدهای Episode

| فیلد | توضیح |
|------|--------|
| id | شناسه یکتا |
| podcast_id | FK |
| title | |
| content/description | HTML یا متن |
| audio_url | **الزامی** — لینک فایل صوتی |
| cover_url | کاور اپیزود (اختیاری) |
| duration | فرمت `MM:SS` یا `H:MM:SS` |
| season_number | پیش‌فرض 1 |
| episode_number | اگر در فید نبود، auto-increment |
| rss_guid | GUID از فید منبع (برای dedup) |
| tags | |
| publish_date | از pubDate فید |
| status | published |
| sort_order | ترتیب نمایش |
| created_at | |

### متادیتای deduplication

- هر Podcast با `source_feed_url` نرمال‌شده یکتا شناسایی شود
- هر Episode با `rss_guid` (اولویت اول) یا `audio_url` در همان podcast (اولویت دوم)

---

## ماژول ۱: RSS Parser

### دریافت فید

- HTTP GET با timeout حداقل 60 ساعت
- User-Agent مشخص (مثلاً `PodcastRSSImporter/1.0`)
- خطاهای HTTP (غیر 2xx)، بدنه خالی، XML نامعتبر → گزارش خطا و ادامه با فید بعدی

### نرمال‌سازی URL فید

```
- trim
- scheme همیشه https
- host به lowercase
- path و query حفظ شوند
- فیدهای تکراری در یک batch حذف شوند
```

### پارس XML — استاندارد RSS 2.0 + namespaceها

پشتیبانی از:

- **RSS 2.0** پایه: `channel`, `item`
- **iTunes**: `itunes:author`, `itunes:owner`, `itunes:summary`, `itunes:image`, `itunes:duration`, `itunes:season`, `itunes:episode`, `itunes:keywords`, `itunes:category` (شامل nested)
- **content**: `content:encoded`
- **media RSS**: `media:thumbnail`, `media:content` (type=image/*)
- **Podcast Index**: `podcast:category`, `podcast:tag`

### خروجی پارس Channel

```json
{
  "feed_url": "...",
  "title": "",
  "description": "",
  "image": "",
  "link": "",
  "language": "",
  "author": "",
  "owner_name": "",
  "owner_email": "",
  "categories": [],
  "tags": [],
  "episodes": []
}
```

**اولویت فیلدها:**

- description: `channel.description` → `itunes:summary`
- image: `itunes:image@href` → `channel.image.url`
- author: `itunes:author` → `itunes:owner.name`

### خروجی پارس هر Item (Episode)

```json
{
  "title": "",
  "content": "",
  "audio_url": "",
  "cover_url": "",
  "tags": [],
  "publish_date": "",
  "guid": "",
  "duration": "",
  "season_number": 1,
  "episode_number": 0
}
```

**اولویت content:** `content:encoded` → `description` → `itunes:summary`  
**audio_url:** از `enclosure@url` (فقط آیتم‌هایی که audio_url دارند import شوند)  
**cover_url:** `itunes:image` → `media:thumbnail` → `media:content(image)` → `image.url`  
**duration:** اگر عدد خام (ثانیه) بود → تبدیل به `H:MM:SS` یا `MM:SS`  
**tags:** `itunes:keywords` (جدا با `,` `،` `;` `|`) + `podcast:tag`

---

## ماژول ۲: RSS Importer

### ورودی

- لیست URL فید (آرایه یا فایل متنی: یک URL در هر خط؛ خطوط `#` کامنت)
- یا CLI/API با پارامترهای زیر

### پارامترهای import

| پارامتر | پیش‌فرض | توضیح |
|---------|---------|--------|
| dry_run | false | فقط parse + گزارش، بدون ذخیره |
| skip_existing | true | اپیزود تکراری skip (با به‌روزرسانی metadata جزئی) |
| limit_episodes | 0 (همه) | حداکثر اپیزود per feed |
| force_publish | true | وضعیت published |
| send_email | true | ایمیل خوش‌آمد به کاربر جدید |
| email_map | {} | نگاشت feed_url → email واقعی |
| email_domain | domain سایت | برای ایمیل ساختگی: `{slug}@{domain}` |
| export_csv | null | خروجی CSV preview |

### جریان import برای هر فید

```
1. parse feed
2. اگر dry_run → فقط گزارش + optional CSV export
3. جستجوی podcast موجود با source_feed_url (نرمال‌شده)
4. اگر موجود:
   - به‌روزرسانی metadata (categories, tags, cover اگر نداشت)
   - import اپیزودهای جدید
   - status = "updated"
5. اگر جدید:
   - resolve email: email_map[url] → owner_email فید → slug@domain
   - get_or_create user (اگر email موجود → reuse)
   - create podcast با source_feed_url
   - sideload/download cover image
   - create episodes
   - اگر user جدید → welcome email (فقط اگر email واقعی، نه generated)
   - status = "imported"
6. گزارش: created / updated / skipped per feed
```

### منطق import اپیزود

```
existing = find by rss_guid در همان podcast
        OR find by audio_url در همان podcast

if existing AND skip_existing:
  - اگر cover یا tags تغییر کرده → update metadata
  - return "updated" یا "skipped"

if existing AND NOT skip_existing:
  - skip

if rss_guid globally exists در podcast دیگر:
  - skip

else:
  - insert episode
  - ذخیره rss_guid
  - episode_number: از فید یا auto next number
  - publish_date: از pubDate یا now
  - return "created"
```

### گزارش import

```json
{
  "feeds": [
    {
      "feed_url": "",
      "title": "",
      "podcast_id": null,
      "episodes_count": 0,
      "episodes_created": 0,
      "episodes_updated": 0,
      "episodes_skipped": 0,
      "status": "imported|updated|dry_run|error",
      "error": null
    }
  ],
  "errors": [],
  "accounts": [
    {
      "username": "",
      "email": "",
      "password": "",
      "podcast": "",
      "podcast_url": ""
    }
  ]
}
```

### CLI / API (الگوی پیشنهادی)

```
import-rss --feeds="url1,url2"
import-rss --feeds-file=feeds.txt
import-rss --feeds-file=feeds.txt --dry-run --export-csv=preview.csv
import-rss --feeds-file=feeds.txt --limit-episodes=10
import-rss --feeds-file=feeds.txt --email-map=owners.json
```

---

## ماژول ۳: RSS Feed Generator (Export)

### URL فید خروجی

```
/{feed_base}/{podcast_slug}/feed/
```

پیش‌فرض `feed_base = channel` → مثال: `/channel/radio-raah/feed/`

### تنظیمات

| تنظیم | پیش‌فرض |
|-------|---------|
| enable_rss | true |
| feed_title_format | `{channel_title}` |
| feed_desc_format | `{channel_description}` |
| feed_language | locale پروژه |
| copyright | |
| owner_name | نام سایت |
| owner_email | ایمیل ادمین |
| explicit | no / yes / clean |
| default_feed_image | URL |
| feed_caching | true |
| cache_ttl | 3600 ثانیه |
| feed_analytics | true (optional) |

### خروجی XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>...</title>
    <link>{podcast_page_url}</link>
    <description>...</description>
    <language>...</language>
    <copyright>...</copyright>
    <itunes:author>...</itunes:author>
    <itunes:explicit>no</itunes:explicit>
    <itunes:image href="..."/>
    <item>
      <title>...</title>
      <link>{episode_page_url}</link>
      <guid isPermaLink="false">episode-{id}</guid>
      <pubDate>{RFC 2822}</pubDate>
      <description><![CDATA[...]]></description>
      <enclosure url="..." length="0" type="audio/mpeg"/>
      <itunes:duration>45:30</itunes:duration>
    </item>
  </channel>
</rss>
```

**قوانین:**

- فقط اپیزودهای published با `audio_url` غیرخالی
- Content-Type: `application/rss+xml; charset=UTF-8`
- Cache با TTL قابل تنظیم
- Invalidate cache هنگام publish/update اپیزود
- 404 اگر slug نامعتبر

---

## فایل feeds.txt (منبع import)

فرمت:

```
# یک URL در هر خط
# خطوط # کامنت

https://feed.podbean.com/RadioRaah/feed.xml
https://rss.castbox.fm/everest/1f4e2c0cae1740f5bff605527db43b59.xml
https://feeds.acast.com/public/shows/65417dfc6143f1001280fb90
https://www.omnycontent.com/d/playlist/05c002e0-37f2-42b5-a34d-b38c00523ad5/e7f9558f-024b-418b-96d7-b420015b6f1e/26fe549e-ec26-42b6-8d2e-b420015b6f37/podcast.rss
https://feeds.acast.com/public/shows/6253d9a4d862aa0012f384fa
https://feed.podbean.com/charcharkh/feed.xml
https://feeds.acast.com/public/shows/69212ea3c367efee96509473
https://feeds.acast.com/public/shows/624fd0fe3b43120012e43cb5
https://feeds.acast.com/public/shows/624d67c5c6535900128484a3
https://shenoto.net/service/api/feed/yurionradio
https://feeds.acast.com/public/shows/628cf0e369be4d0014f80b46
https://feeds.acast.com/public/shows/65674fccc3ca8a00127b7474
https://feed.podbean.com/digesttt/feed.xml
https://feeds.acast.com/public/shows/66556d86a8e5c200126c6fac
https://feeds.transistor.fm/b9dc6eb4-5cff-40b0-9813-71f649d0853b
https://feeds.acast.com/public/shows/69c78827b9917327710c49c5
```

---

## الزامات غیرعملکردی

1. **Idempotent:** اجرای مجدد import نباید duplicate بسازد
2. **Resilient:** خطای یک فید، بقیه را متوقف نکند
3. **Logging:** لاگ per-feed با آمار created/updated/skipped
4. **Security:** sanitize URL، HTML، email؛ rate limit روی fetch
5. **Encoding:** UTF-8 everywhere؛ CSV با BOM برای Excel
6. **Extensible:** hook/event بعد از create podcast و episode (برای analytics، notification و...)

---

## تحویل‌ها

1. Schema/migration دیتابیس
2. RSS Parser (unit-testable، جدا از HTTP)
3. Import Service + CLI یا admin endpoint
4. Feed Generator + route/endpoint
5. فایل `feeds.txt` نمونه
6. README با دستورات import و نمونه خروجی
7. تست‌ها برای: parse نمونه فید، dedup، normalize URL، generate XML

---

## قبل از کدنویسی

1. ساختار فعلی پروژه‌ی من را بررسی کن
2. مدل User/Podcast/Episode موجود را با schema بالا map کن
3. اگر entity نداریم، پیشنهاد migration بده
4. سپس ماژول‌ها را به ترتیب: Parser → Importer → Generator پیاده کن
5. در پایان یک dry-run روی 2-3 فید از لیست بالا اجرا کن و گزارش بده

**پروژه‌ی مقصد:** [اینجا توضیح پروژه، stack، و مسیر repo را بنویس]
