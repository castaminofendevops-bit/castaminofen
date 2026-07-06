# Phase 1 — فوری: تجربه مشترکین و تکمیل مسیر سازنده

هدف این فاز ایجاد تجربه‌ای قابل‌اطمینان و کم‌اصطکاک برای کاربران عادی (`User`) و تکمیل جریان‌های اصلی سازندگان در وب است. خروجی باید آمادهٔ عرضه به کاربران داخلی (beta) باشد.

## 1. اهداف کلیدی
- بهبود تجربه پرداخت و اشتراک (Paywall) برای افزایش تبدیل Guest→User→Subscriber
- همگام‌سازی کتابخانه و ادامه گوش دادن بین دستگاه‌ها
- کامل کردن پنل `Creator` وب: ایجاد محتوا، مدیریت اپیزود و انتشار
- بهبود onboarding برای Guestها و تشویق ثبت‌نام

## 2. دامنه کاری (In-Scope)
- ارتقای `PaywallModal` در وب و موبایل
  - ایجاد session پرداخت، باز کردن درگاه، تأیید پرداخت و پیام‌های خطا
- همگام‌سازی `Library` و `Continue Listening` در سرور و کلاینت
- تکمیل `CreatorPage` (وب)
  - فرم ایجاد محتوا، نمایش لیست محتوا، دکمه انتشار
- UX: CTAهای ورود/ثبت‌نام در صفحات کلیدی و نمایش preview محتوا

## 3. صفحات و مسیرها
- وب:
  - `/` — کاوش — CTA ورود/ثبت‌نام
  - `/content/[id]` — جزئیات محتوا + `PaywallModal`
  - `/creator` — پنل سازنده: create / list / publish
  - `/library` — همگام‌شده با سرور
- موبایل:
  - `/(tabs)/index`, `content/[id].tsx`, `/(tabs)/library`

## 4. User Stories (نمونه)
- Guest: به‌عنوان یک بازدیدکننده، می‌خواهم قبل از ثبت‌نام یک پیش‌نمایش کوتاه از محتوا را گوش بدهم تا تصمیم به ثبت‌نام بگیرم.
- User: به‌عنوان کاربر واردشده، می‌خواهم اشتراک را با کارت/درگاه پرداخت تکمیل کنم و بلافاصله به محتوای پریمیوم دسترسی پیدا کنم.
- Creator: به‌عنوان سازنده، می‌خواهم محتوا بسازم، اپیزود اضافه کنم و با یک دکمه منتشر کنم.

## 5. APIها و قراردادها
- `GET /payment/plans` — لیست پلن‌ها (Public)
- `POST /payment/subscribe/:plan` — ایجاد جلسه پرداخت (Auth)
  - Request: none
  - Response: { gatewayRef, gatewayUrl, amount, currency }
- `POST /payment/verify` — تأیید پرداخت (Auth)
  - Body: { gatewayRef }
  - Response: { verified: boolean }
- `POST /payment/purchase/:contentId` — خرید تکی (Auth)
- `POST /creator/contents` — ایجاد محتوا (CREATOR)
- `GET /creator/contents` — لیست محتوا (CREATOR)
- `POST /creator/contents/:id/episodes` — افزودن اپیزود (CREATOR)

## 6. کامپوننت‌ها و تغییرات UI
- `PaywallModal` (وب + موبایل)
  - حالات: idle, creating-session, session-opened, verifying, success, error
  - UX: باز کردن درگاه در پنجره جدید یا با `Linking.openURL`، دکمه «تأیید پرداخت» پس از تکمیل
- `CreatorPage`
  - فرم ایجاد محتوا با validation
  - لیست محتواها و دکمه publish
- `LibraryPage`
  - همگام‌سازی با endpoint `/user/library`
  - conflict resolution: server wins for canonical state

## 7. معیارهای پذیرش (Acceptance Criteria)
- پرداخت: کاربر می‌تواند session پرداخت را آغاز کند، درگاه باز شود و پس از بازگشت پرداخت را با `verify` تأیید کند.
- خرید تکی: خرید محتوا با `purchase` و `purchase/verify` کار می‌کند و دسترسی به محتوا صادر می‌شود.
- Creator: فرم ایجاد محتوا بدون خطای client-side و با پاسخ موفق از سرور، محتوای جدید را در لیست نشان می‌دهد.
- Library sync: تغییرات کتابخانه در وب/موبایل ظرف کمتر از 5s انعکاس یابد (soft goal).

## 8. تست و QA
- Integration tests برای endpoints پرداخت که حالات stub را شبیه‌سازی می‌کنند.
- E2E برای جریان پرداخت (initiate → gateway (mock) → verify).
- Unit tests برای حالات `PaywallModal` و `CreatorPage`.

## 9. Rollout
- Stage: internal beta with seeded users (see `packages/database/prisma/seed.ts`)
- Canary: 5% کاربران با feature flag برای `PaywallModal` جدید
- Full rollout پس از 72 ساعت پایش و رفع اشکال

## 10. برآورد زمانی (راهنما)
- Paywall (web+mobile): 3-5 روز
- Library sync: 2 روز
- Creator Page improvements: 3 روز
- QA + e2e: 2 روز

## 11. مالکیت و وظایف
- Frontend (web): implement `PaywallModal`, `CreatorPage` — Frontend Engineer A
- Frontend (mobile): link `PaywallModal` flows — Mobile Engineer B
- Backend: ensure payment endpoints and subscription upsert — Backend Engineer C
- QA: Integration & E2E — QA Engineer D

---

*فایل فاز ۱ مخصوص اجرا و تحویل سریع نوشته شد. در فایل‌های فاز ۲ و فاز ۳ جزئیات استراتژیک‌تر و طراحی معماری گنجانده خواهد شد.*