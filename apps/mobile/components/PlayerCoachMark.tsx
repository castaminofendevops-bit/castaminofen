import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as storage from '@/lib/storage';
import { spacing, radius, fonts } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useThemedStyles, type ThemeColors } from '@/hooks/useThemedStyles';

const STORAGE_KEY = 'player_coach_v1_done';

export async function isPlayerCoachDone(): Promise<boolean> {
  return (await storage.getItem(STORAGE_KEY)) === '1';
}

export async function markPlayerCoachDone(): Promise<void> {
  await storage.setItem(STORAGE_KEY, '1');
}

function createStyles(colors: ThemeColors) {
  return {
    wrap: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'flex-end' as const,
      paddingBottom: spacing.xxl * 2,
      paddingHorizontal: spacing.lg,
      zIndex: 50,
    },
    card: {
      backgroundColor: colors.bgElevated,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.accentBorder,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    row: {
      flexDirection: 'row-reverse' as const,
      alignItems: 'center' as const,
      gap: spacing.sm,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '700' as const,
      fontFamily: fonts.bold,
      textAlign: 'right' as const,
    },
    body: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 22,
      fontFamily: fonts.regular,
      textAlign: 'right' as const,
    },
    tip: {
      flexDirection: 'row-reverse' as const,
      alignItems: 'center' as const,
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    tipText: { color: colors.textMuted, fontSize: 13, flex: 1, textAlign: 'right' as const },
    btn: {
      alignSelf: 'flex-start' as const,
      marginTop: spacing.md,
      backgroundColor: colors.accent,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
    },
    btnText: { color: colors.textOnPrimary, fontWeight: '700' as const, fontFamily: fonts.semibold },
  };
}

export function PlayerCoachMark({ visible }: { visible: boolean }) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShow(false);
      return;
    }
    void isPlayerCoachDone().then((done) => {
      if (!done) setShow(true);
    });
  }, [visible]);

  if (!show) return null;

  const dismiss = () => {
    void markPlayerCoachDone();
    setShow(false);
  };

  return (
    <View style={styles.wrap} pointerEvents="box-none" accessibilityViewIsModal>
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="information-circle" size={22} color={colors.accent} accessibilityElementsHidden />
          <Text style={styles.title}>کنترل‌های پخش</Text>
        </View>
        <Text style={styles.body}>برای بستن، sheet را به پایین بکشید یا روی پس‌زمینه ضربه بزنید.</Text>
        <View style={styles.tip}>
          <Ionicons name="play" size={18} color={colors.textMuted} accessibilityElementsHidden />
          <Text style={styles.tipText}>دکمه مرکزی: پخش / توقف</Text>
        </View>
        <View style={styles.tip}>
          <Ionicons name="play-forward" size={18} color={colors.textMuted} accessibilityElementsHidden />
          <Text style={styles.tipText}>±۱۵ ثانیه: پرش در اپیزود</Text>
        </View>
        <TouchableOpacity style={styles.btn} onPress={dismiss} accessibilityRole="button" accessibilityLabel="متوجه شدم">
          <Text style={styles.btnText}>متوجه شدم</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
