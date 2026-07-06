# Castaminofen — Roadmap v1

**نسخه:** 1.0  
**تاریخ:** ۶ تیر ۱۴۰۵ (July 6, 2026)  
**روش تهیه:** ممیزی مستقیم repo، مستندات (`docs/`)، `design-roadmap.md`، git history، build/test، و بررسی کد clients + API  
**هدف سند:** یک مسیر واحد، اولویت‌بندی‌شده و قابل اجرا برای **همه لایه‌ها** — از رفع blocker فعلی تا فاز رشد

---

## ۱. خلاصه اجرایی

**کستامینوفن** Super App رسانه‌ای فارسی (پادکست، کتاب صوتی، ویدیو) است. MVP فاز ۱ از نظر backend و حلقه consume تقریباً کامل است؛ differentiation (AI، monetization زنده، retention) هنوز ساخته نشده.

| بعد | وضعیت | تخمین تکمیل |
|-----|--------|-------------|
| **Infrastructure** | Docker Compose، Turborepo، Prisma | ~90% |
| **Backend (API Gateway)** | ۶ دامنه عملیاتی؛ payment/download stub | ~85% |
| **Packages** | database/shared/ui-tokens | ~85% |
| **Web (Next.js 15)** | Phase 7 design done؛ playlists/profile ناقص | ~78% |
| **Mobile (Expo 52)** | Core loop + UX polish؛ env/API شکننده | ~72% |
| **Tests** | ۱۳ تست backend؛ بدون E2E/client | ~25% |
| **Growth / AI (Phase 2+)** | فقط در roadmap | ~5% |

**North Star (پیشنهادی):** `Weekly Listening Minutes per Active User (WLM/AU)`

**موقعیت فعلی در برنامه design:** پایان Phase 7 (tablet، paywall، skeleton، player sheet) → ورود به Phase 8 / product growth.

**Commits اخیر (HEAD):** `273957d` → `7a9cc07` (mobile UX polish، tab cross-fade، haptics، shimmer)

---

## ۲. 🚨 Blocker فعلی: «صفحات موبایل خالی»

### ۲.۱ علائم گزارش‌شده

کاربر محتوایی داخل tabها (خانه، جستجو، کتابخانه، …) در **حالت موبایل** نمی‌بیند — صفحه ظاهراً خالی یا بدون داده.

### ۲.۲ تشخیص ریشه‌ای (به ترتیب احتمال)

| # | علت محتمل | شواهد | چطور تأیید کنیم |
|---|-----------|--------|-----------------|
| **P0-1** | **API از دستگاه/Emulator در دسترس نیست** | `apps/mobile/lib/apiUrl.ts` — fallback به `localhost:3000`؛ روی گوشی واقعی localhost = خود گوشی | Metro log: `[castaminofen] API_URL=...` — باید IP LAN باشد نه localhost |
| **P0-2** | **Backend + Docker بالا نیست / DB seed نشده** | `GET /explore` خالی → `EmptyState` «فعلاً محتوایی نیست» | `docker compose up -d` + `pnpm db:seed` + `curl localhost:3000/api/v1/explore` |
| **P0-3** | **`.env` موبایل تنظیم نشده** | `apps/mobile/.env.example` — `EXPO_PUBLIC_API_URL` اختیاری | کپی `.env` با `EXPO_PUBLIC_API_URL=http://<LAN-IP>:3000/api/v1` |
| **P1-1** | **Font gate — صفحه کاملاً سفید/تیره** | `apps/mobile/app/_layout.tsx:69` — `if (!loaded) return null` | تا لود فونت Vazirmatn هیچ UI رندر نمی‌شود (~۱–۳ ثانیه) |
| **P1-2** | **ErrorBanner دیده نمی‌شود** | خطای شبکه → `ErrorBanner` بالای scroll | pull-to-refresh؛ چک console |
| **P2-1** | **`TabFadeWrapper` segment mismatch** | `components/TabFadeWrapper.tsx` — opacity min 0.88؛ **محتوا را صفر نمی‌کند** | احتمال پایین برای «کاملاً خالی»؛ بیشتر flash/dim |
| **P2-2** | **Expo Web در viewport موبایل** | flex chain / SafeArea | تست جدا روی Expo Go vs Web |

### ۲.۳ اقدام فوری (Sprint 0 — ۱–۲ روز)

```
□ docker compose up -d
□ pnpm db:migrate && pnpm db:seed
□ pnpm --filter @castaminofen/api-gateway dev   # پورت 3000
□ apps/mobile/.env → EXPO_PUBLIC_API_URL=http://<IP-کامپیوتر>:3000/api/v1
□ pnpm --filter @castaminofen/mobile dev
□ تأیید: explore در مرورگر/API client داده برمی‌گرداند
```

**بهبود کد پیشنهادی (Sprint 0):**

1. **`ApiConnectivityBanner`** — در startup یک `GET /health` بزند؛ اگر fail → banner ثابت با IP راهنما
2. **Font loading** — به‌جای `return null`، splash/skeleton minimal
3. **`TabFadeWrapper`** — `pointerEvents={isFocused ? 'auto' : 'none'}` + تست segment روی Expo Go
4. **Dev overlay** — نمایش `resolveApiUrl()` فقط در `__DEV__`

---

## ۳. وضعیت فعلی — نقشه لایه‌ها

### ۳.۱ Monorepo & Infrastructure

| مورد | وضعیت | فایل/مسیر |
|------|--------|-----------|
| pnpm workspaces + Turborepo | ✅ | `turbo.json`, root `package.json` |
| Docker (PG, Redis, MinIO) | ✅ تعریف شده | `docker-compose.yml` |
| CI a11y (web) | ✅ | `.github/workflows/a11y.yml` |
| Staging deploy | ❌ | Milestone M1 در `docs/ROADMAP.md` |
| E2E CI | ❌ | DoD: E2E Phase 2 |

### ۳.۲ Packages

| Package | نقش | وضعیت | Gap |
|---------|-----|--------|-----|
| `@castaminofen/database` | Prisma schema, migrations, seed | ✅ ~95% | — |
| `@castaminofen/shared` | Types, constants (speed, sleep, plans) | ✅ ~80% | utilities کم |
| `@castaminofen/ui-tokens` | Brand colors, spacing, CSS export | ✅ ~85% | component library ندارد |

### ۳.۳ Backend — `services/api-gateway`

| Module | Endpoints کلیدی | UI wired? | Tests |
|--------|-----------------|-----------|-------|
| **Auth** | register, login, refresh, `/auth/me` | ✅ web+mobile | unit (3) |
| **Content** | explore, search, trending, related, creator CRUD | ✅ | integration (5) |
| **Media** | stream, playback, continue, download | ✅ partial | ❌ |
| **User** | follow, library, playlists CRUD | library ✅؛ playlists ❌ | integration (3) |
| **Payment** | plans, subscribe, verify — **stub** | paywall UI ✅؛ checkout fake | ❌ |
| **Health** | `/health` | — | integration (2) |

**Stubهای مهم:**

- `payment.service.ts` — Zarinpal integrate in production
- Download API — metadata در DB؛ فایل واقعی دانلود نمی‌شود

### ۳.۴ Web — `apps/web`

| Route | وضعیت | Gap |
|-------|--------|-----|
| `/` | ✅ explore + trending + continue | personalization |
| `/search` | ✅ 3-type results + recent | autocomplete |
| `/library` | ✅ | sort/filter، smart shelves |
| `/content/[id]` | ✅ play, follow, library add/remove | optimistic UI |
| `/video/[id]` | ✅ | PiP، chapters |
| `/creator` | ✅ upload + publish | analytics |
| `/login`, `/register` | ✅ | OAuth |
| **Playlists** | ❌ | API آماده |
| **Profile/Settings** | ❌ | `/auth/me` unused در IA |

**Build:** ✅ `pnpm build` (پس از fix `useKeyboardShortcuts.tsx` + `StartHereSection.tsx`)

### ۳.۵ Mobile — `apps/mobile`

| Tab/Route | وضعیت | Gap |
|-----------|--------|-----|
| خانه (`index`) | ✅ explore, categories, trending, continue | API env |
| جستجو | ✅ debounce, filters, recent | voice search |
| کتابخانه | ✅ auth gate, continue, saved | remove item inline |
| ابزارها | ✅ speed, sleep, theme | downloads/sync = به‌زودی |
| دانلودها | hidden tab | placeholder |
| Player | ✅ bottom sheet (phone), mini (tablet) | Reanimated optional |
| `content/[id]`, `video/[id]` | ✅ | — |
| **Playlists** | ❌ | API only |
| **Creator panel** | ❌ | web only |

**UX تازه commit‌شده:** haptics، shimmer skeletons، `TabFadeWrapper`، `ThemedRefreshControl`، `PlayerCoachMark`، onboarding modal

### ۳.۶ Tests & Quality

| لایه | پوشش | هدف |
|------|------|-----|
| Auth unit | 3 cases | ✅ |
| Content/User/Health integration | 10 cases | گسترش به media/payment |
| Web a11y CI | axe script | ✅ |
| Mobile tsc | ✅ | |
| E2E Playwright | ❌ | Phase 2 P1 |
| Client unit tests | ❌ | optional |

### ۳.۷ Documentation

| سند | نقش | به‌روز؟ |
|-----|-----|---------|
| `docs/ARCHITECTURE.md` | معماری فارسی | ✅ |
| `docs/API.md` | مرجع endpoint | ✅ (trending/related اضافه) |
| `docs/ROADMAP.md` | Phase 2/3 features | ✅ |
| `docs/DEFINITION-OF-DONE.md` | MVP checklist | ✅ (E2E باز) |
| `docs/product-growth-roadmap.md` | استراتژی رشد | ✅ |
| `docs/UI-UX.md` | اصول طراحی | ⚠️ brand colors قدیمی (gold vs purple) |
| `design-roadmap.md` | UX engineering Phases 1–8 | ✅ Phase 7 done |
| `resume-report.md` | audit اولیه | ⚠️ pre-commit قدیمی |
| **`roadmap-v1.md`** | **این سند — مسیر اجرایی واحد** | ✅ |

---

## ۴. ماتریس اولویت‌بندی

### Legend

- **Impact:** اثر روی کاربر / درآمد / retention  
- **Effort:** تخمین نفر-روز  
- **Layer:** لایه‌های درگیر

### Tier 0 — Unblock (هفته ۱) 🔴

| ID | کار | Layer | Effort | Impact | چرا الان؟ |
|----|-----|-------|--------|--------|-----------|
| T0-1 | رفع connectivity موبایل (env, banner, health check) | Mobile + Docs | 1–2d | 🔥🔥🔥 | blocker گزارش‌شده |
| T0-2 | Docker + seed + smoke script یک‌خطی | Infra + Docs | 0.5d | 🔥🔥🔥 | بدون data همه چیز خالی است |
| T0-3 | Font loading splash (نه blank screen) | Mobile | 0.5d | 🔥🔥 | first impression |
| T0-4 | تست media stream + playback integration | API | 2d | 🔥🔥 | هسته محصول بدون تست |
| T0-5 | `docs/UI-UX.md` sync با ui-tokens | Docs | 0.5d | 🔥 | یک منبع حقیقت brand |

### Tier 1 — Trust & Retention (هفته ۲–۶) 🟠

| ID | کار | Layer | Effort | Impact |
|----|-----|-------|--------|--------|
| T1-1 | Staging deploy (M1) | Infra | 3–5d | 🔥🔥🔥 |
| T1-2 | Event analytics (۲۰ event اول) | Backend + Web + Mobile | 5d | 🔥🔥🔥 |
| T1-3 | Push notifications (FCM) — new episode, continue | Backend + Mobile | 5–8d | 🔥🔥🔥 |
| T1-4 | Playlist UI (web + mobile) | Web + Mobile | 4–5d | 🔥🔥 |
| T1-5 | Profile/Settings (`/auth/me`) | Web + Mobile | 3d | 🔥🔥 |
| T1-6 | Offline download واقعی (expo-file-system) | Mobile + Media API | 8–10d | 🔥🔥 |
| T1-7 | Playback sync reliable (pause/background flush) | Mobile + Web | 3d | 🔥🔥 |
| T1-8 | E2E smoke (Playwright): auth → play → library | Web + CI | 5d | 🔥🔥 |

### Tier 2 — Revenue (هفته ۷–۱۰) 🟡

| ID | کار | Layer | Effort | Impact |
|----|-----|-------|--------|--------|
| T2-1 | Zarinpal live integration | Payment + Web + Mobile | 5–8d | 💰💰💰 |
| T2-2 | Premium gating end-to-end QA | All | 2d | 💰💰 |
| T2-3 | Creator analytics v1 (plays, followers) | API + Web | 5d | 💰 |
| T2-4 | Beta 100 users (M2) | Product + Infra | ongoing | 💰💰 |

### Tier 3 — Differentiation (ماه ۳–۶) 🟢

| ID | کار | Layer | Effort | Impact |
|----|-----|-------|--------|--------|
| T3-1 | **Persian ASR v1** + transcript storage | AI + Media | 4–6w | 🚀🚀🚀 |
| T3-2 | AI Episode Summary (از transcript) | AI + Content | 2w | 🚀🚀🚀 |
| T3-3 | For You feed (rule-based → ML) | API + Clients | 3–4w | 🚀🚀 |
| T3-4 | Semantic / in-audio search | Search + ASR | 2w | 🚀🚀 |
| T3-5 | Creator mobile (read-only stats + upload lite) | Mobile | 2w | 🚀 |
| T3-6 | Component library (`Button`, `Input`, `Toast`) | ui-tokens + clients | 2w | 🚀 |

### Tier 4 — Scale (ماه ۶–۱۲) 🔵

| ID | کار | توضیح |
|----|-----|--------|
| T4-1 | Desktop (Tauri) | reuse web |
| T4-2 | CarPlay / Android Auto | retention |
| T4-3 | AI Chat RAG روی transcript | Phase 3 |
| T4-4 | In-app recording studio | Phase 3 |
| T4-5 | Multi-CDN Iran | `docs/RISKS.md` #1 |

---

## ۵. مسیر ۹۰ روزه (Sprint Plan)

### Sprint 0 (روز ۱–۳): «صفحات دوباره زنده شوند»

**Goal:** هر developer و tester بتواند روی گوشی واقعی محتوا ببیند.

| روز | Deliverable |
|-----|-------------|
| 1 | Docker up + seed + API smoke script (`scripts/smoke-api.sh`) |
| 2 | Mobile `.env` guide + `ApiConnectivityBanner` + dev API URL overlay |
| 3 | Font splash + manual QA checklist (۴ tab + play flow) |

**Definition of Done:**

- [ ] Expo Go روی گوشی: خانه ≥ ۴ کارت محتوا
- [ ] خطای شبکه → پیام فارسی واضح + retry
- [ ] `pnpm build` + `pnpm test` green

---

### Sprint 1 (هفته ۱–۲): Stabilize Backend + Tests

| Task | Owner layer |
|------|-------------|
| Media integration tests (stream 401/200, playback upsert) | API |
| Payment stub tests (verify flow) | API |
| Health check در CI | Infra |
| Staging Dockerfile / deploy doc | Infra |

---

### Sprint 2 (هفته ۳–۴): Retention Basics

| Task | Owner layer |
|------|-------------|
| Analytics events: `app_open`, `play_start`, `play_complete`, `library_add` | All clients |
| Playlist list + create + add episode (web first) | Web + API |
| Playlist mobile (read + add) | Mobile |
| Profile screen (displayName, email, logout) | Web + Mobile |

---

### Sprint 3 (هفته ۵–۶): Monetization Prep

| Task | Owner layer |
|------|-------------|
| Zarinpal sandbox integration | Payment |
| Paywall → real checkout (web) | Web |
| Paywall → deep link / WebView (mobile) | Mobile |
| Premium content E2E test | QA |

---

### Sprint 4 (هفته ۷–۸): Offline + Push

| Task | Owner layer |
|------|-------------|
| Download to local file (mobile) | Mobile + Media |
| Unhide downloads tab (when ≥1 download) | Mobile UX |
| FCM token register + «اپیزود جدید» | Backend + Mobile |

---

### Sprint 5–6 (هفته ۹–۱۲): ASR Foundation

| Task | Owner layer |
|------|-------------|
| Whisper pipeline (batch transcribe on publish) | AI service / worker |
| Transcript API + search index | API |
| Transcript panel در content detail (web) | Web |
| AI summary card (GPT/Local LLM) | API + Web |

---

## ۶. نقشه راه به تفکیک لایه

### ۶.۱ Infrastructure & DevOps

```
Now ──────► Staging (M1) ──────► Production ──────► Multi-region CDN
  │              │                    │
  Docker       CI test gate        Monitoring
  local        + seed auto          + backups (RISKS #backup)
```

**اولویت:** T0-2 → T1-1 → backup/alerting

### ۶.۲ Backend (API Gateway)

```
MVP domains (done) ──► Harden tests ──► Analytics ingest ──► ASR worker ──► Recommendation service
```

**اولویت:** media tests → analytics endpoint → payment live → transcript module

### ۶.۳ Web Client

```
Phase 7 UX (done) ──► Playlists + Profile ──► Zarinpal checkout ──► Transcript UI ──► View Transitions
```

**اولویت:** playlists → profile → page transitions (`design-roadmap` §17) → optimistic UI

### ۶.۴ Mobile Client

```
UX polish (done) ──► API fix (Sprint 0) ──► Playlists ──► Real downloads ──► Push ──► Creator lite
```

**اولویت:** **Sprint 0 blocker** → playlists → downloads → push

### ۶.۵ Packages & Design System

```
ui-tokens (done) ──► Primitive components ──► Storybook (optional) ──► Figma sync
```

**اولویت:** Button/Input/Toast shared → consume in web + mobile

### ۶.۶ QA & Tests

```
13 backend tests ──► +media/payment ──► Playwright E2E ──► Mobile Detox (optional)
```

---

## ۷. هم‌ترازی با اسناد موجود

| سند | Phase/بخش | roadmap-v1 معادل |
|-----|-----------|------------------|
| `docs/DEFINITION-OF-DONE.md` | MVP checklist | Tier 0–1 تکمیل gapهای DoD |
| `docs/ROADMAP.md` | Phase 2 P0: ASR, recs | Tier 3 (Sprint 5–6) |
| `design-roadmap.md` | Phase 8 future | Tier 3–4 |
| `docs/product-growth-roadmap.md` | WLM/AU, retention | Tier 1 analytics + push |
| `docs/RISKS.md` | CDN Iran | Tier 4 multi-CDN |

**تضاد brand:** `docs/UI-UX.md` هنوز gold mobile vs `ui-tokens` purple — **T0-5** باید sync شود.

---

## ۸. معیارهای موفقیت

### ۸.۱ North Star

**WLM/AU** — هدف ۳ ماهه: baseline + 20% (پس از analytics)

### ۸.۲ KPIهای Sprint 0 (blocker)

| KPI | هدف |
|-----|-----|
| Explore load success (mobile device) | 100% در LAN |
| Time to first content card | < 3s روی 4G LAN |
| API error clarity | 100% خطاها → ErrorBanner فارسی |

### ۸.۳ KPIهای Beta (M2)

| KPI | هدف |
|-----|-----|
| D1 retention | > 40% |
| D7 retention | > 20% |
| Auth completion | > 80% |
| Stream start | < 2s (DoD) |

---

## ۹. ریسک‌ها (خلاصه از `docs/RISKS.md` + جدید)

| # | ریسک | Mitigation در roadmap |
|---|------|------------------------|
| R1 | CDN فیلتر ایران | T4-5 multi-CDN |
| R2 | Mobile API localhost | **T0-1** (فوری) |
| R3 | Payment stub → no revenue | T2-1 |
| R4 | No analytics → blind product | T1-2 |
| R5 | ASR cost/latency | batch on publish، cache transcript |
| R6 | Monorepo complexity | CODEOWNERS per layer |

---

## ۱۰. تصمیم‌های پیشنهادی «الان چه کنیم؟»

### اگر فقط یک هفته وقت دارید:

1. **Sprint 0 کامل** (T0-1 → T0-3) — رفع صفحات خالی  
2. **T1-4 Playlists web** — بیشترین ROI با API آماده  
3. **T0-4 media tests** — اطمینان از هسته

### اگر هدف beta عمومی (M2) است:

Tier 0 + Tier 1 (T1-1 staging, T1-2 analytics, T1-3 push, T1-8 E2E)

### اگر هدف تمایز بازار است:

Tier 0 → Tier 2 (revenue) → Tier 3-1 ASR (قبل از هر feature اجتماعی)

---

## ۱۱. پیوست — فایل‌های کلیدی

| موضوع | مسیر |
|--------|------|
| Mobile home | `apps/mobile/app/(tabs)/index.tsx` |
| API URL resolver | `apps/mobile/lib/apiUrl.ts` |
| Mobile API client | `apps/mobile/lib/api.ts` |
| Tab fade | `apps/mobile/components/TabFadeWrapper.tsx` |
| Root layout (fonts) | `apps/mobile/app/_layout.tsx` |
| Web shell | `apps/web/src/components/AppShell.tsx` |
| Payment stub | `services/api-gateway/src/modules/payment/payment.service.ts` |
| Prisma schema | `packages/database/prisma/schema.prisma` |
| Design tokens | `packages/ui-tokens/src/tokens.ts` |
| Docker | `docker-compose.yml` |
| Seed | `packages/database/prisma/seed.ts` |
| Design phases | `design-roadmap.md` |
| Growth strategy | `docs/product-growth-roadmap.md` |

---

## ۱۲. Changelog این سند

| نسخه | تاریخ | تغییر |
|------|-------|-------|
| 1.0 | July 6, 2026 | نسخه اول — audit کامل + blocker mobile + 90-day plan |

---

*این سند مکمل `design-roadmap.md` (UX) و `docs/ROADMAP.md` (features) است — تمرکز آن **اولویت اجرایی cross-layer** و رفع blocker عملیاتی فعلی است.*
