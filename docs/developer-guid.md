# Developer Guide — Castaminofen

این سند راهنمای سریع برای توسعه‌دهنده‌هاست: راه‌اندازی محلی، اجرای تست‌ها، نکات مهم کدنویسی و نحوه کار با ماژول RSS (شامل `mirrorMedia`).

## پیش‌نیازها

- Node.js 20+
- pnpm 9+
- Docker (برای PostgreSQL, Redis, MinIO)
- Git

## راه‌اندازی محلی (یک‌باره)

1. مخزن را کلون کنید و در شاخهٔ روت اجرا کنید:

```bash
pnpm install
```

2. کپی فایل env و مقداردهی اولیه زیرساخت (Docker Compose):

```bash
cp .env.example .env
pnpm docker:up
```

3. ایجاد و migrate دیتابیس و seed:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

4. اجرای سرویس‌ها (در workspace چندگانه):

```bash
# در یک ترمینال
pnpm --filter @castaminofen/api-gateway dev

# در ترمینال دیگر (وب)
pnpm --filter @castaminofen/web dev

# در ترمینال دیگر (موبایل)
pnpm --filter @castaminofen/mobile dev
```

Swagger UI: http://localhost:3000/docs

## متغیرهای مهم محیطی

- `DATABASE_URL` — connection string به PostgreSQL
- `REDIS_URL` — اتصال Redis
- `STORAGE_ENDPOINT`, `STORAGE_BUCKET`, `STORAGE_KEY`, `STORAGE_SECRET` — برای MinIO/S3
- `EXPO_PUBLIC_API_URL` — برای اپ موبایل (موقع اجرای Expo)

## اجرای تست‌ها

```bash
pnpm test               # تمام تست‌ها در تمام پکیج‌ها
pnpm --filter @castaminofen/api-gateway test -- src/modules/rss/rss-importer.service.spec.ts
```

اگر در محیط CI یا locally با خطای fetch روبه‌رو شدید (node versions قدیمی)، اطمینان حاصل کنید که `global.fetch` پلیفیله یا از `node18+` استفاده می‌کنید.

## RSS Importer — نکات عملی

- Endpoint ادمین برای ایمپورت: `POST /creator/import-rss` (Auth: ADMIN)
- بدنهٔ درخواست (نمونه):

```json
{
  "feeds": ["https://feed.podbean.com/RadioRaah/feed.xml"],
  "contentType": "PODCAST",
  "mirrorMedia": false,
  "dryRun": false
}
```

- `mirrorMedia`:
  - `false` (پیش‌فرض): فقط URL رسانه نگهداری می‌شود.
  - `true`: سرور فایل را دانلود و با `StorageService.uploadObject` در S3/MinIO آپلود می‌کند؛ سپس `mediaUrl` اپیزود به آدرس آپلودشده تغییر می‌کند.
  - قبل از استفاده از `mirrorMedia: true` مطمئن شوید که تنظیمات Storage صحیح و فضای لازم وجود دارد.

## کدنویسی و بهترین شیوه‌ها

- از تزریق (`constructor(private readonly ...)`) برای سرویس‌ها استفاده کنید و تست‌های کوچک برای منطق محلی بنویسید.
- برای تغییرات مدل دیتابیس از Prisma migration استفاده کنید (`pnpm db:migrate`).
- لاگ‌ها را مفید نگه دارید — بخصوص در ماژول‌های import که نیاز به troubleshooting دارد.

## نکات مربوط به Pull Request

- یک PR کوچک و قابل بازبینی ارسال کنید؛ هر PR باید یک توصیف واضح و تست‌های مرتبط داشته باشد.
- برای تغییرات مستندات، فایل‌های md مرتبط را به‌روز کنید (docs/*).

## منابع مفید

- API docs: `http://localhost:3000/docs`
- DB schema: `packages/database/prisma/schema.prisma`
- Storage service: `services/api-gateway/src/common/storage/storage.service.ts`
