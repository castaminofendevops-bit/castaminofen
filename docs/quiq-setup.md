# Quiq Setup — Quick Local Setup

این فایل یک راهنمای سریع و فشرده برای راه‌اندازی لوکال توسعه (برای reviewers و contributors جدید) است. اگر دنبال یک checklist سریع هستید از این استفاده کنید.

1) کلون و نصب

```bash
git clone <repo>
cd castaminofen
pnpm install
```

2) تنظیم env و بالا آوردن زیرساخت‌ها

```bash
cp .env.example .env
pnpm docker:up   # PostgreSQL, Redis, MinIO
```

3) دیتابیس و seed

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

4) اجرا (محیط توسعه)

```bash
# API Gateway
pnpm --filter @castaminofen/api-gateway dev

# Web
pnpm --filter @castaminofen/web dev

# Mobile (Expo)
pnpm --filter @castaminofen/mobile dev
```

5) تست سریع ماژول RSS (example)

```bash
pnpm --filter @castaminofen/api-gateway test -- src/modules/rss/rss-importer.service.spec.ts
```

6) مشاهده Swagger

```text
http://localhost:3000/docs
```

7) نکات اضافی

- اگر موبایل روی دستگاه واقعی تست می‌کنید، `EXPO_PUBLIC_API_URL` را به `http://<LAN-IP>:3000/api/v1` تنظیم کنید.
- برای mirrorMedia نمونه، مطمئن شوید MinIO فعال است و env مربوطه ست شده است.
- اگر خطای network دارید، health endpoint را بررسی کنید: `curl http://localhost:3000/health`.

این صفحه یک shorthand است؛ راهنمای کامل توسعه در `docs/developer-guid.md` قرار دارد.
