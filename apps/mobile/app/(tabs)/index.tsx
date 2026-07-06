import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { ContentGridSkeleton } from '@/components/Skeleton';
import { TabFadeWrapper } from '@/components/TabFadeWrapper';
import { ThemedRefreshControl } from '@/components/ThemedRefreshControl';
import { ErrorBanner } from '@/components/ErrorBanner';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiFetch } from '@/lib/api';
import { usePlayerStore } from '@/store/player';
import { CoverArt } from '@/components/CoverArt';
import { ProgressBar } from '@/components/ProgressBar';
import { SectionHeader } from '@/components/SectionHeader';
import { EmptyState } from '@/components/EmptyState';
import { StartHereSection } from '@/components/StartHereSection';
import { TrendingSection } from '@/components/TrendingSection';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { spacing, radius } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useThemedStyles, type ThemeColors } from '@/hooks/useThemedStyles';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

interface ContentItem {
  id: string;
  title: string;
  type: string;
  coverUrl?: string | null;
  episodeCount: number;
  isPremium: boolean;
  creator: { displayName: string };
}

const CATEGORIES = [
  { id: 'podcast', label: 'پادکست', icon: 'mic' as const, type: 'PODCAST' },
  { id: 'video', label: 'ویدیو', icon: 'videocam' as const, type: 'VIDEO' },
  { id: 'audiobook', label: 'کتاب صوتی', icon: 'book' as const, type: 'AUDIOBOOK' },
  { id: 'history', label: 'تاریخ', icon: 'time' as const, type: 'AUDIOBOOK' },
  { id: 'psychology', label: 'روانشناسی', icon: 'heart' as const, type: 'AUDIOBOOK' },
  { id: 'business', label: 'کسب‌وکار', icon: 'briefcase' as const, type: 'PODCAST' },
  { id: 'science', label: 'علمی', icon: 'flask' as const, type: 'PODCAST' },
  { id: 'more', label: 'بیشتر', icon: 'grid' as const, type: '' },
];

function createStyles(colors: ThemeColors) {
  return {
    safe: { flex: 1, backgroundColor: colors.bgPrimary },
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center' as const, alignItems: 'center' as const, backgroundColor: colors.bgPrimary },
    header: {
      flexDirection: 'row-reverse' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    skeletonTitle: {
      width: 160,
      height: 24,
      borderRadius: radius.sm,
      backgroundColor: colors.bgCard,
      alignSelf: 'flex-end' as const,
    },
    skeletonSubtitle: {
      width: 200,
      height: 14,
      borderRadius: radius.sm,
      backgroundColor: colors.bgCard,
      marginTop: spacing.sm,
      alignSelf: 'flex-end' as const,
      opacity: 0.7,
    },
    greeting: { alignItems: 'flex-end' as const },
    hello: { color: colors.textPrimary, fontSize: 22, fontWeight: '700' as const },
    subGreeting: { color: colors.textMuted, fontSize: 14, marginTop: 4 },
    section: { marginTop: spacing.lg },
    hList: { paddingHorizontal: spacing.md, gap: spacing.md },
    continueCard: {
      width: 260,
      flexDirection: 'row-reverse' as const,
      backgroundColor: colors.bgCard,
      borderRadius: radius.md,
      padding: spacing.sm,
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    continueInfo: { flex: 1, justifyContent: 'center' as const, gap: 6 },
    continueTitle: { color: colors.textPrimary, fontWeight: '600' as const, fontSize: 14, textAlign: 'right' as const },
    continueMeta: { color: colors.textMuted, fontSize: 12, textAlign: 'right' as const },
    categoryGrid: {
      flexDirection: 'row-reverse' as const,
      flexWrap: 'wrap' as const,
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
    },
    categoryItem: {
      alignItems: 'center' as const,
      marginBottom: spacing.sm,
    },
    categoryIcon: {
      width: 56,
      height: 56,
      borderRadius: radius.md,
      backgroundColor: colors.accentMuted,
      borderWidth: 1,
      borderColor: colors.accentBorder,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginBottom: 6,
    },
    categoryLabel: { color: colors.textSecondary, fontSize: 11, textAlign: 'center' as const },
    featuredCard: {
      flexDirection: 'row-reverse' as const,
      marginHorizontal: spacing.md,
      marginBottom: spacing.md,
      backgroundColor: colors.bgCard,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    featuredInfo: { flex: 1, justifyContent: 'center' as const, alignItems: 'flex-end' as const },
    featuredTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' as const, textAlign: 'right' as const },
    featuredMeta: { color: colors.textMuted, fontSize: 13, marginTop: 6, textAlign: 'right' as const },
    premiumBadge: {
      flexDirection: 'row-reverse' as const,
      alignItems: 'center' as const,
      gap: 4,
      marginTop: 8,
      backgroundColor: colors.accentMuted,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: radius.full,
    },
    premiumText: { color: colors.accent, fontSize: 11, fontWeight: '600' as const },
    featuredGrid: {
      flexDirection: 'row-reverse' as const,
      flexWrap: 'wrap' as const,
      gap: spacing.md,
      paddingHorizontal: spacing.md,
    },
    featuredCardTablet: {
      width: '48%' as const,
      marginHorizontal: 0,
      marginBottom: 0,
    },
  };
}

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const { isTablet, categoryItemPercent } = useResponsiveLayout();
  const router = useRouter();
  const { user, accessToken } = usePlayerStore();
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [continueItems, setContinueItems] = useState<
    Array<{
      position: number;
      episode: { id: string; title: string; duration: number; content: { id: string; title: string; type: string; coverUrl?: string | null } };
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    const res = await apiFetch<ContentItem[]>('/explore');
    if (res.success && res.data) {
      setContents(res.data);
    } else {
      setError(res.error?.message || 'خطا در بارگذاری محتوا');
    }

    if (accessToken) {
      const contRes = await apiFetch<typeof continueItems>('/media/continue', {}, accessToken);
      if (contRes.data) setContinueItems(contRes.data);
    }

    setLoading(false);
    setRefreshing(false);
  }, [accessToken]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const displayName = user?.displayName?.split(' ')[0] || 'کاربر';

  if (loading) {
    return (
      <TabFadeWrapper segment="index">
        <SafeAreaView style={styles.safe} edges={['top']}>
          <View style={styles.header}>
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonSubtitle} />
          </View>
          <ContentGridSkeleton count={6} />
        </SafeAreaView>
      </TabFadeWrapper>
    );
  }

  return (
    <TabFadeWrapper segment="index">
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ResponsiveContainer>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <ThemedRefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />
        }
      >
        {error ? <ErrorBanner message={error} onRetry={() => loadData()} /> : null}
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.greeting}>
            <Text style={styles.hello}>سلام {displayName} 👋</Text>
            <Text style={styles.subGreeting}>امروز چی گوش می‌دی؟</Text>
          </View>
        </View>

        {/* Continue Listening */}
        {continueItems.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="ادامه گوش دادن" actionLabel="همه" onAction={() => router.push('/(tabs)/library')} />
            <FlatList
              horizontal
              inverted
              data={continueItems}
              keyExtractor={(item) => item.episode.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hList}
              renderItem={({ item }) => {
                const progress = item.episode.duration
                  ? (item.position / item.episode.duration) * 100
                  : 0;
                return (
                  <TouchableOpacity
                    style={styles.continueCard}
                    onPress={() => router.push(`/content/${item.episode.content.id}`)}
                    accessibilityRole="button"
                    accessibilityLabel={`ادامه گوش دادن: ${item.episode.title} از ${item.episode.content.title}`}
                  >
                    <CoverArt
                      type={item.episode.content.type}
                      coverUrl={item.episode.content.coverUrl}
                      title={item.episode.content.title}
                      size="md"
                    />
                    <View style={styles.continueInfo}>
                      <Text style={styles.continueTitle} numberOfLines={1}>
                        {item.episode.title}
                      </Text>
                      <Text style={styles.continueMeta} numberOfLines={1}>
                        {item.episode.content.title}
                      </Text>
                      <ProgressBar
                        progress={progress}
                        height={3}
                        accessibilityLabel={`پیشرفت ${item.episode.title}`}
                        positionSeconds={item.position}
                        durationSeconds={item.episode.duration}
                      />
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}

        <StartHereSection picks={contents} />

        <TrendingSection />

        {/* Categories */}
        <View style={styles.section}>
          <SectionHeader title="دسته‌بندی‌ها" />
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryItem, { width: categoryItemPercent as `${number}%` }]}
                accessibilityRole="button"
                accessibilityLabel={`دسته‌بندی ${cat.label}`}
                onPress={() => {
                  if (cat.type) {
                    router.push({ pathname: '/(tabs)/search', params: { type: cat.type } });
                  } else if (cat.id !== 'more') {
                    router.push({ pathname: '/(tabs)/search', params: { q: cat.label } });
                  } else {
                    router.push('/(tabs)/search');
                  }
                }}
              >
                <View style={styles.categoryIcon}>
                  <Ionicons name={cat.icon} size={22} color={colors.accent} />
                </View>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* For You */}
        <View style={styles.section}>
          <SectionHeader title="پیشنهاد برای شما" actionLabel="بیشتر" onAction={() => router.push('/(tabs)/search')} />
          <View style={isTablet ? styles.featuredGrid : undefined}>
          {contents.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.featuredCard, isTablet && styles.featuredCardTablet]}
              onPress={() => router.push(`/content/${item.id}`)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}، ${item.creator.displayName}، ${item.episodeCount} اپیزود${item.isPremium ? '، پریمیوم' : ''}`}
            >
              <CoverArt type={item.type} coverUrl={item.coverUrl} title={item.title} size="lg" glow />
              <View style={styles.featuredInfo}>
                <Text style={styles.featuredTitle}>{item.title}</Text>
                <Text style={styles.featuredMeta}>
                  {item.creator.displayName} · {item.episodeCount} اپیزود
                </Text>
                {item.isPremium && (
                  <View style={styles.premiumBadge}>
                    <Ionicons name="star" size={12} color={colors.accent} />
                    <Text style={styles.premiumText}>پریمیوم</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
          </View>
          {contents.length === 0 && (
            <EmptyState
              title="فعلاً محتوایی نیست"
              description="به‌زودی پادکست و کتاب صوتی جدید اضافه می‌شود."
              actionLabel="جستجو"
              onAction={() => router.push('/(tabs)/search')}
            />
          )}
        </View>

        <View style={{ height: spacing.xxl + (isTablet ? 40 : 80) }} />
      </ScrollView>
      </ResponsiveContainer>
    </SafeAreaView>
    </TabFadeWrapper>
  );
}
