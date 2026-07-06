import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiFetch } from '@/lib/api';
import { addRecentSearch, getRecentSearches, removeRecentSearch } from '@/lib/recentSearch';
import { CoverArt } from '@/components/CoverArt';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { SearchResultsSkeleton } from '@/components/Skeleton';
import { TabFadeWrapper } from '@/components/TabFadeWrapper';
import { ThemedRefreshControl } from '@/components/ThemedRefreshControl';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { spacing, radius } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useThemedStyles, type ThemeColors } from '@/hooks/useThemedStyles';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

const TRENDING = ['روانشناسی', 'تاریخ ایران', 'کسب‌وکار', 'علم', 'فلسفه'];

type ContentItem = {
  id: string;
  title: string;
  type: string;
  coverUrl?: string | null;
  creator: { displayName: string };
};

type EpisodeItem = {
  id: string;
  title: string;
  duration: number;
  contentId: string;
  contentTitle: string;
  isVideo: boolean;
};

type CreatorItem = {
  id: string;
  slug: string;
  displayName: string;
  avatarUrl: string | null;
  isVerified: boolean;
};

type SearchResults = {
  contents: ContentItem[];
  episodes: EpisodeItem[];
  creators: CreatorItem[];
};

function emptyResults(): SearchResults {
  return { contents: [], episodes: [], creators: [] };
}

function normalizeSearchData(
  data: SearchResults | ContentItem[] | null | undefined,
): SearchResults {
  if (!data) return emptyResults();
  if (Array.isArray(data)) return { contents: data, episodes: [], creators: [] };
  return {
    contents: data.contents ?? [],
    episodes: data.episodes ?? [],
    creators: data.creators ?? [],
  };
}

function hasResults(results: SearchResults) {
  return results.contents.length > 0 || results.episodes.length > 0 || results.creators.length > 0;
}

function createStyles(colors: ThemeColors) {
  return {
    safe: { flex: 1, backgroundColor: colors.bgPrimary },
    header: { padding: spacing.md, alignItems: 'flex-end' as const },
    title: { color: colors.textPrimary, fontSize: 24, fontWeight: '700' as const },
    searchRow: {
      flexDirection: 'row-reverse' as const,
      alignItems: 'center' as const,
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
    },
    input: {
      flex: 1,
      backgroundColor: colors.bgInput,
      borderRadius: radius.md,
      padding: spacing.md,
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    clearBtn: { padding: spacing.xs },
    searchBtn: {
      width: 48,
      height: 48,
      borderRadius: radius.md,
      backgroundColor: colors.accent,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    filters: { flexDirection: 'row-reverse' as const, flexWrap: 'wrap' as const, gap: spacing.sm, padding: spacing.md },
    filterChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bgCard,
    },
    filterChipActive: { borderColor: colors.accent, backgroundColor: colors.accentMuted },
    filterText: { color: colors.textSecondary, fontSize: 13 },
    filterTextActive: { color: colors.accent, fontWeight: '700' as const },
    trending: { padding: spacing.md, gap: spacing.sm },
    trendingTitle: { color: colors.textSecondary, fontSize: 14, textAlign: 'right' as const, marginBottom: spacing.sm },
    recentRow: { flexDirection: 'row-reverse' as const, flexWrap: 'wrap' as const, gap: spacing.sm },
    recentChip: {
      flexDirection: 'row-reverse' as const,
      alignItems: 'center' as const,
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.border,
    },
    recentText: { color: colors.textSecondary, fontSize: 13 },
    recentRemove: { color: colors.textMuted, fontSize: 16, paddingHorizontal: 4 },
    trendChip: {
      alignSelf: 'flex-end' as const,
      backgroundColor: colors.bgCard,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      marginBottom: spacing.xs,
    },
    trendText: { color: colors.textPrimary, fontSize: 14 },
    center: { padding: spacing.xl, alignItems: 'center' as const },
    list: { paddingBottom: 120 },
    sectionTitle: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '700' as const,
      textAlign: 'right' as const,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    resultRow: {
      flexDirection: 'row-reverse' as const,
      alignItems: 'center' as const,
      gap: spacing.md,
      padding: spacing.md,
      marginHorizontal: spacing.md,
      marginBottom: spacing.sm,
      backgroundColor: colors.bgCard,
      borderRadius: radius.md,
    },
    resultInfo: { flex: 1, alignItems: 'flex-end' as const },
    resultTitle: { color: colors.textPrimary, fontWeight: '600' as const },
    resultMeta: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.accentMuted,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    avatarText: { color: colors.accent, fontWeight: '700' as const, fontSize: 16 },
    contentGrid: {
      flexDirection: 'row-reverse' as const,
      flexWrap: 'wrap' as const,
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    contentGridItem: {
      width: '48%' as const,
      marginHorizontal: 0,
      marginBottom: 0,
    },
  };
}

export default function SearchScreen() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const { isTablet } = useResponsiveLayout();
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string; type?: string }>();
  const [query, setQuery] = useState(params.q ?? '');
  const [typeFilter, setTypeFilter] = useState(params.type ?? '');
  const [results, setResults] = useState<SearchResults>(emptyResults());
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    void getRecentSearches().then(setRecentSearches);
  }, []);

  const runSearch = useCallback(async (term: string, type: string, isRefresh = false) => {
    const q = term.trim();
    if (!q && !type) {
      setResults(emptyResults());
      setSearched(false);
      setError(null);
      return;
    }

    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setSearched(true);
    setError(null);

    const searchParams = new URLSearchParams();
    if (q) searchParams.set('q', q);
    if (type) searchParams.set('type', type);

    const path = q ? `/search?${searchParams}` : `/explore?${type ? `type=${type}` : ''}`;
    const res = await apiFetch<SearchResults | ContentItem[]>(path);

    if (!res.success) {
      setError(res.error?.message || 'خطا در جستجو');
      setResults(emptyResults());
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setResults(normalizeSearchData(res.data));
    if (q.length >= 2) {
      void addRecentSearch(q).then(setRecentSearches);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (params.q || params.type) {
      setQuery(params.q ?? '');
      setTypeFilter(params.type ?? '');
      void runSearch(params.q ?? '', params.type ?? '');
    }
  }, [params.q, params.type, runSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2 || typeFilter) {
        void runSearch(query, typeFilter);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query, typeFilter, runSearch]);

  const showResults = useMemo(
    () => searched && !loading && hasResults(results),
    [searched, loading, results],
  );

  const renderCreator = (creator: CreatorItem) => (
    <TouchableOpacity
      key={`creator-${creator.id}`}
      style={styles.resultRow}
      onPress={() => {
        setQuery(creator.displayName);
        void runSearch(creator.displayName, typeFilter);
      }}
      accessibilityRole="button"
      accessibilityLabel={`سازنده ${creator.displayName}`}
    >
      <Ionicons name="chevron-back" size={18} color={colors.textMuted} />
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle}>
          {creator.displayName}
          {creator.isVerified ? ' ✓' : ''}
        </Text>
        <Text style={styles.resultMeta}>@{creator.slug}</Text>
      </View>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{creator.displayName.charAt(0)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEpisode = (episode: EpisodeItem) => (
    <TouchableOpacity
      key={`episode-${episode.id}`}
      style={styles.resultRow}
      onPress={() => router.push(`/content/${episode.contentId}`)}
      accessibilityRole="button"
      accessibilityLabel={`اپیزود ${episode.title} از ${episode.contentTitle}`}
    >
      <Ionicons name="chevron-back" size={18} color={colors.textMuted} />
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle}>{episode.title}</Text>
        <Text style={styles.resultMeta}>
          {episode.contentTitle}
          {episode.duration ? ` · ${Math.floor(episode.duration / 60)} دقیقه` : ''}
        </Text>
      </View>
      <Ionicons
        name={episode.isVideo ? 'videocam' : 'musical-notes'}
        size={22}
        color={episode.isVideo ? colors.videoProgress : colors.accent}
      />
    </TouchableOpacity>
  );

  const renderContent = (content: ContentItem) => (
    <TouchableOpacity
      key={`content-${content.id}`}
      style={[styles.resultRow, isTablet && styles.contentGridItem]}
      onPress={() => router.push(`/content/${content.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${content.title}، ${content.creator.displayName}`}
    >
      <Ionicons name="chevron-back" size={18} color={colors.textMuted} />
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle}>{content.title}</Text>
        <Text style={styles.resultMeta}>{content.creator.displayName}</Text>
      </View>
      <CoverArt type={content.type} coverUrl={content.coverUrl} title={content.title} size="sm" />
    </TouchableOpacity>
  );

  return (
    <TabFadeWrapper segment="search">
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ResponsiveContainer>
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          searched ? (
            <ThemedRefreshControl
              refreshing={refreshing}
              onRefresh={() => runSearch(query, typeFilter, true)}
            />
          ) : undefined
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>جستجو</Text>
        </View>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder="پادکست، کتاب صوتی، ویدیو..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            textAlign="right"
            accessibilityLabel="جستجو"
            accessibilityHint="عنوان محتوا، اپیزود یا نام سازنده را وارد کنید"
          />
          {query ? (
            <TouchableOpacity style={styles.clearBtn} onPress={() => setQuery('')} accessibilityLabel="پاک کردن جستجو">
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => runSearch(query, typeFilter)}
            accessibilityLabel="اجرای جستجو"
            accessibilityRole="button"
          >
            <Ionicons name="search" size={20} color={colors.textOnPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.filters}>
          {['', 'PODCAST', 'AUDIOBOOK', 'VIDEO'].map((t) => (
            <TouchableOpacity
              key={t || 'all'}
              style={[styles.filterChip, typeFilter === t && styles.filterChipActive]}
              onPress={() => setTypeFilter(t)}
              accessibilityRole="button"
              accessibilityLabel={t === '' ? 'فیلتر همه انواع' : `فیلتر ${t === 'PODCAST' ? 'پادکست' : t === 'AUDIOBOOK' ? 'کتاب صوتی' : 'ویدیو'}`}
              accessibilityState={{ selected: typeFilter === t }}
            >
              <Text style={[styles.filterText, typeFilter === t && styles.filterTextActive]}>
                {t === '' ? 'همه' : t === 'PODCAST' ? 'پادکست' : t === 'AUDIOBOOK' ? 'کتاب صوتی' : 'ویدیو'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error ? <ErrorBanner message={error} onRetry={() => runSearch(query, typeFilter)} /> : null}

        {!query && recentSearches.length > 0 && !loading && (
          <View style={styles.trending}>
            <Text style={styles.trendingTitle}>جستجوهای اخیر</Text>
            <View style={styles.recentRow}>
              {recentSearches.map((term) => (
                <TouchableOpacity
                  key={term}
                  style={styles.recentChip}
                  onPress={() => setQuery(term)}
                  accessibilityRole="button"
                  accessibilityLabel={`جستجوی ${term}`}
                >
                  <Text style={styles.recentText}>{term}</Text>
                  <TouchableOpacity
                    onPress={() => void removeRecentSearch(term).then(setRecentSearches)}
                    hitSlop={8}
                    accessibilityLabel={`حذف ${term}`}
                    accessibilityRole="button"
                  >
                    <Text style={styles.recentRemove}>×</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {!searched && (
          <View style={styles.trending}>
            <Text style={styles.trendingTitle}>جستجوهای پرطرفدار</Text>
            {TRENDING.map((t) => (
              <TouchableOpacity key={t} style={styles.trendChip} onPress={() => setQuery(t)} accessibilityLabel={`جستجوی ${t}`}>
                <Text style={styles.trendText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {loading && <SearchResultsSkeleton />}

        {!loading && searched && !hasResults(results) && !error && (
          <EmptyState title="نتیجه‌ای پیدا نشد" description="عبارت یا فیلتر دیگری امتحان کنید." />
        )}

        {showResults && results.creators.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>سازندگان</Text>
            {results.creators.map(renderCreator)}
          </>
        )}

        {showResults && results.episodes.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>اپیزودها</Text>
            {results.episodes.map(renderEpisode)}
          </>
        )}

        {showResults && results.contents.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>محتوا</Text>
            <View style={isTablet ? styles.contentGrid : undefined}>
              {results.contents.map(renderContent)}
            </View>
          </>
        )}
      </ScrollView>
      </ResponsiveContainer>
    </SafeAreaView>
    </TabFadeWrapper>
  );
}
