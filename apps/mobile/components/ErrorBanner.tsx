import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, radius, fonts } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useThemedStyles, type ThemeColors } from '@/hooks/useThemedStyles';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

function createStyles(colors: ThemeColors) {
  return {
    wrap: {
      flexDirection: 'row-reverse' as const,
      alignItems: 'center' as const,
      gap: spacing.sm,
      margin: spacing.md,
      padding: spacing.md,
      backgroundColor: colors.error + '22',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.error + '55',
    },
    text: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: 14,
      textAlign: 'right' as const,
      fontFamily: fonts.regular,
    },
    retry: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.bgCard,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    retryText: {
      color: colors.accent,
      fontWeight: '600' as const,
      fontSize: 13,
      fontFamily: fonts.semibold,
    },
  };
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.wrap} accessibilityRole="alert" accessibilityLabel={message}>
      <Ionicons name="warning-outline" size={20} color={colors.error} />
      <Text style={styles.text}>{message}</Text>
      {onRetry ? (
        <TouchableOpacity style={styles.retry} onPress={onRetry} accessibilityRole="button" accessibilityLabel="تلاش مجدد">
          <Text style={styles.retryText}>تلاش مجدد</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
