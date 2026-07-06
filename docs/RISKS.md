# ریسک‌های فنی و راه‌حل‌ها

| # | ریسک | احتمال | تأثیر | راه‌حل |
|---|------|--------|-------|--------|
| 1 | فیلترینگ CDN/سرور در ایران | بالا | بالا | Multi-CDN (Arvan + fallback)، self-hosted edge |
| 2 | Latency استریم بالا | متوسط | بالا | Adaptive bitrate، prefetch، CDN edge |
| 3 | مصرف باتری موبایل | متوسط | متوسط | Background audio optimization، kill animations |
| 4 | Scale database | متوسط | بالا | Read replicas، Redis cache، connection pooling |
| 5 | DRM bypass | متوسط | بالا | Signed URLs + short expiry + server-side auth |
| 6 | Payment gateway downtime | پایین | بالا | Retry queue، manual reconciliation |
| 7 | OAuth provider block | پایین | متوسط | Email/password primary، phone OTP backup |
| 8 | Content moderation | متوسط | بالا | Report system + manual review queue (Phase 2) |
| 9 | Storage cost growth | بالا | متوسط | Tiered storage، compression، archive old content |
| 10 | Team scaling monorepo | پایین | متوسط | Clear package boundaries، CODEOWNERS |

## ریسک‌های عملیاتی

- **Backup**: Daily PostgreSQL backup + S3 versioning
- **Incident**: PagerDuty/Slack alerting on health check failure
- **Compliance**: Terms of service + content licensing tracking
