import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SLEEP_TIMER_OPTIONS } from '@castaminofen/shared';
import { usePlayerStore } from '@/store/player';
import { ProgressBar } from '@/components/ProgressBar';
import { ScalePressable } from '@/components/ScalePressable';
import { spacing, radius } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useThemedStyles, type ThemeColors } from '@/hooks/useThemedStyles';
import { hapticSelection } from '@/lib/haptics';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function createStyles(colors: ThemeColors) {
  return {
    progressWrap: { width: '100%' as const, marginTop: spacing.md },
    timeRow: { flexDirection: 'row-reverse' as const, justifyContent: 'space-between' as const, marginTop: spacing.sm },
    time: { color: colors.textMuted, fontSize: 12 },
    controls: {
      flexDirection: 'row-reverse' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: spacing.md,
      marginTop: spacing.lg,
      width: '100%' as const,
    },
    playBtn: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.accent,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginHorizontal: spacing.sm,
    },
    skipBtn: { alignItems: 'center' as const, width: 48 },
    skipLabel: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
    sideBtn: { width: 44, alignItems: 'center' as const },
    speedBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.accentBorder,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    speedText: { color: colors.accent, fontWeight: '700' as const, fontSize: 12 },
    sleepRow: {
      width: '100%' as const,
      marginTop: spacing.lg,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    sleepLabel: { color: colors.textSecondary, textAlign: 'right' as const, marginBottom: spacing.sm, fontWeight: '600' as const },
    sleepChips: { flexDirection: 'row-reverse' as const, flexWrap: 'wrap' as const, gap: spacing.sm },
    sleepChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sleepChipText: { color: colors.textSecondary, fontSize: 13 },
  };
}

interface PlayerControlsProps {
  onSeek: (percent: number) => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
}

export function PlayerControls({ onSeek, onSkipForward, onSkipBackward }: PlayerControlsProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const {
    currentEpisode,
    isPlaying,
    position,
    playbackSpeed,
    isBookmarked,
    togglePlay,
    setSpeed,
    setSleepTimer,
    toggleBookmark,
  } = usePlayerStore();

  if (!currentEpisode) return null;

  const progress = currentEpisode.duration ? (position / currentEpisode.duration) * 100 : 0;

  const cycleSpeed = () => {
    void hapticSelection();
    const speeds = [0.75, 1, 1.25, 1.5, 1.75, 2];
    const idx = speeds.indexOf(playbackSpeed);
    setSpeed(speeds[(idx + 1) % speeds.length]);
  };

  const handleTogglePlay = () => {
    togglePlay();
  };

  return (
    <>
      <View style={styles.progressWrap}>
        <ProgressBar
          progress={progress}
          height={4}
          onSeek={onSeek}
          accessibilityLabel={`پیشرفت پخش ${currentEpisode.title}`}
          positionSeconds={position}
          durationSeconds={currentEpisode.duration}
        />
        <View style={styles.timeRow}>
          <Text style={styles.time}>{formatTime(currentEpisode.duration)}</Text>
          <Text style={styles.time}>{formatTime(position)}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <ScalePressable
          onPress={toggleBookmark}
          style={styles.sideBtn}
          haptic
          accessibilityLabel={isBookmarked ? 'حذف نشانک' : 'افزودن نشانک'}
          accessibilityRole="button"
        >
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={26}
            color={isBookmarked ? colors.accent : colors.textSecondary}
          />
        </ScalePressable>

        <ScalePressable
          onPress={onSkipBackward}
          style={styles.skipBtn}
          haptic
          accessibilityLabel="۱۵ ثانیه عقب"
          accessibilityRole="button"
        >
          <Ionicons name="play-back" size={28} color={colors.textPrimary} />
          <Text style={styles.skipLabel}>۱۵</Text>
        </ScalePressable>

        <ScalePressable
          style={styles.playBtn}
          onPress={handleTogglePlay}
          haptic
          scaleTo={0.92}
          accessibilityLabel={isPlaying ? 'توقف' : 'پخش'}
          accessibilityRole="button"
        >
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color={colors.textOnPrimary} />
        </ScalePressable>

        <ScalePressable
          onPress={onSkipForward}
          style={styles.skipBtn}
          haptic
          accessibilityLabel="۱۵ ثانیه جلو"
          accessibilityRole="button"
        >
          <Ionicons name="play-forward" size={28} color={colors.textPrimary} />
          <Text style={styles.skipLabel}>۱۵</Text>
        </ScalePressable>

        <ScalePressable
          onPress={cycleSpeed}
          style={styles.speedBtn}
          haptic
          accessibilityLabel={`سرعت پخش ${playbackSpeed} برابر`}
          accessibilityRole="button"
        >
          <Text style={styles.speedText}>{playbackSpeed}x</Text>
        </ScalePressable>
      </View>

      <View style={styles.sleepRow}>
        <Text style={styles.sleepLabel}>تایمر خواب</Text>
        <View style={styles.sleepChips}>
          {SLEEP_TIMER_OPTIONS.slice(0, 4).map((m) => (
            <ScalePressable
              key={m}
              style={styles.sleepChip}
              onPress={() => setSleepTimer(m)}
              haptic
              accessibilityLabel={`تایمر خواب ${m} دقیقه`}
              accessibilityRole="button"
            >
              <Text style={styles.sleepChipText}>{m}د</Text>
            </ScalePressable>
          ))}
          <ScalePressable
            style={styles.sleepChip}
            onPress={() => setSleepTimer(null)}
            haptic
            accessibilityLabel="خاموش کردن تایمر خواب"
            accessibilityRole="button"
          >
            <Text style={styles.sleepChipText}>خاموش</Text>
          </ScalePressable>
        </View>
      </View>
    </>
  );
}
