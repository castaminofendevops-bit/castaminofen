import { useRef } from 'react';
import { View, Pressable, LayoutChangeEvent, type AccessibilityActionEvent } from 'react-native';
import { formatPercentA11y, formatPlaybackA11y } from '@/lib/a11y';
import { useAppTheme } from '@/context/ThemeContext';
import { useThemedStyles, type ThemeColors } from '@/hooks/useThemedStyles';

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
  onSeek?: (percent: number) => void;
  accessibilityLabel?: string;
  positionSeconds?: number;
  durationSeconds?: number;
}

const SEEK_STEP = 0.05;

function createStyles(colors: ThemeColors) {
  return {
    pressable: { width: '100%' as const, minHeight: 44, justifyContent: 'center' as const },
    track: { width: '100%' as const, backgroundColor: colors.border, overflow: 'hidden' as const },
    fill: { height: '100%' as const },
  };
}

export function ProgressBar({
  progress,
  color,
  height = 4,
  onSeek,
  accessibilityLabel = 'پیشرفت پخش',
  positionSeconds,
  durationSeconds,
}: ProgressBarProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const barColor = color ?? colors.accent;
  const barWidth = useRef(0);
  const pct = Math.min(100, Math.max(0, progress));

  const valueText =
    positionSeconds !== undefined
      ? formatPlaybackA11y(positionSeconds, durationSeconds)
      : formatPercentA11y(pct);

  const a11yValue = {
    min: 0,
    max: durationSeconds && durationSeconds > 0 ? Math.round(durationSeconds) : 100,
    now: positionSeconds !== undefined ? Math.round(positionSeconds) : Math.round(pct),
    text: valueText,
  };

  const handleLayout = (e: LayoutChangeEvent) => {
    barWidth.current = e.nativeEvent.layout.width;
  };

  const handlePress = (locationX: number) => {
    if (!onSeek || barWidth.current <= 0) return;
    const fromRight = 1 - locationX / barWidth.current;
    onSeek(Math.min(1, Math.max(0, fromRight)));
  };

  const handleA11yAction = (event: AccessibilityActionEvent) => {
    if (!onSeek) return;
    const current = pct / 100;
    if (event.nativeEvent.actionName === 'increment') {
      onSeek(Math.min(1, current + SEEK_STEP));
    } else if (event.nativeEvent.actionName === 'decrement') {
      onSeek(Math.max(0, current - SEEK_STEP));
    }
  };

  const track = (
    <View
      style={[styles.track, { height, borderRadius: height / 2 }]}
      importantForAccessibility="no-hide-descendants"
    >
      <View
        style={[styles.fill, { width: `${pct}%`, backgroundColor: barColor, borderRadius: height / 2 }]}
      />
    </View>
  );

  if (!onSeek) {
    return (
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={a11yValue}
      >
        {track}
      </View>
    );
  }

  return (
    <Pressable
      onLayout={handleLayout}
      onPress={(e) => handlePress(e.nativeEvent.locationX)}
      style={styles.pressable}
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="برای پرش در پخش، روی نوار ضربه بزنید یا با ژست بالا و پایین جابجا کنید"
      accessibilityValue={a11yValue}
      accessibilityActions={[
        { name: 'increment', label: '۱۵ ثانیه جلو' },
        { name: 'decrement', label: '۱۵ ثانیه عقب' },
      ]}
      onAccessibilityAction={handleA11yAction}
    >
      {track}
    </Pressable>
  );
}
