import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePlayerStore } from '@/store/player';
import { PLAYBACK_SPEEDS, SLEEP_TIMER_OPTIONS } from '@castaminofen/shared';
import { ScalePressable } from '@/components/ScalePressable';
import { TabFadeWrapper } from '@/components/TabFadeWrapper';
import { spacing, radius, fonts } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useThemedStyles, type ThemeColors } from '@/hooks/useThemedStyles';
import { hapticSelection } from '@/lib/haptics';

const COMING_SOON = [
  { icon: 'cloud-download-outline' as const, title: 'دانلود آفلاین', desc: 'گوش دادن بدون اینترنت' },
  { icon: 'sync-outline' as const, title: 'همگام‌سازی دستگاه‌ها', desc: 'ادامه روی موبایل و تبلت' },
  { icon: 'list-outline' as const, title: 'لیست پخش سفارشی', desc: 'ساخت و مرتب‌سازی اپیزودها' },
  { icon: 'bookmark-outline' as const, title: 'نشانک‌های ابری', desc: 'ذخیره لحظه در اپیزود' },
] as const;

function createStyles(colors: ThemeColors) {
  return {
    safe: { flex: 1, backgroundColor: colors.bgPrimary },
    container: { flex: 1 },
    header: { padding: spacing.md, alignItems: 'flex-end' as const },
    title: { color: colors.textPrimary, fontSize: 24, fontWeight: '700' as const, fontFamily: fonts.bold },
    subtitle: { color: colors.textMuted, fontSize: 14, marginTop: 4, fontFamily: fonts.regular },
    profileCard: {
      marginHorizontal: spacing.md,
      marginTop: spacing.sm,
      padding: spacing.md,
      backgroundColor: colors.bgCard,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row-reverse' as const,
      alignItems: 'center' as const,
      gap: spacing.md,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.accentMuted,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    avatarText: { color: colors.accent, fontWeight: '700' as const, fontSize: 18, fontFamily: fonts.bold },
    profileInfo: { flex: 1, alignItems: 'flex-end' as const },
    profileName: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' as const, fontFamily: fonts.bold },
    profileMeta: { color: colors.textMuted, fontSize: 13, marginTop: 2, fontFamily: fonts.regular },
    section: { padding: spacing.md, marginTop: spacing.sm },
    sectionTitle: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '600' as const,
      textAlign: 'right' as const,
      marginBottom: spacing.sm,
      fontFamily: fonts.semibold,
    },
    sectionHint: {
      color: colors.textMuted,
      fontSize: 12,
      textAlign: 'right' as const,
      marginBottom: spacing.sm,
      lineHeight: 20,
      fontFamily: fonts.regular,
    },
    chipRow: { flexDirection: 'row-reverse' as const, flexWrap: 'wrap' as const, gap: spacing.sm },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 44,
      justifyContent: 'center' as const,
    },
    chipActive: { backgroundColor: colors.accentMuted, borderColor: colors.accent },
    chipText: { color: colors.textSecondary, fontSize: 13, fontFamily: fonts.regular },
    chipTextActive: { color: colors.accent, fontWeight: '700' as const, fontFamily: fonts.semibold },
    comingCard: {
      flexDirection: 'row-reverse' as const,
      alignItems: 'center' as const,
      gap: spacing.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
      backgroundColor: colors.bgCard,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      opacity: 0.85,
    },
    toolIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      backgroundColor: colors.bgElevated,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    comingBody: { flex: 1, alignItems: 'flex-end' as const },
    comingTitle: { color: colors.textSecondary, fontSize: 14, fontFamily: fonts.medium },
    comingDesc: { color: colors.textMuted, fontSize: 12, marginTop: 2, fontFamily: fonts.regular },
    comingBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.full,
      backgroundColor: colors.bgElevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
    comingBadgeText: { color: colors.textMuted, fontSize: 10, fontFamily: fonts.medium },
    authSection: { padding: spacing.md, marginTop: spacing.lg },
    loginBtn: {
      flexDirection: 'row-reverse' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: spacing.sm,
      backgroundColor: colors.accent,
      borderRadius: radius.md,
      padding: spacing.md,
      minHeight: 48,
    },
    loginText: { color: colors.textOnPrimary, fontWeight: '700' as const, fontSize: 16, fontFamily: fonts.bold },
    registerBtn: {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginTop: spacing.sm,
      padding: spacing.md,
      minHeight: 44,
    },
    registerText: { color: colors.accent, fontWeight: '600' as const, fontSize: 15, fontFamily: fonts.semibold },
    logoutBtn: {
      flexDirection: 'row-reverse' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: colors.error,
      borderRadius: radius.md,
      padding: spacing.md,
      minHeight: 48,
    },
    logoutText: { color: colors.error, fontWeight: '600' as const, fontSize: 16, fontFamily: fonts.semibold },
    themeBtn: {
      flexDirection: 'row-reverse' as const,
      alignItems: 'center' as const,
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 48,
    },
    themeBtnText: { color: colors.textPrimary, fontWeight: '600' as const, fontSize: 15, fontFamily: fonts.semibold },
    timerHint: {
      color: colors.accent,
      fontSize: 12,
      textAlign: 'right' as const,
      marginBottom: spacing.sm,
      fontFamily: fonts.medium,
    },
  };
}

export default function ToolsScreen() {
  const router = useRouter();
  const { playbackSpeed, setSpeed, setSleepTimer, sleepTimerEnd, accessToken, user, logout } = usePlayerStore();
  const { mode, toggleMode, colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!sleepTimerEnd) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [sleepTimerEnd]);

  const sleepRemainingMin = useMemo(() => {
    if (!sleepTimerEnd || sleepTimerEnd <= now) return null;
    return Math.max(1, Math.ceil((sleepTimerEnd - now) / 60000));
  }, [sleepTimerEnd, now]);

  const isSleepChipActive = (minutes: number) =>
    sleepRemainingMin !== null &&
    Math.abs(minutes - sleepRemainingMin) <= 1 &&
    sleepTimerEnd !== null &&
    sleepTimerEnd > now;

  const displayInitial = user?.displayName?.charAt(0) || '؟';

  return (
    <TabFadeWrapper segment="tools">
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>ابزارها</Text>
          <Text style={styles.subtitle}>پخش، ظاهر و حساب کاربری</Text>
        </View>

        {accessToken && user ? (
          <View style={styles.profileCard} accessibilityRole="summary">
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{displayInitial}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.displayName}</Text>
              <Text style={styles.profileMeta}>{user.email}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ظاهر</Text>
          <ScalePressable
            style={styles.themeBtn}
            onPress={toggleMode}
            haptic
            accessibilityRole="button"
            accessibilityLabel={mode === 'dark' ? 'تغییر به حالت روشن' : 'تغییر به حالت تیره'}
          >
            <Ionicons name={mode === 'dark' ? 'sunny-outline' : 'moon-outline'} size={20} color={colors.accent} />
            <Text style={styles.themeBtnText}>{mode === 'dark' ? 'حالت روشن' : 'حالت تیره'}</Text>
          </ScalePressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>سرعت پخش</Text>
          <Text style={styles.sectionHint}>سرعت فعلی: {playbackSpeed}×</Text>
          <View style={styles.chipRow}>
            {PLAYBACK_SPEEDS.map((s) => (
              <ScalePressable
                key={s}
                style={[styles.chip, playbackSpeed === s && styles.chipActive]}
                onPress={() => setSpeed(s)}
                haptic
                accessibilityLabel={`سرعت ${s} برابر`}
                accessibilityState={{ selected: playbackSpeed === s }}
              >
                <Text style={[styles.chipText, playbackSpeed === s && styles.chipTextActive]}>{s}×</Text>
              </ScalePressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تایمر خواب</Text>
          {sleepRemainingMin ? (
            <Text style={styles.timerHint}>⏱ حدود {sleepRemainingMin} دقیقه تا توقف پخش</Text>
          ) : (
            <Text style={styles.sectionHint}>پس از اتمام زمان، پخش متوقف می‌شود.</Text>
          )}
          <View style={styles.chipRow}>
            {SLEEP_TIMER_OPTIONS.map((m) => (
              <ScalePressable
                key={m}
                style={[styles.chip, isSleepChipActive(m) && styles.chipActive]}
                onPress={() => setSleepTimer(m)}
                haptic
                accessibilityLabel={`تایمر ${m} دقیقه`}
                accessibilityState={{ selected: isSleepChipActive(m) }}
              >
                <Text style={[styles.chipText, isSleepChipActive(m) && styles.chipTextActive]}>{m}د</Text>
              </ScalePressable>
            ))}
            <ScalePressable
              style={[styles.chip, !sleepRemainingMin && sleepTimerEnd === null && styles.chipActive]}
              onPress={() => setSleepTimer(null)}
              haptic
              accessibilityLabel="خاموش کردن تایمر خواب"
            >
              <Text style={styles.chipText}>خاموش</Text>
            </ScalePressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>در نسخه‌های بعدی</Text>
          <Text style={styles.sectionHint}>این قابلیت‌ها در roadmap هستند و فعلاً غیرفعال‌اند.</Text>
          {COMING_SOON.map((item) => (
            <View key={item.title} style={styles.comingCard} accessibilityRole="text" accessibilityLabel={`${item.title}، به‌زودی`}>
              <View style={styles.comingBadge}>
                <Text style={styles.comingBadgeText}>به‌زودی</Text>
              </View>
              <View style={styles.comingBody}>
                <Text style={styles.comingTitle}>{item.title}</Text>
                <Text style={styles.comingDesc}>{item.desc}</Text>
              </View>
              <View style={styles.toolIcon}>
                <Ionicons name={item.icon} size={20} color={colors.textMuted} accessibilityElementsHidden />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.authSection}>
          {accessToken ? (
            <ScalePressable
              style={styles.logoutBtn}
              onPress={() => {
                void hapticSelection();
                void logout();
              }}
              haptic
              accessibilityRole="button"
              accessibilityLabel="خروج از حساب"
            >
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <Text style={styles.logoutText}>خروج از حساب</Text>
            </ScalePressable>
          ) : (
            <>
              <ScalePressable
                style={styles.loginBtn}
                onPress={() => router.push('/login')}
                haptic
                accessibilityRole="button"
                accessibilityLabel="ورود به حساب"
              >
                <Ionicons name="log-in-outline" size={20} color={colors.textOnPrimary} />
                <Text style={styles.loginText}>ورود به حساب</Text>
              </ScalePressable>
              <ScalePressable
                style={styles.registerBtn}
                onPress={() => router.push('/register')}
                haptic
                accessibilityRole="button"
                accessibilityLabel="ساخت حساب جدید"
              >
                <Text style={styles.registerText}>ساخت حساب جدید</Text>
              </ScalePressable>
            </>
          )}
        </View>

        <View style={{ height: spacing.xxl + 80 }} />
      </ScrollView>
    </SafeAreaView>
    </TabFadeWrapper>
  );
}
