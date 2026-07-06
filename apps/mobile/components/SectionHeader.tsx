import { View, Text, TouchableOpacity } from 'react-native';
import { spacing } from '@/constants/theme';
import { useThemedStyles, type ThemeColors } from '@/hooks/useThemedStyles';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

function createStyles(colors: ThemeColors) {
  return {
    row: {
      flexDirection: 'row-reverse' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.sm,
    },
    title: { color: colors.textPrimary, fontSize: 17, fontWeight: '700' as const, textAlign: 'right' as const },
    action: { color: colors.accent, fontSize: 13, fontWeight: '600' as const },
  };
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity onPress={onAction} accessibilityRole="button" accessibilityLabel={actionLabel}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
