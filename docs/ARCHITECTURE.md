# سند معماری سیستم — کستامینوفن

## ۱. نمای کلی

کستامینофن یک Super App رسانه‌ای Mobile-First است که سه نوع محتوا (پادکست، کتاب صوتی، ویدیو) را در یک پلتفرم واحد ارائه می‌دهد.

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ React Native │  │   Next.js    │  │  Desktop*    │       │
│  │   (Mobile)   │  │    (Web)     │  │   (Phase 2)  │       │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘       │
└─────────┼─────────────────┼─────────────────────────────────┘
          │                 │
          ▼                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (NestJS)                      │
│  Auth │ Content │ Media │ User │ Payment │ Health            │
└─────────┬───────────┬───────────┬───────────┬─────────────────┘
          │           │           │           │
          ▼           ▼           ▼           ▼
┌─────────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐
│ PostgreSQL  │ │  Redis  │ │  MinIO  │ │ CDN (Prod)  │
│  (Primary)  │ │ (Cache) │ │  (S3)   │ │             │
└─────────────┘ └─────────┘ └─────────┘ └─────────────┘
```

## ۲. معماری Microservices

در MVP، تمام سرویس‌ها به‌صورت **ماژول‌های NestJS** در یک Gateway واحد پیاده‌سازی شده‌اند — قابل جداسازی به سرویس‌های مستقل بدون تغییر API.

| سرویس | مسئولیت | پورت (مستقل) |
|--------|---------|--------------|
| API Gateway | Routing، Rate Limit، Swagger | 3000 |
| Auth Service | JWT، OAuth، Refresh Token | 3001 |
| Content Service | CRUD محتوا، Explore، Search | 3002 |
| Media Service | Streaming، Playback Sync، Download | 3003 |
| User Service | Follow، Library، Playlist | 3004 |
| Payment Service | Subscription، Purchase (Zarinpal stub) | 3004 |
| Recommendation* | پیشنهاد شخصی — Phase 2 | 3005 |

## ۳. جریان داده — پخش رسانه

```
Client → GET /media/stream/:episodeId (JWT)
       → Media Service: بررسی دسترسی (Premium/Purchase)
       → Signed URL تولید می‌شود
       → Client: پخش مستقیم از CDN/S3
       → POST /media/playback/:episodeId (هر 30 ثانیه)
       → PlaybackState در PostgreSQL + Redis cache
```

## ۴. امنیت

- **Authentication**: JWT (Access 7d) + Refresh Token (30d)
- **Authorization**: Role-based (USER, CREATOR, ADMIN)
- **Premium Content**: بررسی Subscription یا Purchase قبل از stream
- **Media URLs**: HMAC-signed URLs با expiry (Light DRM)
- **Transport**: HTTPS در production
- **Rate Limiting**: 100 req/min per IP

## ۵. Offline-First

- دانلود اپیزود → ذخیره URL/مسیر محلی در جدول `downloads`
- Playback state همگام‌سازی با سرور هنگام اتصال
- Mobile: expo-secure-store برای token

## ۶. Observability

- Structured logging (NestJS Logger)
- Health endpoint: `/api/v1/health`
- Phase 2: OpenTelemetry + Grafana

## ۷. مقیاس‌پذیری

- Horizontal scaling: Stateless API Gateway
- Database: Read replicas (Phase 2)
- Media: CDN edge caching
- Redis: Session + hot content cache

## ۸. انطباق با ایران

- درگاه پرداخت: Zarinpal/IDPay (stub در MVP)
- CDN: ArvanCloud/Cloudflare — configurable
- Object Storage: S3-compatible (MinIO dev / Arvan S3 prod)
