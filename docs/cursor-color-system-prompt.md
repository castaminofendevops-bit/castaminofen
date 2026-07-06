# پرامپت پیاده‌سازی سیستم رنگی (Color System) در Cursor

> این فایل را کامل کپی کن و به Cursor (در حالت Agent / Composer) بده.

---

## دستور اصلی

پروژه من نیاز به یکپارچه‌سازی هویت رنگی (Color System) دارد. لطفاً موارد زیر را دقیقاً و بدون تغییر در مقادیر رنگ اجرا کن:

1. ابتدا ساختار پروژه را بررسی کن و مشخص کن از چه روش استایل‌دهی استفاده شده (Tailwind CSS، CSS Variables خام، Styled-Components، SCSS، یا فریمورک دیگر).
2. بر اساس همان روش، یک **منبع واحد رنگ (Single Source of Truth)** بساز — مثلاً:
   - در Tailwind: بخش `theme.extend.colors` در `tailwind.config.js/ts`
   - در CSS خام: بلوک `:root` و `[data-theme="dark"]` با CSS Custom Properties
   - در Styled-Components/Emotion: فایل `theme.ts` با دو آبجکت `light` و `dark`
3. تمام رنگ‌های هاردکد‌شده (hex مستقیم در JSX/HTML/CSS) در سراسر پروژه را با توکن‌های تعریف‌شده جایگزین کن. هیچ hex جدیدی اضافه نکن؛ فقط از لیست زیر استفاده کن.
4. حالت Light/Dark باید کاملاً پشتیبانی شود و سوییچ بین آن‌ها بدون شکستن UI انجام شود.
5. بعد از اعمال تغییرات، یک خلاصه از فایل‌هایی که رنگ‌هایشان جایگزین شده بده.

---

## ۱. توکن‌های رنگ برند (Design Tokens)

```json
{
  "brand": {
    "primary": "#776CFE",
    "accentGreen": "#00EA99",
    "accentPurple": "#A03CFF",
    "secondaryOlive": "#99BE7D"
  },
  "dark": {
    "bgMain": "#0F111A",
    "bgContent": "#1A1D29",
    "bgSurfaceAlt": "#232735",
    "bgSurfaceHover": "#2D3748",
    "bgSurfaceActive": "#4A5568",
    "textPrimary": "#F3F4F6",
    "textSecondary": "#9CA3AF",
    "textBody": "#D1D5DB"
  },
  "light": {
    "bgMain": "#F9FAFB",
    "bgContent": "#FFFFFF",
    "bgSurfaceAlt": "#F3F4F6",
    "bgSurfaceActive": "#E5E7EB",
    "textPrimary": "#111827",
    "textSecondary": "#4B5563"
  }
}
```

> ⚠️ **نکته برای بررسی:** در یکی از منابع رنگی قبلی پروژه، `brand_primary` به‌صورت `#385DFF` ثبت شده بود که با بقیه مستندات (که همه‌جا `#776CFE` را رنگ اصلی/Primary معرفی کرده‌اند) همخوانی ندارد. در این پرامپت **`#776CFE` به‌عنوان رنگ Primary نهایی** در نظر گرفته شده. اگر `#385DFF` عمداً برای بخش دیگری در نظر گرفته شده، قبل از اجرا به Cursor اطلاع بده.

---

## ۲. نگاشت رنگ روی کامپوننت‌ها (Component Color Mapping)

Cursor باید این جدول را عیناً پیاده‌سازی کند (نام کلاس/متغیر را خودش بر اساس نام‌گذاری پروژه انتخاب کند، اما مقدار رنگ باید دقیقاً همین باشد):

| بخش / المان | وضعیت | Light Mode | Dark Mode |
|---|---|---|---|
| **Primary Button** | Regular | `#776CFE` | `#776CFE` |
| | Hover | `#A03CFF` | `#A03CFF` |
| | Border | `#776CFE` | `#776CFE` |
| **Secondary Button** | Regular | `#99BE7D` | `#99BE7D` |
| | Hover | `#00EA99` | `#00EA99` |
| | Border | `#99BE7D` | `#99BE7D` |
| **BuddyPanel Menu** | Text (Regular) | `#111827` | `#F3F4F6` |
| | Text (Hover) | `#776CFE` | `#00EA99` |
| | Text (Active) | `#776CFE` | `#00EA99` |
| | BG (Regular) | `#FFFFFF` | `#1A1D29` |
| | BG (Hover) | `#F3F4F6` | `#2D3748` |
| | BG (Active) | `#E5E7EB` | `#4A5568` |
| **BuddyPanel Count Badge** | BG (Regular) | `#00EA99` | `#00EA99` |
| | BG (Hover) | `#776CFE` | `#776CFE` |
| **Footer Menu Link** | Regular | `#4B5563` | `#9CA3AF` |
| | Hover | `#776CFE` | `#00EA99` |
| | Active | `#776CFE` | `#00EA99` |
| **Login Button** | Regular | `#776CFE` | `#776CFE` |
| | Hover | `#A03CFF` | `#A03CFF` |

---

## ۳. راهنمای معنایی رنگ‌ها (برای رعایت در المان‌های جدید)

- **`#776CFE` (Primary / بنفش):** دکمه‌های اکشن اصلی، لینک‌های فعال، لاگین، آیتم‌های Active
- **`#00EA99` (Accent سبز فسفری):** هایلایت‌ها، بج‌ها (Badge)، هاور در Dark Mode، المان‌های جذاب پادکست
- **`#A03CFF` (Secondary Accent / بنفش روشن):** حالت Hover دکمه‌های Primary و Login، تأکیدات ویژه
- **`#99BE7D` (Secondary / سبز زیتونی):** دکمه‌های ثانویه، متادیتای ویدیوها، المان‌های فرعی
- پس‌زمینه‌ها و متن‌ها دقیقاً طبق جدول Dark/Light بالا

---

## ۴. الزامات فنی برای Cursor

- از تعریف مستقیم hex در فایل‌های کامپوننت خودداری کن؛ همه‌چیز باید از طریق توکن/متغیر مرکزی خوانده شود.
- اگر پروژه از Tailwind استفاده می‌کند، رنگ‌ها را با نام‌های معنادار (`brand-primary`, `brand-accent`, `surface-dark-hover` و...) در `tailwind.config` تعریف کن، نه به‌صورت hex پراکنده در JSX.
- Contrast Ratio متن روی پس‌زمینه‌ها را برای دسترس‌پذیری (Accessibility/WCAG AA) چک کن؛ اگر جایی مغایرت جدی دید (مثلاً متن کم‌رنگ روی پس‌زمینه هم‌رنگ)، فقط گزارش بده و بدون اجازه رنگ را عوض نکن.
- هیچ استایل یا رفتار غیرمرتبط با رنگ را تغییر نده (spacing، layout، فونت و غیره دست‌نخورده بماند).
- در پایان، لیست فایل‌های تغییر یافته + اسکرین‌شات یا توضیح کوتاه از هر بخش (دکمه‌ها، BuddyPanel، Footer، Login) ارائه بده.

---

## ۵. خروجی موردانتظار

- یک فایل توکن رنگ مرکزی (theme/config)
- جایگزینی کامل رنگ‌های هاردکد در کل پروژه با توکن‌ها
- پشتیبانی کامل و تست‌شده از Dark/Light Mode
- گزارش نهایی از فایل‌های تغییر یافته
