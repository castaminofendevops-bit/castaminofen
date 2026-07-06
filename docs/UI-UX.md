# طراحی UI/UX — کستامینوفن

## فلسفه طراحی

**«ساده‌تر از Spotify، قدرتمندتر از Castbox»**

الهام از Spotify (navigation)، YouTube (content discovery)، Pocket Casts (player) — اما بدون شلوغی.

## اصول کلیدی

### 1. Mobile-First
- Touch targets حداقل 44×44px
- Thumb-zone navigation در پایین (tabs)
- Swipe برای actions (Phase 2)

### 2. Dark Mode پیش‌فرض
- کاهش مصرف باتری OLED
- راحتی چشم در گوش دادن طولانی
- پس‌زمینه: `#0a0a0f` — نه pure black (جلوگیری از smear)

### 3. Performance > Decoration
- بدون blur سنگین یا parallax
- انیمیشن‌های CSS/React Native Reanimated سبک
- Lazy load تصاویر cover

### 4. RTL Native
- `direction: rtl` در Web
- Layout mirror در Mobile
- فونت Vazirmatn

## جریان‌های کاربری

### مصرف محتوا
```
Explore → Content Card → Episode List → Play → Player (mini/full)
                                              ↓
                                    Continue Listening (Library)
```

### سازنده
```
Login (creator) → Creator Panel → Create Content → Add Episodes → Publish
```

## کامپوننت‌های کلیدی

| کامپوننت | Web | Mobile | توضیح |
|----------|-----|--------|-------|
| ContentCard | ✅ | ✅ | Cover + title + meta |
| PlayerBar | ✅ fixed bottom | ✅ full tab | Mini vs full |
| Nav/Tabs | ✅ top nav | ✅ bottom tabs | Platform convention |
| SearchBar | ✅ | ✅ | Instant search |

## Player UX

- **Speed control**: 0.5x – 2x (کتاب صوتی)
- **Sleep timer**: 5/15/30/60 min
- **Progress bar**: tap/seek
- **Background play**: expo-av (mobile), HTML5 audio (web)

## رنگ‌ها (Brand System — `packages/ui-tokens`)

```
Primary:     #776CFE
Accent:      #00EA99 (highlight / badge / dark hover)
Secondary:   #A03CFF (primary hover)
Olive:       #99BE7D (secondary buttons)

Dark bg:     #0F111A → #1A1D29 → #232735
Light bg:    #F9FAFB → #FFFFFF → #F3F4F6
Text dark:   #F3F4F6 / #9CA3AF / #D1D5DB
Text light:  #111827 / #4B5563
```

Web: `data-theme` + toggle در Nav · Mobile: toggle در ابزارها (shell + tab bar)

## Phase 2 UX

- Bottom sheet player (mobile)
- Haptic feedback on play/pause
- Pull-to-refresh on Explore
- Skeleton loading states
