# گزارش بازیابی وضعیت پروژه — Castaminofen

**تاریخ:** ۶ تیر ۱۴۰۵ (July 6, 2026)  
**روش:** ممیزی مستقیم از کد، مستندات، git، و اجرای build/test — بدون حدس از مکالمات قبلی

---

## ۱. خلاصه پروژه

**کستامینوفن (Castaminofen)** یک Super App رسانه‌ای برای بازار فارسی است که پادکست، کتاب صوتی و ویدیو را در یک تجربه واحد ارائه می‌دهد. هدف MVP: حلقه کامل «کاوش → پخش → ادامه گوش دادن → کتابخانه» با پنل سازنده، احراز هویت JWT، و زیرساخت آماده برای فازهای رشد (ASR، پیشنهاد، پرداخت واقعی).

---

## ۲. وضعیت فعلی

| مورد | مقدار |
|------|-------|
| **Branch** | `main` |
| **آخرین commit** | `2c74f1f` — `first commit` (تنها commit موجود در تاریخچه) |
| **Working tree** | ~۸۰ فایل به‌عنوان modified/untracked؛ **۱۱ فایل** diff محتوایی واقعی دارند، بقیه عمدتاً تغییر line-ending (LF↔CRLF) |
| **node_modules** | نصب شده |
| **`.env`** | وجود دارد |
| **Docker** | اجرا نیست — هیچ container فعالی (`docker compose ps` خالی) |
| **`pnpm build`** | ✅ موفق — ۶ پکیج (ui-tokens, shared, database, api-gateway, web, mobile) |
| **`pnpm test`** | ✅ موفق — ۳ تست واحد `AuthService` در api-gateway |
| **Runtime کامل (`pnpm dev`)** | ⚠️ تأیید نشده — بدون Docker (PostgreSQL/Redis/MinIO) API بالا نمی‌آید |

### نقشه معماری (از README + docs/ARCHITECTURE.md)

```
castaminofen/                    # pnpm + Turborepo monorepo
├── apps/
│   ├── web/                     # Next.js 15, React 19 — پورت 3100
│   └── mobile/                  # Expo SDK 52, React Native 0.76
├── packages/
│   ├── database/                # Prisma schema, migrations, seed
│   ├── shared/                  # Types, constants
│   └── ui-tokens/               # Design tokens (CSS + TS)
├── services/
│   └── api-gateway/             # NestJS — Auth, Content, Media, User, Payment
├── docs/                        # مستندات فارسی (معماری، API، UI/UX، ...)
├── design-roadmap.md            # نقشه راه UX/Design Engineering (July 2026)
├── docker-compose.yml           # PostgreSQL, Redis, MinIO
├── .github/workflows/a11y.yml   # CI: axe accessibility audit روی web
└── turbo.json                   # build/dev/test/lint pipeline
```

### Tech stack (از package.jsonها)

| لایه | تکنولوژی |
|------|----------|
| Monorepo | pnpm 9, Turborepo 2, Node 20+ |
| Web | Next.js 15, Zustand, CSS variables (بدون Tailwind) |
| Mobile | Expo 52, expo-router, expo-av, Zustand |
| Backend | NestJS, Prisma, PostgreSQL, Redis, MinIO |
| تست | Jest (فقط auth.service.spec.ts) |
| CI | GitHub Actions — a11y workflow |

---

## ۳. کارهای نیمه‌کاره

### A) تغییرات uncommitted (کار فعال — commit نشده)

**شواهد:** `git diff --stat` نشان می‌دهد تغییرات محتوایی اصلی در این فایل‌هاست:

| حوزه | فایل‌های کلیدی | توضیح |
|------|----------------|-------|
| **Tablet UX (موبایل)** | `TabletTabRail.tsx` (جدید، untracked), `(tabs)/_layout.tsx`, `player.tsx`, `search.tsx`, `library.tsx`, `index.tsx` | Side navigation برای تبلت، مخفی کردن bottom tab bar، responsive grids |
| **Theme (وب)** | `layout.tsx`, `ThemeProvider.tsx` | پاکسازی/ساده‌سازی theme provider |
| **مستندات** | `design-roadmap.md` | به‌روزرسانی checklist فاز ۷ (tablet layouts → done) |
| **Dependencies** | `apps/web/package.json`, `pnpm-lock.yaml` | تغییرات جزئی dependency |

بقیه ~۷۰ فایل modified در `git status` diff محتوایی ندارند (فقط line-ending).

### B) TODOها و placeholderهای داخل کد

| مورد | محل | وضعیت |
|------|-----|-------|
| «به‌زودی» — دانلودها | `apps/mobile/app/(tabs)/downloads.tsx` | UI placeholder |
| «به‌زودی» — ابزارها | `apps/mobile/app/(tabs)/tools.tsx` | بخش‌های غیرفعال |
| «به‌زودی» — اپیزودهای بیشتر | `apps/mobile/app/video/[id].tsx` | placeholder |
| «حذف از کتابخانه — به‌زودی» | `apps/web/.../content/[id]/page.tsx` | feature ناقص |
| Integration tests | `docs/DEFINITION-OF-DONE.md` | `[ ]` — Phase 1.1 |
| E2E tests | `docs/DEFINITION-OF-DONE.md` | `[ ]` — Phase 2 |

### C) موارد باز در design-roadmap.md (فازهای ۱–۷)

**تک‌مورد باز در فاز ۴:**
- `[ ]` Bottom sheet player prototype (موبایل)

**فاز ۸ / آینده (نمونه‌های مهم):**
- Onboarding (first-run screens) — score 2.0/10
- Keyboard navigation در search (web)
- Trending shelf, related content
- Creator analytics dashboard
- Motion design (Reanimated, page transitions)
- Component library یکپارچه (`Button`, `Input`, `Toast`)
- Downloads واقعی (API stub موجود، UI placeholder)

**طبق design-roadmap، فازهای ۱–۷ عمدتاً `[x]` شده‌اند** — شامل: ui-tokens، a11y pass، cover images، creator upload، web video player، premium paywall، tablet layouts.

### D) API vs UI (از design-roadmap — هنوز باز)

| قابلیت API | Web | Mobile |
|------------|-----|--------|
| Playlists | ❌ | ❌ (فقط label) |
| Downloads | ❌ | placeholder |
| Payment/Subscribe | stub UI (paywall) | stub UI |
| Profile (`/auth/me`) | ❌ | ❌ |
| Creator episodes | ✅ (upload form) | ❌ |

---

## ۴. فرضیه من درباره نقطه توقف

### آخرین کاری که واقعاً روش کار می‌شده

**پیاده‌سازی Phase 7 از design-roadmap — به‌خصوص «Mobile tablet layouts»** (side nav، split views، responsive grids).

### شواهد

1. **`TabletTabRail.tsx`** فایل جدید untracked است — side navigation مخصوص تبلت با ۴ tab (خانه، جستجو، کتابخانه، ابزارها).
2. **`(tabs)/_layout.tsx`** diff نشان می‌دهد: `useResponsiveLayout().isTablet` → bottom tab bar مخفی + `TabletTabRail` نمایش داده می‌شود.
3. **`player.tsx` و `search.tsx`** refactor بزرگ دارند (۲۰۰+ خط تغییر) — احتمالاً split-view و responsive layout.
4. **`design-roadmap.md`** در working tree تغییر کرده و Phase 7 checklist شامل «Mobile tablet layouts» است که `[x]` شده.
5. **تنها ۱ commit** در repo وجود دارد — کل MVP در `first commit` است و **تمام کار design-engineering (فازهای ۱–۷) commit نشده** باقی مانده.

### وضعیت این کار

| معیار | نتیجه |
|-------|-------|
| Compile/build | ✅ سالم — `pnpm build` و `tsc --noEmit` (mobile) موفق |
| Unit tests | ✅ ۳/۳ pass |
| Runtime smoke test | ⚠️ انجام نشده (Docker خاموش) |
| Commit | ❌ commit نشده |
| تکمیل فاز | ~۹۵٪ — فقط «bottom sheet player prototype» در فاز ۴ باز مانده |

**جمع‌بندی:** کار **نیمه‌commit شده ولی از نظر build سالم** است — توقف احتمالاً بعد از اتمام tablet UX و قبل از commit/تست دستی runtime.

---

## ۵. سوالات من از تو

1. **آیا قصد داشتی تغییرات فعلی (tablet UX + theme) را commit کنی** قبل از توقف، یا بخشی از آن هنوز WIP است؟
2. **Remote repository** وجود دارد؟ (فقط `main` + `first commit` محلی دیده شد — push history نامشخص)
3. **اولویت بعدی** کدام است؟
   - commit + deploy staging (M1 در ROADMAP)
   - onboarding (ONB-001)
   - integration/E2E tests
   - bottom sheet player
4. **Docker** را معمولاً local اجرا می‌کنی؟ (الان خاموش است — برای smoke test لازم است)
5. **رنگ برند نهایی** `#776CFE` (light/dark در roadmap) تأیید شده یا هنوز بحث purple vs gold باز است؟
6. **Downloads tab** — قرار است hidden بماند (طبق Phase 1 checklist که `[x]` شده) یا دوباره visible شود؟

---

## ۶. پیشنهاد قدم بعدی

### گزینه A — تثبیت و commit (پیشنهاد اول)

1. `pnpm docker:up` → `pnpm dev` → smoke test دستی (login، explore، play، search)
2. Review diff واقعی ۱۱ فایل + `TabletTabRail.tsx`
3. Commit با message مثل: `feat(mobile): tablet side nav and responsive tab layouts`
4. (اختیاری) push + PR

**چرا:** بیشترین ریسک الان **از دست رفتن ~۸۰ فایل uncommitted** است، نه build شکسته.

### گزینه B — ادامه design-roadmap

1. Bottom sheet player prototype (آخرین `[ ]` در فاز ۴)
2. سپس onboarding (Phase 8 / ONB-001)
3. Integration tests طبق DEFINITION-OF-DONE

**چرا:** MVP feature-complete است؛ gap اصلی UX maturity و test coverage است.

---

## پیوست — دستورات تأیید سریع

```bash
# زیرساخت
pnpm docker:up
pnpm db:migrate
pnpm db:seed

# اجرا
pnpm dev

# تأیید build/test (هر دو ✅ در ممیزی امروز)
pnpm build
pnpm test
```

## پیوست — Demo accounts (از README)

| نقش | ایمیل | رمز |
|-----|-------|-----|
| کاربر | user@castaminofen.ir | password123 |
| سازنده | creator@castaminofen.ir | password123 |
| ادمین | admin@castaminofen.ir | password123 |

---

*این گزارش فقط بر اساس شواهد موجود در repo تهیه شده. هیچ تغییر کدی اعمال نشده — منتظر تأیید تو.*
