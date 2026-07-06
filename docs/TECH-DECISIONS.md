# تصمیمات فنی و دلیل انتخاب

## Frontend Mobile: React Native + Expo

**انتخاب**: React Native با Expo SDK 52

| گزینه | مزایا | معایب | تصمیم |
|-------|-------|-------|-------|
| React Native | اشتراک TypeScript با Web، ecosystem بزرگ، expo-av برای media | Performance کمی پایین‌تر از native | ✅ |
| Flutter | Performance عالی، UI یکپارچه | Dart جدا از Web stack، hiring سخت‌تر در ایران | ❌ |

**دلایل کلیدی**:
- یک تیم، دو پلتفرم (iOS/Android) + اشتراک `@castaminofen/shared`
- `expo-av` پشتیبانی background playback
- OTA updates با EAS
- Expo Router برای navigation مدرن

## Frontend Web: Next.js 15

- App Router برای SSR صفحات Explore (SEO)
- React 19
- Zustand برای state (سبک‌تر از Redux)

## Backend: NestJS

- TypeScript end-to-end
- Modular architecture → microservices-ready
- Built-in validation, Swagger, guards
- Prisma integration

## Database: PostgreSQL + Prisma

- ACID برای تراکنش‌های پرداخت
- Full-text search (Phase 2: pg_trgm)
- Prisma: type-safe migrations

## Cache: Redis

- Session cache
- Hot content (Explore feed)
- Rate limit counters

## Storage: MinIO (S3-compatible)

- Dev: MinIO local
- Prod: Arvan Cloud Object Storage / AWS S3

## API Style: REST

→ جزئیات در [API.md](./API.md)

## Monorepo: Turborepo + pnpm

- Fast builds با caching
- Workspace dependencies (`workspace:*`)
- Single lockfile

## Design System

- Dark mode پیش‌فرض
- فونت Vazirmatn (فارسی)
- رنگ accent: `#7c3aed` (بنفش — تمایز از Spotify سبز)
- Mobile-first spacing و touch targets ≥ 44px

## Payment

- MVP: Zarinpal sandbox stub
- Production: Zarinpal REST API v4

## CDN (Production)

- ArvanCloud CDN برای ایران
- Cloudflare fallback برای خارج

## Test Strategy

| لایه | ابزار | پوشش MVP |
|------|-------|----------|
| Unit | Jest | Auth, Payment services |
| Integration | Supertest | API endpoints |
| E2E | Playwright (Phase 2) | Critical flows |
