import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePlayerStore } from '@/store/player';
import { CoverArt } from '@/components/CoverArt';
import { ProgressBar } from '@/components/ProgressBar';
import { spacing } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useThemedStyles, type ThemeColors } from '@/hooks/useThemedStyles';

function createStyles(colors: ThemeColors) {
  return {
    wrap: {
      backgroundColor: colors.bgCard,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    row: {
      flexDirection: 'row-reverse' as const,
      alignItems: 'center' as const,
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    info: { flex: 1, alignItems: 'flex-end' as const },
    title: { color: colors.textPrimary, fontWeight: '600' as const, fontSize: 14 },
    subtitle: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
    playBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.accent,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
  };
}

export function MiniPlayer() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const { currentEpisode, isPlaying, position, togglePlay } = usePlayerStore();

  if (!currentEpisode) return null;

  const progress = currentEpisode.duration ? (position / currentEpisode.duration) * 100 : 0;
  const a11yLabel = `در حال پخش: ${currentEpisode.title}، ${currentEpisode.contentTitle}`;

  return (
    <TouchableOpacity
      style={styles.wrap}
      activeOpacity={0.9}
      onPress={() => router.push('/(tabs)/player')}
      accessibilityRole="button"
      accessibilityLabel={`${a11yLabel}. برای باز کردن پخش‌کننده کامل ضربه بزنید`}
    >
      <ProgressBar
        progress={progress}
        height={2}
        accessibilityLabel={`پیشرفت ${currentEpisode.title}`}
        positionSeconds={position}
        durationSeconds={currentEpisode.duration}
      />
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.playBtn}
          onPress={(e) => {
            e.stopPropagation?.();
            togglePlay();
          }}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'توقف پخش' : 'شروع پخش'}
        >
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color={colors.textOnPrimary} accessibilityElementsHidden />
        </TouchableOpacity>
        <View style={styles.info} importantForAccessibility="no-hide-descendants">
          <Text style={styles.title} numberOfLines={1}>
            {currentEpisode.title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {currentEpisode.contentTitle}
          </Text>
        </View>
        <CoverArt
          type={currentEpisode.contentType || 'PODCAST'}
          coverUrl={currentEpisode.coverUrl}
          title={currentEpisode.contentTitle}
          size="sm"
        />
      </View>
    </TouchableOpacity>
  );
}
