# مشخصات API — REST v1

**Base URL**: `http://localhost:3000/api/v1`  
**Swagger**: `http://localhost:3000/docs`

## چرا REST و نه GraphQL؟

| معیار | REST | GraphQL |
|-------|------|---------|
| کش CDN | ✅ عالی | ❌ محدود |
| Mobile bandwidth | ✅ سبک | ⚠️ over-fetching کمتر اما payload بزرگ‌تر |
| پیچیدگی MVP | ✅ ساده | ❌ overhead |
| Media streaming | ✅ Signed URLs | ⚠️ غیرضروری |

**تصمیم**: REST برای MVP. GraphQL در Phase 2 برای feed شخصی‌سازی‌شده بررسی می‌شود.

---

## Auth

| Method | Path | Auth | توضیح |
|--------|------|------|-------|
| POST | `/auth/register` | Public | ثبت‌نام |
| POST | `/auth/login` | Public | ورود |
| POST | `/auth/refresh` | Public | تازه‌سازی token |
| GET | `/auth/me` | JWT | پروفایل |
| PATCH | `/auth/me` | JWT | به‌روزرسانی پروفایل |

## Content

| Method | Path | Auth | توضیح |
|--------|------|------|-------|
| GET | `/explore` | Public | کاوش — paginated |
| GET | `/trending` | Public | محتوای پرطرفدار |
| GET | `/search?q=` | Public | جستجو |
| GET | `/contents/:id` | Public | جزئیات + episodes |
| GET | `/contents/:id/related` | Public | محتوای مرتبط |
| GET | `/episodes/:id` | Public | جزئیات اپیزود |

## Creator

| Method | Path | Auth | توضیح |
|--------|------|------|-------|
| GET | `/creator/contents` | CREATOR | لیست محتوا |
| POST | `/creator/contents` | CREATOR | ایجاد |
| POST | `/creator/contents/:id/episodes` | CREATOR | افزودن اپیزود |
| POST | `/creator/contents/:id/publish` | CREATOR | انتشار |

## Media

| Method | Path | Auth | توضیح |
|--------|------|------|-------|
| GET | `/media/stream/:episodeId` | JWT | Signed stream URL |
| POST | `/media/playback/:episodeId` | JWT | sync position |
| GET | `/media/continue` | JWT | ادامه گوش دادن |
| POST | `/media/download/:episodeId` | JWT | درخواست دانلود |
| GET | `/media/downloads` | JWT | لیست دانلودها |

## User

| Method | Path | Auth | توضیح |
|--------|------|------|-------|
| POST | `/user/follow/:creatorId` | JWT | Follow |
| DELETE | `/user/follow/:creatorId` | JWT | Unfollow |
| GET | `/user/following` | JWT | لیست |
| POST | `/user/library/:contentId` | JWT | افزودن به کتابخانه |
| DELETE | `/user/library/:contentId` | JWT | حذف از کتابخانه |
| GET | `/user/library` | JWT | کتابخانه |
| POST | `/user/playlists` | JWT | ایجاد پلی‌لیست |
| GET | `/user/playlists` | JWT | لیست |
| GET | `/user/playlists/:id` | JWT | جزئیات |
| POST | `/user/playlists/:id/items` | JWT | افزودن اپیزود |

## Payment

| Method | Path | Auth | توضیح |
|--------|------|------|-------|
| GET | `/payment/plans` | Public | پلن‌ها |
| GET | `/payment/subscription` | JWT | وضعیت |
| POST | `/payment/subscribe/:plan` | JWT | شروع پرداخت |
| POST | `/payment/verify` | JWT | تأیید |
| POST | `/payment/purchase/:contentId` | JWT | خرید تکی |
| POST | `/payment/purchase/verify` | JWT | تأیید خرید |

## Response Format

```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

```json
{
  "success": false,
  "error": { "code": "PREMIUM_REQUIRED", "message": "..." }
}
```

## Import RSS — نمونه درخواست (mirrorMedia)

این endpoint برای ایمپورت فیدهای RSS توسط ادمین/سازنده طراحی شده است. فیلد `mirrorMedia` کنترل می‌کند که آیا فایل‌های رسانه‌ای از URLهای enclosure دانلود و در فضای ذخیره‌سازی داخلی آیتم (MinIO/S3) mirror شوند یا خیر. مقدار پیش‌فرض `false` است — در این حالت فقط آدرس رسانه در رکورد اپیزود ذخیره می‌شود.

نمونه بدنه درخواست:

```json
{
  "feeds": ["https://feed.podbean.com/RadioRaah/feed.xml"],
  "contentType": "PODCAST",
  "mirrorMedia": true,
  "dryRun": false,
  "skipExisting": true,
  "limitEpisodes": 0
}
```

توضیح کوتاه:
- `feeds`: آرایه URLهای فید RSS.
- `contentType`: نوع محتوا (مثلاً `PODCAST`).
- `mirrorMedia`: اگر `true` باشد، سرور فایل رسانه را دانلود و در Storage آپلود می‌کند و آدرس ذخیره‌شده را برای اپیزود استفاده می‌کند.
- `dryRun`: فقط شبیه‌سازی ایمپورت بدون نوشتن در DB.
- `skipExisting`: از بازنویسی اپیزودهای موجود جلوگیری می‌کند.
- `limitEpisodes`: عدد >0 برای محدود کردن تعداد اپیزودهای واردشده.
