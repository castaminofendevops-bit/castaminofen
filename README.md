# کستامینوفن (Castaminofen)

Super App رسانه‌ای برای بازار فارسی — پادکست، کتاب صوتی و ویدیو در یک تجربه واحد.

## پیش‌نیازها

- Node.js 20+
- pnpm 9+
- Docker Desktop (برای PostgreSQL، Redis، MinIO)

## راه‌اندازی سریع

```bash
# 1. کلون و نصب (Prisma Client به‌صورت خودکار generate می‌شود)
pnpm install

# 2. کپی env
cp .env.example .env

# 3. زیرساخت
pnpm docker:up

# 4. دیتابیس
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# 5. اجرا
pnpm dev
```

## پورت‌ها

| سرویس | پورت |
|--------|------|
| API Gateway | 3000 |
| Swagger Docs | http://localhost:3000/docs |
| Web App | 3100 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| MinIO | 9000 (API) / 9001 (Console) |

## حساب‌های Demo

| نقش | ایمیل | رمز |
|-----|-------|-----|
| کاربر | user@castaminofen.ir | password123 |
| سازنده | creator@castaminofen.ir | password123 |
| ادمین | admin@castaminofen.ir | password123 |

## ساختار Monorepo

```
castaminofen/
├── apps/
│   ├── web/          # Next.js — وب و پنل سازنده
│   └── mobile/       # React Native (Expo) — موبایل
├── packages/
│   ├── database/     # Prisma schema + client
│   └── shared/       # Types, constants
├── services/
│   └── api-gateway/  # NestJS — API Gateway + Microservice modules
├── docs/             # مستندات فارسی
└── docker-compose.yml
```

## مستندات

- [معماری سیستم](./docs/ARCHITECTURE.md)
- [مشخصات API](./docs/API.md)
- [تصمیمات فنی](./docs/TECH-DECISIONS.md)
- [Roadmap](./docs/ROADMAP.md)
- [ریسک‌ها](./docs/RISKS.md)
- [Definition of Done](./docs/DEFINITION-OF-DONE.md)
- [UI/UX](./docs/UI-UX.md)

## تست

```bash
pnpm test
```

## لایسنس

Proprietary — Castaminofen MVP
