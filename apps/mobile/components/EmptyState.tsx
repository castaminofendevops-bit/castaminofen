import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScalePressable } from '@/components/ScalePressable';
import { spacing, radius } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useThemedStyles, type ThemeColors } from '@/hooks/useThemedStyles';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

function createStyles(colors: ThemeColors) {
  return {
    wrap: { alignItems: 'center' as const, padding: spacing.xl, gap: spacing.sm },
    title: { color: colors.textPrimary, fontSize: 17, fontWeight: '700' as const, textAlign: 'center' as const },
    desc: { color: colors.textMuted, fontSize: 14, textAlign: 'center' as const, lineHeight: 22 },
    btn: {
      marginTop: spacing.sm,
      backgroundColor: colors.accent,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      minHeight: 44,
      justifyContent: 'center' as const,
    },
    btnText: { color: colors.textOnPrimary, fontWeight: '700' as const },
  };
}

export function EmptyState({ icon = 'albums-outline', title, description, actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.wrap} accessibilityRole="text" accessibilityLabel={title}>
      <Ionicons name={icon} size={56} color={colors.textMuted} accessibilityElementsHidden importantForAccessibility="no" />
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.desc}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <ScalePressable
          style={styles.btn}
          onPress={onAction}
          haptic
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.btnText}>{actionLabel}</Text>
        </ScalePressable>
      ) : null}
    </View>
  );
}
