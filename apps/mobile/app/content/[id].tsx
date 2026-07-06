import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiFetch } from '@/lib/api';
import { usePlayerStore } from '@/store/player';
import { CoverArt } from '@/components/CoverArt';
import { PaywallModal } from '@/components/PaywallModal';
import { RelatedContentSection } from '@/components/RelatedContentSection';
import { ContentDetailSkeleton } from '@/components/Skeleton';
import { TabletSplitView } from '@/components/TabletSplitView';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { spacing, radius } from '@/constants/theme';
import { isPremiumError } from '@/lib/premium';
import { useAppTheme } from '@/context/ThemeContext';
import { useThemedStyles, type ThemeColors } from '@/hooks/useThemedStyles';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

interface Episode {
  id: string;
  title: string;
  duration: number;
  episodeNumber: number;
}

function createStyles(colors: ThemeColors) {
  return {
    container: { flex: 1, backgroundColor: colors.bgPrimary },
    center: { flex: 1, justifyContent: 'center' as const, alignItems: 'center' as const, backgroundColor: colors.bgPrimary },
    muted: { color: colors.textMuted },
    hero: { alignItems: 'center' as const, padding: spacing.lg },
    title: { color: colors.textPrimary, fontSize: 22, fontWeight: '700' as const, textAlign: 'center' as const, marginTop: spacing.lg },
    creatorRow: {
      flexDirection: 'row-reverse' as const,
      flexWrap: 'wrap' as const,
      justifyContent: 'center' as const,
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    creator: { color: colors.textMuted, fontSize: 15, marginTop: spacing.sm },
    actionBtn: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: colors.accent,
    },
    actionBtnActive: { backgroundColor: colors.accentMuted },
    actionText: { color: colors.accent, fontWeight: '600' as const, fontSize: 13 },
    actionTextActive: { color: colors.accent },
    desc: { color: colors.textSecondary, marginTop: spacing.md, lineHeight: 24, textAlign: 'center' as const, fontSize: 14 },
    sectionTitle: {
      color: colors.textPrimary,
      fontWeight: '700' as const,
      fontSize: 16,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.sm,
      textAlign: 'right' as const,
    },
    episode: {
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
    epInfo: { flex: 1, alignItems: 'flex-end' as const },
    epTitle: { color: colors.textPrimary, fontWeight: '600' as const, fontSize: 15 },
    epDuration: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
    tabletHero: { flex: 1, alignItems: 'center' as const, padding: spacing.lg, justifyContent: 'center' as const },
    tabletEpisodes: { flex: 1 },
    episodeGrid: {
      flexDirection: 'row-reverse' as const,
      flexWrap: 'wrap' as const,
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    episodeGridItem: {
      width: '48%' as const,
      flexDirection: 'row-reverse' as const,
      alignItems: 'center' as const,
      gap: spacing.md,
      padding: spacing.md,
      backgroundColor: colors.bgCard,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
  };
}

export default function ContentDetailScreen() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const { isTablet } = useResponsiveLayout();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { accessToken, playEpisode } = usePlayerStore();
  const [content, setContent] = useState<{
    title: string;
    description: string;
    type: string;
    coverUrl?: string | null;
    episodes: Episode[];
    creator: { displayName: string; id: string };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [inLibrary, setInLibrary] = useState(false);
  const [following, setFollowing] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [pendingEpisode, setPendingEpisode] = useState<Episode | null>(null);

  useEffect(() => {
    apiFetch<typeof content>(`/contents/${id}`)
      .then((res) => res.data && setContent(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!accessToken) return;
    apiFetch<Array<{ content: { id: string } }>>('/user/library', {}, accessToken).then((res) => {
      if (res.data) setInLibrary(res.data.some((item) => item.content.id === id));
    });
    apiFetch<Array<{ creator: { id: string } }>>('/user/following', {}, accessToken).then((res) => {
      if (res.data && content) {
        setFollowing(res.data.some((f) => f.creator.id === content.creator.id));
      }
    });
  }, [accessToken, id, content]);

  const toggleLibrary = async () => {
    if (!accessToken) {
      router.push('/login');
      return;
    }
    if (inLibrary) {
      const res = await apiFetch(`/user/library/${id}`, { method: 'DELETE' }, accessToken);
      if (res.success) {
        setInLibrary(false);
        Alert.alert('کتابخانه', 'از کتابخانه حذف شد');
      } else {
        Alert.alert('خطا', res.error?.message || 'خطا در حذف');
      }
      return;
    }
    const res = await apiFetch(`/user/library/${id}`, { method: 'POST' }, accessToken);
    if (res.success) {
      setInLibrary(true);
      Alert.alert('کتابخانه', 'به کتابخانه اضافه شد');
    }
  };

  const toggleFollow = async () => {
    if (!accessToken || !content) {
      router.push('/login');
      return;
    }
    const res = await apiFetch(
      `/user/follow/${content.creator.id}`,
      { method: following ? 'DELETE' : 'POST' },
      accessToken,
    );
    if (res.success) {
      setFollowing(!following);
    }
  };

  const handlePlay = async (episode: Episode) => {
    if (!accessToken) {
      router.push('/login');
      return;
    }
    const res = await apiFetch<{ url: string }>(`/media/stream/${episode.id}`, {}, accessToken);
    if (!res.success || !res.data?.url) {
      if (isPremiumError(res.error?.message, res.error?.code)) {
        setPendingEpisode(episode);
        setPaywallOpen(true);
      } else {
        Alert.alert('خطا', res.error?.message || 'خطا در پخش');
      }
      return;
    }
    if (content?.type === 'VIDEO') {
      router.push({
        pathname: '/video/[id]',
        params: { id: episode.id, url: res.data.url, title: episode.title, contentTitle: content.title },
      });
      return;
    }
    playEpisode(
      {
        id: episode.id,
        title: episode.title,
        duration: episode.duration,
        contentTitle: content?.title,
        contentType: content?.type,
        coverUrl: content?.coverUrl,
      },
      res.data.url,
    );
    if (isTablet) {
      router.push('/(tabs)/player');
    } else {
      usePlayerStore.getState().setPlayerSheetExpanded(true);
    }
  };

  const handlePaywallUnlocked = () => {
    if (pendingEpisode) void handlePlay(pendingEpisode);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ContentDetailSkeleton />
      </View>
    );
  }

  if (!content) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>محتوا یافت نشد</Text>
      </View>
    );
  }

  const heroBlock = (
    <View style={isTablet ? styles.tabletHero : styles.hero}>
      <CoverArt type={content.type} coverUrl={content.coverUrl} title={content.title} size="lg" glow />
      <Text style={styles.title}>{content.title}</Text>
      <View style={styles.creatorRow}>
        <TouchableOpacity
          style={[styles.actionBtn, following && styles.actionBtnActive]}
          onPress={toggleFollow}
          accessibilityRole="button"
          accessibilityLabel={following ? 'لغو دنبال کردن سازنده' : 'دنبال کردن سازنده'}
          accessibilityState={{ selected: following }}
        >
          <Text style={[styles.actionText, following && styles.actionTextActive]}>
            {following ? '✓ دنبال می‌کنید' : 'دنبال کردن'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, inLibrary && styles.actionBtnActive]}
          onPress={toggleLibrary}
          accessibilityRole="button"
          accessibilityLabel={inLibrary ? 'در کتابخانه' : 'ذخیره در کتابخانه'}
          accessibilityState={{ selected: inLibrary }}
        >
          <Text style={[styles.actionText, inLibrary && styles.actionTextActive]}>
            {inLibrary ? '✓ در کتابخانه' : 'ذخیره'}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.creator}>{content.creator.displayName}</Text>
      {content.description ? <Text style={styles.desc}>{content.description}</Text> : null}
    </View>
  );

  const episodeList = (
    <>
      <Text style={styles.sectionTitle}>اپیزودها ({content.episodes.length})</Text>
      <View style={isTablet ? styles.episodeGrid : undefined}>
        {content.episodes.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={isTablet ? styles.episodeGridItem : styles.episode}
            onPress={() => handlePlay(item)}
            accessibilityRole="button"
            accessibilityLabel={`پخش اپیزود ${item.episodeNumber}: ${item.title}، ${Math.floor(item.duration / 60)} دقیقه`}
          >
            <Ionicons name={content.type === 'VIDEO' ? 'play-circle' : 'headset'} size={28} color={colors.accent} />
            <View style={styles.epInfo}>
              <Text style={styles.epTitle}>
                {item.episodeNumber}. {item.title}
              </Text>
              <Text style={styles.epDuration}>{Math.floor(item.duration / 60)} دقیقه</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  const episodesBlock = isTablet ? (
    <ScrollView style={styles.tabletEpisodes} showsVerticalScrollIndicator={false}>
      {episodeList}
    </ScrollView>
  ) : (
    <View>{episodeList}</View>
  );

  return (
    <>
      <ResponsiveContainer>
        {isTablet ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            <TabletSplitView master={heroBlock} detail={episodesBlock} />
            <RelatedContentSection contentId={id} />
            <View style={{ height: spacing.xl }} />
          </ScrollView>
        ) : (
          <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {heroBlock}
            {episodesBlock}
            <RelatedContentSection contentId={id} />
            <View style={{ height: spacing.xl }} />
          </ScrollView>
        )}
      </ResponsiveContainer>
      <PaywallModal
        visible={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        contentId={id}
        contentTitle={content.title}
        onUnlocked={handlePaywallUnlocked}
      />
    </>
  );
}
