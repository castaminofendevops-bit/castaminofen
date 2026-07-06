import { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { apiFetch } from '@/lib/api';
import { usePlayerStore } from '@/store/player';
import { CoverArt } from '@/components/CoverArt';
import { ProgressBar } from '@/components/ProgressBar';
import { SectionHeader } from '@/components/SectionHeader';
import { ErrorBanner } from '@/components/ErrorBanner';
import { EmptyState } from '@/components/EmptyState';
import { ListRowSkeleton } from '@/components/Skeleton';
import { TabFadeWrapper } from '@/components/TabFadeWrapper';
import { ThemedRefreshControl } from '@/components/ThemedRefreshControl';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { spacing, radius } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useThemedStyles, type ThemeColors } from '@/hooks/useThemedStyles';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

function createStyles(colors: ThemeColors) {
  return {
    safe: { flex: 1, backgroundColor: colors.bgPrimary },
    header: { padding: spacing.md, alignItems: 'flex-end' as const },
    title: { color: colors.textPrimary, fontSize: 24, fontWeight: '700' as const },
    subtitle: { color: colors.textMuted, fontSize: 14, marginTop: 4 },
    section: { marginTop: spacing.md },
    item: {
      flexDirection: 'row-reverse' as const,
      alignItems: 'center' as const,
      gap: spacing.md,
      padding: spacing.md,
      marginHorizontal: spacing.md,
      marginBottom: spacing.sm,
      backgroundColor: colors.bgCard,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    itemInfo: { flex: 1, gap: 4 },
    itemTitle: { color: colors.textPrimary, fontWeight: '600' as const, fontSize: 15, textAlign: 'right' as const },
    itemMeta: { color: colors.textMuted, fontSize: 12, textAlign: 'right' as const },
    empty: { color: colors.textMuted, textAlign: 'center' as const, padding: spacing.xl },
    emptyState: { flex: 1, justifyContent: 'center' as const, alignItems: 'center' as const, gap: spacing.md },
    emptyText: { color: colors.textSecondary, fontSize: 16 },
    loginBtn: {
      backgroundColor: colors.accent,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      marginTop: spacing.sm,
    },
    loginBtnText: { color: colors.textOnPrimary, fontWeight: '700' as const, fontSize: 16 },
    itemGrid: {
      flexDirection: 'row-reverse' as const,
      flexWrap: 'wrap' as const,
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    itemTablet: {
      width: '48%' as const,
      marginHorizontal: 0,
      marginBottom: 0,
    },
  };
}

export default function LibraryScreen() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const { isTablet } = useResponsiveLayout();
  const router = useRouter();
  const { accessToken, loadAuth } = usePlayerStore();
  const [continueItems, setContinueItems] = useState<
    Array<{
      position: number;
      episode: { id: string; title: string; duration: number; content: { id: string; title: string; type: string; coverUrl?: string | null } };
    }>
  >([]);
  const [library, setLibrary] = useState<
    Array<{ content: { id: string; title: string; type: string; coverUrl?: string | null } }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadAuth();
  }, [loadAuth]);

  const loadData = useCallback(async (isRefresh = false) => {
    if (!accessToken) return;
    if (isRefresh) setRefreshing(true);
    setError(null);

    const [contRes, libRes] = await Promise.all([
      apiFetch<typeof continueItems>('/media/continue', {}, accessToken),
      apiFetch<typeof library>('/user/library', {}, accessToken),
    ]);

    if (!contRes.success || !libRes.success) {
      setError(contRes.error?.message || libRes.error?.message || 'خطا در بارگذاری کتابخانه');
      setRefreshing(false);
      setInitialLoading(false);
      return;
    }

    if (contRes.data) setContinueItems(contRes.data);
    if (libRes.data) setLibrary(libRes.data);
    setRefreshing(false);
    setInitialLoading(false);
  }, [accessToken]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (!accessToken) {
    return (
      <TabFadeWrapper segment="library">
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>کتابخانه</Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="library-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyText}>برای مشاهده کتابخانه وارد شوید</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/login')} accessibilityRole="button" accessibilityLabel="ورود به حساب">
            <Text style={styles.loginBtnText}>ورود</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      </TabFadeWrapper>
    );
  }

  return (
    <TabFadeWrapper segment="library">
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ResponsiveContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <ThemedRefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>کتابخانه</Text>
          <Text style={styles.subtitle}>محتوای ذخیره‌شده و ادامه گوش دادن</Text>
        </View>

        {error ? <ErrorBanner message={error} onRetry={() => loadData()} /> : null}

        {initialLoading ? (
          <ListRowSkeleton count={5} />
        ) : (
          <>
        {continueItems.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="ادامه گوش دادن" />
            <View style={isTablet ? styles.itemGrid : undefined}>
            {continueItems.map((item) => {
              const progress = item.episode.duration
                ? (item.position / item.episode.duration) * 100
                : 0;
              return (
                <TouchableOpacity
                  key={item.episode.id}
                  style={[styles.item, isTablet && styles.itemTablet]}
                  onPress={() => router.push(`/content/${item.episode.content.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`ادامه: ${item.episode.title}`}
                >
                  <Ionicons name="play-circle" size={32} color={colors.accent} />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{item.episode.title}</Text>
                    <Text style={styles.itemMeta}>
                      {item.episode.content.title} · {Math.floor(item.position / 60)} دقیقه
                    </Text>
                    <ProgressBar
                    progress={progress}
                    height={3}
                    accessibilityLabel={`پیشرفت ${item.episode.title}`}
                    positionSeconds={item.position}
                    durationSeconds={item.episode.duration}
                  />
                  </View>
                  <CoverArt
                    type={item.episode.content.type}
                    coverUrl={item.episode.content.coverUrl}
                    title={item.episode.content.title}
                    size="sm"
                  />
                </TouchableOpacity>
              );
            })}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <SectionHeader title="ذخیره‌شده‌ها" />
          {library.length === 0 ? (
            <EmptyState
              icon="bookmark-outline"
              title="کتابخانه خالی است"
              description="از صفحه محتوا، «ذخیره در کتابخانه» را بزنید."
              actionLabel="کاوش محتوا"
              onAction={() => router.push('/(tabs)')}
            />
          ) : (
            <View style={isTablet ? styles.itemGrid : undefined}>
            {library.map((item) => (
              <TouchableOpacity
                key={item.content.id}
                style={[styles.item, isTablet && styles.itemTablet]}
                onPress={() => router.push(`/content/${item.content.id}`)}
                accessibilityRole="button"
                accessibilityLabel={item.content.title}
              >
                <Ionicons name="chevron-back" size={18} color={colors.textMuted} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle}>{item.content.title}</Text>
                </View>
                <CoverArt
                  type={item.content.type}
                  coverUrl={item.content.coverUrl}
                  title={item.content.title}
                  size="sm"
                />
              </TouchableOpacity>
            ))}
            </View>
          )}
        </View>

        </>
        )}

        <View style={{ height: spacing.xxl + (isTablet ? 40 : 80) }} />
      </ScrollView>
      </ResponsiveContainer>
    </SafeAreaView>
    </TabFadeWrapper>
  );
}
