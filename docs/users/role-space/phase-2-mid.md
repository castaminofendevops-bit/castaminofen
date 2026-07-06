# Phase 2 — متوسط: داشبورد، پروفایل سازنده و شخصی‌سازی

فاز دوم تمرکز بر ایجاد تجربه مدیریتی قابل‌اعتبار برای سازندگان و مدیران، و ارتقای تجربهٔ کشف محتوا با شخصی‌سازی است.

## 1. اهداف کلیدی
- پیاده‌سازی `Creator Profile` با آمار و feed محتوا
- ساخت داشبورد مدیریتی اولیه برای `Admin` (review, reports)
- بهبود سیستم پیشنهاد محتوا با استفاده از سیگنال‌های کاربر (history, follow, subscription)
- بازطراحی `tools tab` موبایل به عنوان hub تنظیمات و shortcuts

## 2. دامنه کاری
- `Creator Profile` (وب)
  - public profile, follower count, recent content, CTA follow
  - API: `GET /creators/:id`، `GET /creators/:id/contents`
- `Admin Dashboard` (وب، ابتدایی)
  - صفحات: `/admin/overview`, `/admin/creators`, `/admin/reports`
  - وظایف: مشاهده metrics سطح بالا، لیست گزارش‌ها، ابزار رد/تأیید محتوا
- Personalization
  - server-side flags برای personalized shelves
  - basic rules engine: follow > recent > trending
- `tools tab` موبایل
  - قرار دادن sleep timer، playback speed، download management و quick settings

## 3. صفحات و APIهای مرتبط
- `GET /creators/:id` — public creator profile
  - Response: { id, displayName, avatarUrl, bio, followerCount, isVerified }
- `GET /creators/:id/contents` — feedِ سازنده
- `GET /admin/metrics` — dashboard metrics (ADMIN)
- `GET /recommendations` — personalized recommendations (User)

## 4. تجربه‌های کاربری و UI
- Creator Profile
  - strong authoring signal: verified badge, follower CTA, follow/unfollow UX
  - tabbed view: Overview / Contents / Stats (Stats phased)
- Admin Dashboard
  - high-level KPIs (DAU, WLM/AU, subscription conversion)
  - table view برای گزارش‌ها با bulk actions
- Personalization
  - shelves: For You / New from Followed / Trending
  - allow users to tune preferences in `tools` (e.g., genres)

## 5. امنیت و حریم خصوصی
- creator public data: only non-sensitive fields exposed
- admin endpoints: Role Guard + audit logging
- recommendations: respect `Do Not Track` and privacy opt-outs

## 6. معیارهای پذیرش
- Creator Profile صفحهٔ عمومی با اطلاعات و لیست محتوا نمایش می‌دهد.
- Admin Dashboard نمایش حداقل 5 KPI و لیست گزارش‌ها با امکان مشاهده جزئیات.
- Personalized recommendations در 10 کاربر آزمایشی نشان‌دهنده increase in engagement باشد (soft metric).

## 7. تست و QA
- Integration tests برای creator endpoints
- Load tests برای `/recommendations` با cache layer
- UX tests برای follow flow و profile

## 8. برآورد زمانی
- Creator Profile: 4-6 روز
- Admin Dashboard (MVP): 5-8 روز
- Personalization MVP: 5 روز
- Mobile tools tab redesign: 3-4 روز

## 9. مالکیت و وابستگی‌ها
- Frontend (web): Creator Profile, Admin UI — Frontend Engineer E
- Backend: recommendations, admin metrics — Backend Engineer F
- Data/ML: rules-based recommender — Data Engineer G
- QA: regression & load tests — QA Team

---

*این فاز برای افزایش ارزش سازنده و فراهم‌سازی داشبورد مدیریتی اولیه است تا در فاز بعدی به اکوسیستم درآمدزایی منتقل شود.*