import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import { spacing, radius, fonts } from '@/constants/theme';
import { useThemedStyles, type ThemeColors } from '@/hooks/useThemedStyles';

function createStyles(colors: ThemeColors) {
  return {
    safe: { flex: 1, backgroundColor: colors.bgPrimary },
    header: { padding: spacing.md, alignItems: 'flex-end' as const },
    badge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.full,
      backgroundColor: colors.accentMuted,
      borderWidth: 1,
      borderColor: colors.accentBorder,
      marginBottom: spacing.sm,
    },
    badgeText: { color: colors.accent, fontSize: 11, fontWeight: '600' as const, fontFamily: fonts.semibold },
    title: { color: colors.textPrimary, fontSize: 24, fontWeight: '700' as const, fontFamily: fonts.bold },
    subtitle: {
      color: colors.textMuted,
      fontSize: 14,
      marginTop: 4,
      fontFamily: fonts.regular,
      textAlign: 'right' as const,
    },
  };
}

export default function DownloadsScreen() {
  const styles = useThemedStyles(createStyles);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>به‌زودی</Text>
        </View>
        <Text style={styles.title}>دانلودها</Text>
        <Text style={styles.subtitle}>گوش دادن آفلاین در نسخه‌های بعدی فعال می‌شود</Text>
      </View>
      <EmptyState
        title="هنوز دانلودی ندارید"
        description="وقتی قابلیت آفلاین آماده شود، اپیزودهای دانلود‌شده اینجا نمایش داده می‌شوند."
      />
    </SafeAreaView>
  );
}
