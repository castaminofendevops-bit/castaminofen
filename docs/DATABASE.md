# Database Schema — خلاصه

جزئیات کامل در `packages/database/prisma/schema.prisma`

## Entity Relationship

```
User ──┬── CreatorProfile ── Content ── Episode
       ├── Subscription
       ├── Purchase ── Content
       ├── Follow ── CreatorProfile
       ├── LibraryItem ── Content
       ├── Playlist ── PlaylistItem ── Episode
       ├── PlaybackState ── Episode
       └── Download ── Episode
```

## جداول اصلی

| جدول | توضیح | Index کلیدی |
|------|-------|-------------|
| users | کاربران | email |
| creator_profiles | پروفایل سازنده | slug |
| contents | پادکست/کتاب/ویدیو | type+status, title |
| episodes | اپیزود/فصل | contentId+episodeNumber, title |
| playback_states | موقعیت پخش | userId+lastPlayedAt |
| downloads | دانلود آفلاین | userId+status |
| subscriptions | اشتراک | userId |
| purchases | خرید تکی | userId, gatewayRef |
| follows | دنبال‌کردن | userId+creatorId |
| playlists | پلی‌لیست | userId |
| library_items | کتابخانه | userId+contentId |

## Enums

- `ContentType`: PODCAST, AUDIOBOOK, VIDEO
- `ContentStatus`: DRAFT, PUBLISHED, ARCHIVED
- `SubscriptionPlan`: FREE, PREMIUM, CREATOR
- `DownloadStatus`: PENDING, IN_PROGRESS, COMPLETED, FAILED
