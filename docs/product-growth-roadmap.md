# Product Growth Roadmap — Castaminofen (کستامینوفن)

**نسخه:** 1.0 · **تاریخ:** ژوئیه ۲۰۲۶  
**نقش سند:** استراتژی محصول، رشد، نگهداشت، monetization و UX برای تبدیل Castaminofen به پلتفرم پیشرو پادکست/vodcast فارسی  
**وضعیت فعلی:** MVP فاز ۱ (backend غنی، frontend در حال بلوغ، AI/اجتماعی هنوز پیاده نشده)

---

## Executive Snapshot

Castaminofen یک **Super App رسانه‌ای فارسی** است که پادکست، کتاب صوتی و ویدیو را در یک پلیر واحد ادغام می‌کند. زیرساخت backend برای رشد venture-scale آماده است؛ differentiation واقعی هنوز در لایه **AI، personalization و creator economy** ساخته نشده.

| بعد | وضعیت امروز | پتانسیل ۱۲ ماهه |
|-----|-------------|-----------------|
| Core playback | ✅ عملیاتی | Premium experience |
| Discovery | ⚠️ پایه (explore/search) | AI + habit loops |
| AI intelligence | ❌ فقط در roadmap | Core differentiator |
| Social/community | ❌ schema آماده، UI نیست | Growth engine |
| Monetization | ⚠️ stub (Zarinpal) | Live revenue |
| Retention systems | ❌ | Streaks, push, milestones |

**North Star Metric (پیشنهادی):**  
**Weekly Listening Minutes per Active User (WLM/AU)** — دقیقه گوش‌دادن/تماشای هفتگی به ازای کاربر فعال. این متریک هم engagement، هم retention و هم monetization readiness را منعکس می‌کند.

---

## 1. Current Core Features Audit

> **منبع audit:** `apps/mobile`, `apps/web`, `services/api-gateway`, `packages/database/prisma/schema.prisma`, `docs/ROADMAP.md`

### 1.1 Content Discovery & Browse

| جنبه | جزئیات |
|------|--------|
| **Purpose** | کشف محتوای پادکست، کتاب صوتی، ویدیو |
| **User value** | دسترسی سریع به کاتalog فارسی در یک مکان |
| **Business value** | Top-of-funnel، session start، content inventory leverage |
| **Implementation** | `GET /explore`, `GET /search`, Home tabs (mobile `index.tsx`, web `page.tsx`) |
| **UX strengths** | RTL native، dark mode، ContentCard یکپارچه، دسته‌بندی visual در mobile |
| **UX weaknesses** | بدون personalization، بدون editorial curation، بدون infinite scroll/filter، web بدون category chips |
| **Improvements** | «For You» feed، trending، editorial rails، filter by type/mood/duration، skeleton loading |

### 1.2 Unified Audio/Video Player

| جنبه | جزئیات |
|------|--------|
| **Purpose** | پخش واحد صوت و ویدیو |
| **User value** | یک تجربه برای همه فرمت‌ها؛ speed/skip/sleep |
| **Business value** | Session depth، time-in-app، premium upsell surface |
| **Implementation** | Mobile: `expo-av` (`player.tsx`, `video/[id].tsx`); Web: `PlayerBar.tsx`; API: signed stream URLs |
| **UX strengths** | Speed 0.5–2x، sleep timer، skip ±15s، progress bar، background play (mobile) |
| **UX weaknesses** | Bookmark فقط local state؛ بدون chapter markers؛ بدون queue/up next؛ web player ساده؛ sync position ناقص در client |
| **Improvements** | Mini-player persistent، queue management، chapter support، smart resume، haptic feedback، waveform scrubbing |

### 1.3 Continue Listening & Playback Sync

| جنبه | جزئیات |
|------|--------|
| **Purpose** | ادامه از جایی که کاربر مانده |
| **User value** | Zero friction re-entry — habit formation |
| **Business value** | D7/D30 retention، cross-device stickiness |
| **Implementation** | `PlaybackState` model، `GET /media/continue`, `POST /media/playback/:id`؛ Library section |
| **UX strengths** | Progress bar در library، server-side persistence |
| **UX weaknesses** | Client sync هر 30s مستند شده اما در UI کامل نیست؛ بدون cross-device prompt |
| **Improvements** | Auto-sync on pause/background، «Continue on another device» toast، home screen widget |

### 1.4 Search

| جنبه | جزئیات |
|------|--------|
| **Purpose** | یافتن محتوا با keyword |
| **User value** | Intent-based discovery |
| **Business value** | Feature adoption، content surfacing |
| **Implementation** | `GET /search?q=`؛ mobile trending chips؛ web search page |
| **UX strengths** | Trending suggestions (mobile)، RTL search bar |
| **UX weaknesses** | بدون fuzzy match، بدون search inside audio (ASR)، بدون recent searches، بدون autocomplete |
| **Improvements** | Instant search debounce، recent history، voice search، semantic/AI search (Phase 2) |

### 1.5 Authentication (Login / Signup)

| جنبه | جزئیات |
|------|--------|
| **Purpose** | هویت کاربر و session |
| **User value** | library، continue listening، premium |
| **Business value** | Identity graph، LTV tracking، creator attribution |
| **Implementation** | JWT + refresh، `/auth/register|login|refresh|me`؛ mobile + web UI (`docs/login.md`) |
| **UX strengths** | فارسی، auto-refresh token، persist session |
| **UX weaknesses** | بدون OAuth UI، بدون onboarding post-signup، بدون email verify |
| **Improvements** | Google/Apple sign-in، progressive onboarding، welcome flow |

### 1.6 Library & Saved Content

| جنبه | جزئیات |
|------|--------|
| **Purpose** | محتوای ذخیره‌شده کاربر |
| **User value** | Personal collection |
| **Business value** | Re-engagement anchor، collection mechanics |
| **Implementation** | `LibraryItem` model، `POST/GET /user/library`؛ mobile library tab |
| **UX strengths** | Gated auth UX، continue + saved sections |
| **UX weaknesses** | Web library ساده؛ بدون sort/filter؛ add-to-library در content detail unclear |
| **Improvements** | One-tap save، smart shelves («In Progress», «Finished»)، bulk actions |

### 1.7 Follow Creators

| جنبه | جزئیات |
|------|--------|
| **Purpose** | دنبال کردن سازنده |
| **User value** | New episode awareness |
| **Business value** | Creator loyalty loop، notification trigger |
| **Implementation** | `Follow` model، API endpoints — **UI محدود/ناقص** |
| **UX strengths** | Backend ready |
| **UX weaknesses** | بدون creator profile page، بدون feed از followed creators، بدون notify |
| **Improvements** | Creator page، «New from people you follow» rail، push on publish |

### 1.8 Playlists

| جنبه | جزئیات |
|------|--------|
| **Purpose** | لیست‌های سفارشی اپیزود |
| **User value** | Curation، mood-based listening |
| **Business value** | UGC، shareability، session length |
| **Implementation** | Full CRUD API — **بدون UI در mobile/web** |
| **UX strengths** | Schema supports public playlists |
| **UX weaknesses** | Zero user-facing playlist UX |
| **Improvements** | Create/share playlists، collaborative playlists (Phase 2) |

### 1.9 Creator Panel

| جنبه | جزئیات |
|------|--------|
| **Purpose** | ساخت و انتشار محتوا |
| **User value** | Creator empowerment |
| **Business value** | Supply side growth، marketplace foundation |
| **Implementation** | Web-only `creator/page.tsx`؛ create/publish/list؛ episode upload API |
| **UX strengths** | Role-gated (CREATOR/ADMIN) |
| **UX weaknesses** | بدون analytics، بدون upload UI، بدون episode editor، mobile absent |
| **Improvements** | Upload wizard، draft preview، analytics dashboard، mobile creator lite |

### 1.10 Premium & Payments

| جنبه | جزئیات |
|------|--------|
| **Purpose** | Subscription + one-time purchase |
| **User value** | Access premium content |
| **Business value** | Revenue |
| **Implementation** | Plans (FREE 0 / PREMIUM 149k / CREATOR 299k IRR)، Zarinpal **stub** |
| **UX strengths** | Premium gating در stream API |
| **UX weaknesses** | No paywall UI، no checkout flow، no receipt/history |
| **Improvements** | Paywall modal، plan comparison، trial period، IAP (mobile) |

### 1.11 Offline Downloads

| جنبه | جزئیات |
|------|--------|
| **Purpose** | گوش دادن بدون اینترنت |
| **User value** | Commute/travel use case |
| **Business value** | Stickiness، premium feature candidate |
| **Implementation** | `Download` model + API — mobile tab **empty state only** |
| **UX strengths** | Tab exists، empty state copy |
| **UX weaknesses** | No actual download flow |
| **Improvements** | Download queue، storage management، auto-download next episode |

### 1.12 Tools Tab (Mobile)

| جنبه | جزئیات |
|------|--------|
| **Purpose** | Power user settings (speed, sleep, auth) |
| **User value** | Quick access to playback controls |
| **Business value** | Power user retention |
| **Implementation** | `tools.tsx` — speed chips، sleep timer، login/logout |
| **UX strengths** | Practical grouping |
| **UX weaknesses** | Tool rows non-functional (placeholder)، disconnected from player |
| **Improvements** | Wire tools to player، settings profile section |

### 1.13 Features Documented but NOT Built

| Feature | Status | Source |
|---------|--------|--------|
| AI episode summaries | ❌ Planned P1 | `docs/ROADMAP.md` |
| Persian ASR / in-audio search | ❌ Planned P0 | `docs/ROADMAP.md` |
| Recommendation engine | ❌ Planned P0 | Architecture doc |
| AI Chat discovery (RAG) | ❌ Phase 3 | `docs/ROADMAP.md` |
| OAuth (Google/Apple) | ❌ Schema only | `OAuthAccount` model |
| Push notifications | ❌ | — |
| Analytics/event pipeline | ❌ | — |
| Social feed / comments | ❌ | — |
| Creator analytics | ❌ | — |
| Spatial/immersive UI | ❌ Vision only | User brief |
| Multilingual i18n | ❌ `locale` field only | Schema |
| Email verification | ❌ | `isVerified` unused |

---

## 2. Missing Features — Build Next

### P0 — Critical (بدون این‌ها رقابت با Spotify/Apple غیرممکن است)

| Feature | Why it matters | KPI impact | Effort |
|---------|----------------|------------|--------|
| **Persian ASR + transcript layer** | جستجوی داخل اپیزود = killer feature برای فارسی | Search adoption, session depth | High |
| **Personalized «For You» feed** | Explore static است؛ users expect Spotify-level relevance | DAU, D7 retention | Medium |
| **Push notifications (new episodes, continue)** | #1 re-engagement channel for podcast apps | D7/D30 retention, WAU | Medium |
| **Onboarding flow (3-step)** | First session determines D1 retention | D1 retention, activation rate | Low |
| **Paywall + Zarinpal live** | Revenue = sustainability | Conversion, ARPU | Medium |
| **Playback position sync (client complete)** | Cross-device promise in architecture | D30 retention, NPS | Low |
| **Creator upload pipeline (UI)** | No content = no platform | Content supply, creator NPS | Medium |
| **Download offline (functional)** | Table-stakes for podcast apps in Iran (data cost) | D30 retention, premium conversion | Medium |

### P1 — Important

| Feature | Why it matters | KPI impact |
|---------|----------------|------------|
| **AI episode summaries (TL;DR + timestamps)** | Differentiator vs Apple/YouTube | Feature adoption, share rate |
| **Timestamp bookmarks/notes** | Power users + learning use case | Session depth, retention |
| **Creator analytics dashboard** | Supply-side retention | Creator churn, content volume |
| **Public creator profiles + follow UI** | Social graph foundation | Follow rate, return visits |
| **Playlist UI + share link** | UGC virality | Shares, session length |
| **Queue / Up Next** | Standard player expectation | Listening minutes |
| **Skeleton + empty state polish** | Perceived quality | Bounce rate, NPS |
| **Event analytics (Amplitude/Mixpanel)** | Can't optimize what you don't measure | All KPIs |

### P2 — Nice to Have

| Feature | Why it matters | KPI impact |
|---------|----------------|------------|
| Collaborative playlists | Social engagement | Invites, WAU |
| Audiobook text-audio sync | Niche differentiation | Audiobook segment retention |
| In-app recording studio | Creator lock-in | Creator supply |
| Desktop app (Tauri) | Power listeners | Session duration |
| Parental controls | Family segment | Market expansion |
| Low bandwidth mode | Iran network reality | Completion rate |

---

## 3. Advanced / Future Features — Innovation

### 3.1 AI-Powered Experiences

| Capability | Description | Competitive edge |
|------------|-------------|------------------|
| **Smart Summaries** | ۳-bullet TL;DR + key timestamps + «Is this worth my time?» score | Beat Apple Podcasts' basic show notes |
| **Ask This Episode** | RAG chat over transcript: «What did they say about X?» | No Persian competitor has this |
| **Auto Chapters** | AI-detected topic breaks → navigable chapters | YouTube-like UX for audio |
| **Voice Highlight Clips** | Auto-extract 30s shareable moments | Virality engine |
| **Mood Detection** | Tag episodes by tone (calm, energetic, educational) | Discovery beyond genre |

### 3.2 Personalization Engine

```
Signals: playback history, skip rate, speed preference, time-of-day, follow graph, search queries
         ↓
Model: collaborative filtering + content embeddings (Persian-aware)
         ↓
Surfaces: For You home, «Because you listened to X», morning/evening rails
```

### 3.3 Social & Community

- **Episode reactions** (🔥 💡 ❤️) — lightweight, no comment toxicity
- **Listening parties** — synchronized playback + live chat
- **Public listening profiles** — «Currently listening to...» (opt-in)
- **Community challenges** — «Listen 5 history episodes this week»
- **Creator Q&A episodes** — audience submits questions pre-record

### 3.4 Creator Economy 2.0

- Tip jar (micro-payments)
- Exclusive subscriber episodes
- Dynamic audio ads (creator revenue share)
- Sponsorship marketplace (brand ↔ creator matching)
- Analytics: retention curve per episode, drop-off heatmap

### 3.5 Immersive / Spatial UI (Vision)

- **Ambient player mode** — full-screen cover art + particle motion synced to audio
- **Spatial browse** — card carousel with depth (Reanimated 3 / CSS 3D)
- **Theater mode** for vodcast — chat sidebar, chapter timeline
- **CarPlay / Android Auto** — critical for podcast DAU

### 3.6 Cross-Platform Intelligence

- Handoff: start mobile → continue web (Apple Continuity-like)
- Smart download: pre-fetch next episode on WiFi
- Predictive «Leave for commute» notification with downloaded queue

---

## 4. User Retention Strategy

### 4.1 Habit Loop Architecture

```
CUE → ROUTINE → REWARD → INVESTMENT
 ↓       ↓         ↓          ↓
Push/   Play      Progress   Library
email   episode   milestone  playlist
        during    + streak   follows
        commute
```

### 4.2 Retention Calendar

| Period | Goal | Tactics |
|--------|------|---------|
| **Day 1** | Activation | Onboarding: pick 3 topics → instant personalized feed → play first 60s → «Save to library» prompt |
| **Day 7** | Habit | Push: «You started X — 12 min left»; streak badge; weekly digest email |
| **Day 30** | Ritual | Monthly listening report; «Your top creator»; premium trial offer |
| **Day 90** | Identity | «You're in top 10% listeners of History»; achievement unlock; share card |
| **1 Year** | Loyalty | Anniversary recap video/card; loyalty pricing; early access to AI features |

### 4.3 Reward & Progress Systems

| System | Implementation | Psychology |
|--------|----------------|------------|
| **Listening streaks** | 7/30/100 day badges | Loss aversion |
| **Minutes milestone** | 100 → 1K → 10K minutes | Progress bias |
| **Topic mastery** | Complete all episodes in a series | Collection mechanics |
| **Creator supporter** | Badge for following 5+ creators | Identity building |
| **Completion rate** | «Finished» shelf auto-populated | Goal gradient |

### 4.4 Re-engagement Campaigns

**Push notification strategy:**

| Trigger | Message (FA) | Timing |
|---------|--------------|--------|
| Incomplete episode | «۳ دقیقه تا پایان «{title}»» | 24h after pause |
| New from followed | «{creator} اپیزود جدید منتشر کرد» | On publish |
| Streak at risk | «رکورد ۵ روزه‌ات در خطره!» | 8 PM if no listen today |
| Weekly digest | «این هفته: ۴۵ دقیقه · ۳ اپیزود» | Sunday 10 AM |
| Win-back (D14 inactive) | «محتوای جدید در {favorite_topic}» | Day 14 |

**Email / in-app:**

- Welcome series (3 emails): setup → discover → premium intro
- In-app inbox for creator updates (no email fatigue)
- Contextual upsell after 3rd completed episode

---

## 5. User Acquisition & Virality

### 5.1 Growth Loops

```
Loop A (Content): Creator publishes → followers notified → listen → share clip → new user
Loop B (Social): User shares listening milestone → friend clicks → onboarding with pre-filled interests
Loop C (Referral): Invite friend → both get 1 month Premium → friend activates → creator content discovery
Loop D (SEO): Public episode pages with transcript → Google index → signup to listen full
```

### 5.2 Mechanisms

| Mechanism | Implementation idea | Viral coefficient target |
|-----------|---------------------|---------------------------|
| **Referral program** | Unique link → both get 30-day Premium | K > 0.15 |
| **Shareable AI clips** | 30s highlight + branded card + deep link | Shares/session > 0.05 |
| **Public profiles** | `/u/{username}` — stats, public playlists | Organic SEO |
| **Episode embed widget** | `<iframe>` for blogs/news sites | Creator-driven distribution |
| **Listening milestones** | Instagram-story formatted recap image | 10% share rate on milestones |
| **Community challenges** | «این هفته: پادکست تاریخ» leaderboard | FOMO + social proof |
| **Creator cross-promo** | «More from this network» | Network effects |

### 5.3 Iran-Specific Acquisition Channels

- Collaborate with Persian podcast creators on Instagram/YouTube (primary discovery channel in IR)
- Telegram channel for new episode alerts (high reach in market)
- App Store ASO: «پادکست فارسی»، «کتاب صوتی»، «خلاصه پادکست»
- Partnership with Café Bazaar / Myket for Android distribution

---

## 6. Monetization Opportunities

### 6.1 Revenue Model Matrix

| Model | Complexity | Revenue potential | UX impact | Timing |
|-------|------------|-------------------|-----------|--------|
| **Freemium subscription** | Medium | ★★★★★ | Low (if fair free tier) | Q1–Q2 |
| **Premium tiers** (Free/Premium/Creator) | Low (schema exists) | ★★★★☆ | Medium | Q2 |
| **Per-content purchase** | Low (API exists) | ★★★☆☆ | Medium (audiobooks) | Q2 |
| **Creator tips** | Medium | ★★★☆☆ | Low | Q3 |
| **Dynamic audio ads** | High | ★★★★☆ | High (risk) | Q4 |
| **Sponsorship marketplace** | High | ★★★★★ | Low for users | Q4 |
| **Enterprise/education** | Medium | ★★★☆☆ | B2B separate app | Year 2 |
| **API access (B2B)** | Medium | ★★☆☆☆ | None | Year 2 |
| **White-label** | High | ★★★★☆ | None | Year 2 |
| **Credits for AI features** | Medium | ★★★☆☆ | Medium | Q3 |

### 6.2 Recommended Pricing Strategy (Iran market)

| Tier | Price (IRR/month) | Includes |
|------|-------------------|----------|
| Free | 0 | Ads-lite، streaming، limited downloads (5/month) |
| Premium | 149,000 | Unlimited downloads، AI summaries، no ads، high quality |
| Creator Pro | 299,000 | Analytics، upload unlimited، tip jar، priority support |

**Free trial:** 14 days Premium on signup (credit card optional — Zarinpal one-time verify)

### 6.3 Monetization Principles

1. Never paywall «continue listening» — retention killer
2. AI summaries = premium wedge (clear value)
3. Creators keep 70%+ of tips/sponsorships
4. Ads only on free tier, max 2 per hour (respect listener patience)

---

## 7. UX / UI Improvement Ideas — Awwwards-Level

### 7.1 Onboarding (Linear-quality)

```
Screen 1: «چه چیزی گوش می‌دهید؟» → 3+ topic chips (multi-select)
Screen 2: «چه زمانی گوش می‌دهید؟» → commute / workout / bedtime
Screen 3: Instant personalized feed → auto-play preview → «Sign up to save progress»
```

- Progress indicator (3 dots)
- Skip option with degraded defaults
- Social proof: «+۱۲,۰۰۰ شنونده فعال»

### 7.2 Navigation Architecture

| Platform | Pattern | Recommendation |
|----------|---------|----------------|
| Mobile | Bottom tabs (5) | Reduce to 4: Home, Search, Library, Profile — move Player to mini-bar overlay |
| Web | Top nav | Add sidebar on desktop (Spotify pattern) |
| Tablet | — | Two-column: list + detail (Apple Podcasts iPad) |

### 7.3 Micro-interactions & Motion

- Play/pause: scale pulse on cover art (Reanimated spring)
- Pull-to-refresh on Explore with haptic
- Page transitions: shared element on cover art (hero animation)
- Skeleton shimmer on content cards (not spinners)
- Progress bar: glow at playhead (Spotify-style)

### 7.4 Empty & Error States

| State | Current | Target |
|-------|---------|--------|
| No downloads | Static icon | CTA → browse + «Download your first episode» |
| API down | Generic error | Friendly retry + offline mode if cached |
| Empty library | Text only | Illustration + «Explore trending» |
| Empty search | None | «Try: {suggestion}» chips |

### 7.5 Accessibility

- WCAG 2.1 AA contrast (audit accent on dark bg)
- Screen reader labels on all player controls
- Reduced motion preference
- Font scaling support (Dynamic Type / rem)
- Keyboard navigation on web player (space = play/pause)

### 7.6 Platform-Specific

**Mobile ergonomics:** Thumb-zone FAB for «Continue listening»; bottom sheet player (Phase 2 in UI-UX doc)

**Desktop:** Keyboard shortcuts (J/K/L like YouTube); drag-drop to playlist; multi-column creator dashboard

**Performance perception:** Optimistic UI on save/follow; prefetch next episode; instant search debounce 300ms

### 7.7 Brand Visual Upgrade

Current mobile accent (`#c9a227` gold) vs web (`#7c3aed` purple) — **unify brand color**. Recommendation: keep purple as primary (modern, tech/AI association), gold as premium accent.

---

## 8. Psychological & Behavioral Design

### 8.1 Ethical Engagement Framework

| Principle | Application | Guardrail |
|-----------|-------------|-----------|
| **Progress bias** | «۸۵% complete this series» | Never fake progress |
| **Goal gradient** | «۲ اپیزود تا پایان فصل» | Based on real data |
| **Variable rewards** | Weekly surprise recommendation | No slot-machine patterns |
| **Social validation** | «محبوب در بین شنوندگان تاریخ» | Anonymized aggregates only |
| **Commitment** | Topic selection in onboarding | Easy to change |
| **Identity** | «شناسه شنونده: کاوشگر» badges | Opt-in sharing |
| **Loss aversion** | Streak counter | Gentle, not guilt-tripping |
| **Anticipation** | «فردا: اپیزود جدید» countdown | Only for confirmed publishes |
| **Collection** | Library shelves, playlist counts | No artificial scarcity |

### 8.2 Dark Pattern Avoidance

- ❌ Fake urgency on premium
- ❌ Auto-playing ads without skip
- ❌ Hidden unsubscribe
- ❌ Infinite scroll without «you're caught up»
- ✅ Clear data usage on downloads
- ✅ One-tap cancel subscription

---

## 9. Analytics & KPI Framework

### 9.1 Core Metrics

| Category | Metrics | Target (Month 6) |
|----------|---------|------------------|
| **Growth** | Signups/day, activation rate, CAC | Activation > 40% |
| **Engagement** | DAU, WAU, MAU, DAU/MAU ratio | DAU/MAU > 25% |
| **Retention** | D1, D7, D30, D90 curves | D30 > 20% |
| **Content** | Listening minutes/user/day | > 25 min |
| **Feature** | Search usage, AI summary views, download rate | AI adoption > 30% of premium |
| **Monetization** | Free→Premium conversion, ARPU, LTV | Conversion > 5% |
| **Satisfaction** | NPS, app store rating | NPS > 40 |
| **Creator** | Active creators, episodes/month | 100 creators, 500 episodes |

### 9.2 Event Taxonomy (implement first 20)

```
user.signup, user.login, onboarding.complete
content.view, content.play_start, content.play_complete, content.skip
player.speed_change, player.seek, player.sleep_timer_set
library.save, follow.creator, playlist.create, share.clip
search.query, search.result_click
premium.paywall_view, premium.convert
```

### 9.3 Funnels

1. **Activation:** Install → Signup → First Play > 60s → Save to Library
2. **Retention:** D0 play → D1 return → D7 streak
3. **Monetization:** Paywall view → Checkout start → Payment success

### 9.4 North Star

**Weekly Listening Minutes per Active User (WLM/AU)**

Supporting metrics: D7 retention, premium conversion rate, creator episodes published/week.

---

## 10. 12-Month Product Roadmap

### Q1 — Foundation & Core UX (Months 1–3)

| | |
|---|---|
| **Objectives** | Stable MVP → public beta; first 1,000 users |
| **Features** | Onboarding flow · Push notifications · Playback sync complete · Paywall + Zarinpal live · Download offline · Unified brand UI · Analytics pipeline · Skeleton/empty states |
| **Expected impact** | D1 +15%, crash-free > 99% |
| **Risk** | Payment integration delays → Mitigate with manual premium grant |
| **Success metrics** | 1K signups, D7 > 25%, first revenue |

### Q2 — Engagement & Retention (Months 4–6)

| | |
|---|---|
| **Objectives** | Habit formation; differentiation begins |
| **Features** | Persian ASR v1 · Personalized For You feed · AI summaries (beta) · Timestamp bookmarks · Creator upload UI · Public creator profiles · Playlist UI · Streaks & milestones · Weekly digest email |
| **Expected impact** | D30 +10%, WLM/AU +40% |
| **Risk** | ASR accuracy for Persian dialects → Start with formal Persian podcasts |
| **Success metrics** | D30 > 20%, 10K WAU, AI feature 25% adoption |

### Q3 — Growth & Social (Months 7–9)

| | |
|---|---|
| **Objectives** | Viral loops; creator supply acceleration |
| **Features** | Shareable AI clips · Referral program · Public profiles · Episode embed widget · Community challenges · Creator analytics dashboard · Telegram bot for alerts · Ask This Episode (RAG chat) |
| **Expected impact** | K-factor 0.1+, creator uploads 3x |
| **Risk** | Low share rate → A/B clip formats |
| **Success metrics** | 50K MAU, 500 active creators, viral shares > 1K/month |

### Q4 — Monetization & Advanced AI (Months 10–12)

| | |
|---|---|
| **Objectives** | Revenue scale; market leadership positioning |
| **Features** | Dynamic ads (free tier) · Creator tips · Sponsorship marketplace beta · Auto chapters · CarPlay/Android Auto · Low bandwidth mode · Multilingual UI (EN/FA) · In-app recording studio (beta) |
| **Expected impact** | ARPU +60%, premium conversion 8% |
| **Risk** | Ad UX backlash → Strict frequency caps |
| **Success metrics** | $10K MRR equivalent (IRR), LTV/CAC > 3, NPS > 45 |

### Roadmap Visual

```
Q1 ████████░░ Foundation (UX, payments, offline, push)
Q2 ██████████ Engagement (ASR, AI summaries, personalization)
Q3 ████████░░ Growth (social, virality, creator tools)
Q4 ██████████ Monetization (ads, tips, advanced AI)
```

---

## 11. Final Strategic Recommendations

### Top 10 Highest-Impact Improvements

1. **Persian ASR + in-audio search** — unmatched in Persian market
2. **AI episode summaries with timestamps** — «why listen?» answered in 10 seconds
3. **Personalized For You feed** — replace static explore
4. **Push notification system** — retention backbone
5. **Onboarding with topic selection** — activation multiplier
6. **Functional offline downloads** — Iran market essential
7. **Live Zarinpal payments** — revenue unlock
8. **Creator upload + analytics** — supply-side growth
9. **Shareable AI highlight clips** — viral growth engine
10. **Cross-device playback sync** — stickiness promise fulfilled

### Top 5 Quick Wins (< 1 week each)

1. Unified brand colors (mobile gold → web purple alignment)
2. Skeleton loading on explore/search
3. «Add to library» button on content detail pages
4. Recent searches in search tab
5. Post-signup welcome toast + «Play your first episode» CTA

### Top 5 Medium-Term Investments (1–3 months)

1. Persian ASR pipeline (Whisper fine-tuned)
2. Recommendation engine v1 (collaborative filtering)
3. Push notification infrastructure (FCM + APNs)
4. Creator upload wizard with MinIO direct upload
5. Analytics event pipeline (Amplitude/PostHog)

### Top 5 Long-Term Strategic Bets (6–12 months)

1. RAG-powered «Ask This Episode» chat
2. Sponsorship marketplace (two-sided market)
3. CarPlay / Android Auto integration
4. In-app recording + editing studio
5. White-label licensing for media companies

### The Single Most Important Feature to Build Next

> **Persian ASR + AI Episode Summary — bundled as «Smart Episode Preview»**

**Why this one feature first:**

- Directly addresses the #1 podcast UX pain point: «Is this 90-minute episode worth my time?»
- Creates a **defensible moat** — Spotify/Apple/YouTube have weak Persian NLP
- Enables downstream features: search, chapters, clips, RAG chat, ads targeting
- Premium conversion wedge: «See AI summary free; full transcript + ask AI = Premium»
- Shareable output (summary card) drives organic growth

**MVP spec (2-week slice):**

```
Input: episode audio URL
Pipeline: Whisper FA → transcript → LLM summarize → 3 bullets + 5 timestamps
Output: SummaryCard component on content detail page
Gate: 1 free summary/day; unlimited on Premium
```

---

## Appendix A: Competitive Positioning

| Capability | Castaminofen (today) | Castaminofen (12mo target) | Spotify | Apple Podcasts | YouTube |
|------------|---------------------|---------------------------|---------|----------------|---------|
| Persian ASR search | ❌ | ✅ | ❌ | ❌ | Auto-caption (weak FA) |
| AI summaries | ❌ | ✅ | ❌ | ❌ | ❌ |
| Audiobook + podcast + video unified | ✅ | ✅ | Partial | ❌ | Partial |
| RTL native UX | ✅ | ✅ | Weak | Weak | Weak |
| Creator monetization (local payment) | Stub | ✅ Zarinpal | ❌ IR | ❌ IR | Partial |
| Offline downloads | UI only | ✅ | ✅ | ✅ | Premium |
| Social/community | ❌ | ✅ | ❌ | ❌ | Comments only |

**Positioning statement:**  
*«کستامینوفن — هوشمندترین راه برای گوش دادن به پادکست و vodcast فارسی؛ با خلاصه AI، جستجوی داخل صوت، و یک پلیر برای همه‌چیز.»*

---

## Appendix B: Implementation Priority Matrix

|  | Low Effort | High Effort |
|--|------------|-------------|
| **High Impact** | Onboarding, skeleton UI, library button, push setup | ASR, recommendations, AI summaries |
| **Low Impact** | Brand color unification, recent searches | Desktop app, white-label |

---

## Appendix C: Key Files Reference

| Area | Path |
|------|------|
| Mobile app | `apps/mobile/` |
| Web app | `apps/web/` |
| API | `services/api-gateway/` |
| Schema | `packages/database/prisma/schema.prisma` |
| Auth docs | `docs/login.md` |
| Phase 2 roadmap | `docs/ROADMAP.md` |
| UI guidelines | `docs/UI-UX.md` |

---

*Prepared for Castaminofen product team. Review quarterly against KPI dashboard.*
