import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, radius } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useThemedStyles, type ThemeColors } from '@/hooks/useThemedStyles';

interface AuthScreenLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerHref: '/login' | '/register';
}

function createLayoutStyles(colors: ThemeColors) {
  return {
    safe: { flex: 1, backgroundColor: colors.bgPrimary },
    closeBtn: {
      position: 'absolute' as const,
      top: spacing.lg,
      left: spacing.md,
      zIndex: 10,
      padding: spacing.sm,
    },
    container: { flex: 1, justifyContent: 'center' as const, padding: spacing.lg },
    logoWrap: { alignItems: 'center' as const, marginBottom: spacing.xl },
    brand: { color: colors.textPrimary, fontSize: 28, fontWeight: '700' as const, marginTop: spacing.md },
    tagline: { color: colors.textPrimary, fontSize: 18, fontWeight: '600' as const, marginTop: spacing.sm },
    subtitle: { color: colors.textMuted, fontSize: 14, marginTop: spacing.xs, textAlign: 'center' as const },
    form: { gap: spacing.sm },
    footer: {
      flexDirection: 'row-reverse' as const,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginTop: spacing.xl,
      gap: 4,
    },
    footerText: { color: colors.textMuted, fontSize: 14 },
    footerLink: { color: colors.accent, fontSize: 14, fontWeight: '700' as const },
  };
}

function createAuthFormStyles(colors: ThemeColors) {
  return {
    hint: { color: colors.textMuted, fontSize: 13, textAlign: 'center' as const, marginBottom: spacing.sm },
    input: {
      backgroundColor: colors.bgInput,
      borderRadius: radius.md,
      padding: spacing.md,
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.border,
      fontSize: 15,
    },
    btn: {
      backgroundColor: colors.accent,
      borderRadius: radius.md,
      padding: spacing.md,
      alignItems: 'center' as const,
      marginTop: spacing.sm,
    },
    btnDisabled: { opacity: 0.6 },
    btnText: { color: colors.textOnPrimary, fontWeight: '700' as const, fontSize: 16 },
    error: { color: colors.error, textAlign: 'center' as const, fontSize: 13 },
  };
}

export function useAuthStyles() {
  return useThemedStyles(createAuthFormStyles);
}

export function AuthScreenLayout({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerHref,
}: AuthScreenLayoutProps) {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createLayoutStyles);

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()} accessibilityLabel="بستن" accessibilityRole="button">
        <Ionicons name="close" size={24} color={colors.textSecondary} accessibilityElementsHidden />
      </TouchableOpacity>

      <View style={styles.container}>
        <View style={styles.logoWrap}>
          <Ionicons name="headset" size={48} color={colors.accent} />
          <Text style={styles.brand}>کستامینوفن</Text>
          <Text style={styles.tagline}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.form}>{children}</View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{footerText} </Text>
          <TouchableOpacity
            onPress={() => router.replace(footerHref)}
            accessibilityRole="link"
            accessibilityLabel={footerLinkText}
          >
            <Text style={styles.footerLink}>{footerLinkText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
