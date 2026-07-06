# Roadmap — فاز ۲ و ۳

## فاز ۱ — MVP ✅ (فعلی)

- [x] پلیر واحد صوت/ویدیو
- [x] Streaming + Download stub
- [x] Continue Listening + Playback sync
- [x] Explore + Search
- [x] Follow, Library, Playlist
- [x] Subscription + Purchase stub
- [x] Creator Panel
- [x] Auth JWT + OAuth-ready

## فاز ۲ — Growth (۳–۶ ماه)

| ویژگی | اولویت | وابستگی |
|--------|--------|---------|
| ASR فارسی (جستجوی داخل صوت) | P0 | AI Layer |
| خلاصه‌سازی هوشمند اپیزود | P1 | ASR |
| موتور پیشنهاد شخصی‌سازی | P0 | Analytics data |
| یادداشت/بوکمارک timestamp | P1 | Player upgrade |
| آنالیتیکس سازنده | P0 | Event pipeline |
| هم‌ترازی متن-صوت کتاب | P2 | ASR |
| پلی‌لیست گروهی | P2 | User service |
| E2E tests (Playwright) | P1 | CI/CD |
| Desktop app (Tauri/Electron) | P2 | Web codebase |

## فاز ۳ — Differentiation (۶–۱۲ ماه)

| ویژگی | توضیح |
|--------|-------|
| کشف محتوا با AI Chat | RAG روی transcript + metadata |
| استودیوی ضبط داخلی | In-app recording + basic edit |
| رونویسی خودکار فارسی | Whisper fine-tuned |
| تبلیغات صوتی پویا | Creator monetization |
| چندزبانگی | i18n infrastructure |
| Parental controls | Content filtering |
| Low bandwidth mode | Adaptive quality + prefetch |

## Milestones

```
M1 (Week 4):  MVP deploy staging
M2 (Week 8):  Beta 100 users
M3 (Month 3): Public launch + Zarinpal live
M4 (Month 6): Phase 2 ASR + Recommendations
M5 (Month 12): Phase 3 AI features
```
