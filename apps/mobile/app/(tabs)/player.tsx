import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePlayerStore } from '@/store/player';
import { useAudioEngineContext } from '@/context/PlayerAudioContext';
import { CoverArt } from '@/components/CoverArt';
import { PlayerControls } from '@/components/PlayerControls';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import { TabletSplitView } from '@/components/TabletSplitView';
import { spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useThemedStyles, type ThemeColors } from '@/hooks/useThemedStyles';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

function createStyles(colors: ThemeColors) {
  return {
    safe: { flex: 1, backgroundColor: colors.bgPrimary },
    content: { padding: spacing.lg, alignItems: 'center' as const, paddingBottom: spacing.xxl },
    empty: { flex: 1, justifyContent: 'center' as const, alignItems: 'center' as const, gap: spacing.sm },
    emptyText: { color: colors.textPrimary, fontSize: 18, fontWeight: '600' as const },
    emptyHint: { color: colors.textMuted },
    backBtn: {
      marginTop: spacing.lg,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      backgroundColor: colors.bgCard,
      borderRadius: 999,
    },
    backBtnText: { color: colors.accent, fontWeight: '600' as const },
    topBar: {
      flexDirection: 'row-reverse' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      width: '100%' as const,
      marginBottom: spacing.lg,
    },
    topBtn: { width: 44, height: 44, justifyContent: 'center' as const, alignItems: 'center' as const },
    nowPlaying: { color: colors.textMuted, fontSize: 13, fontWeight: '600' as const },
    artworkWrap: { marginVertical: spacing.xl },
    title: { color: colors.textPrimary, fontSize: 22, fontWeight: '700' as const, textAlign: 'center' as const, marginTop: spacing.lg },
    subtitle: { color: colors.textMuted, fontSize: 15, marginTop: spacing.sm, textAlign: 'center' as const },
    tabletMaster: { justifyContent: 'center' as const, alignItems: 'center' as const, paddingVertical: spacing.xl },
    tabletDetail: { justifyContent: 'center' as const, paddingVertical: spacing.lg },
  };
}

export default function PlayerScreen() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const { isTablet } = useResponsiveLayout();
  const router = useRouter();
  const { seekTo, skipForward, skipBackward } = useAudioEngineContext();
  const currentEpisode = usePlayerStore((s) => s.currentEpisode);

  if (!currentEpisode) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Ionicons name="musical-notes-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyText}>اپیزودی انتخاب نشده</Text>
          <Text style={styles.emptyHint}>از صفحه کاوش یک محتوا انتخاب کنید</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} accessibilityLabel="بازگشت" accessibilityRole="button">
            <Text style={styles.backBtnText}>بازگشت</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const artworkBlock = (
    <>
      <View style={styles.artworkWrap}>
        <CoverArt
          type={currentEpisode.contentType || 'AUDIOBOOK'}
          coverUrl={currentEpisode.coverUrl}
          title={currentEpisode.contentTitle}
          size="xl"
          glow
        />
      </View>
      <Text style={styles.title}>{currentEpisode.title}</Text>
      <Text style={styles.subtitle}>{currentEpisode.contentTitle}</Text>
    </>
  );

  const controlsBlock = (
    <PlayerControls
      onSeek={seekTo}
      onSkipForward={() => void skipForward()}
      onSkipBackward={() => void skipBackward()}
    />
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ResponsiveContainer>
        {isTablet ? (
          <View style={{ flex: 1, padding: spacing.lg }}>
            <View style={styles.topBar}>
              <TouchableOpacity onPress={() => router.back()} style={styles.topBtn} accessibilityLabel="بستن پخش‌کننده" accessibilityRole="button">
                <Ionicons name="chevron-down" size={28} color={colors.textPrimary} accessibilityElementsHidden />
              </TouchableOpacity>
              <Text style={styles.nowPlaying}>در حال پخش</Text>
              <View style={styles.topBtn} />
            </View>
            <TabletSplitView
              master={<View style={styles.tabletMaster}>{artworkBlock}</View>}
              detail={<View style={styles.tabletDetail}>{controlsBlock}</View>}
              masterFlex={0.45}
            />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.topBar}>
              <TouchableOpacity
                onPress={() => {
                  usePlayerStore.getState().setPlayerSheetExpanded(false);
                  router.back();
                }}
                style={styles.topBtn}
                accessibilityLabel="بستن پخش‌کننده"
                accessibilityRole="button"
              >
                <Ionicons name="chevron-down" size={28} color={colors.textPrimary} accessibilityElementsHidden />
              </TouchableOpacity>
              <Text style={styles.nowPlaying}>در حال پخش</Text>
              <View style={styles.topBtn} />
            </View>
            {artworkBlock}
            {controlsBlock}
          </ScrollView>
        )}
      </ResponsiveContainer>
    </SafeAreaView>
  );
}
