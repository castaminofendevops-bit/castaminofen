import { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ONBOARDING_SLIDES,
  isOnboardingComplete,
  markOnboardingComplete,
} from '@/lib/onboarding';
import { spacing, radius, fonts } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useThemedStyles, type ThemeColors } from '@/hooks/useThemedStyles';

type IconName = keyof typeof Ionicons.glyphMap;

function createStyles(colors: ThemeColors) {
  return {
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' as const },
    sheet: {
      backgroundColor: colors.bgCard,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
    },
    dots: { flexDirection: 'row-reverse' as const, justifyContent: 'center' as const, gap: spacing.sm, marginBottom: spacing.lg },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
    dotActive: { backgroundColor: colors.accent, width: 24 },
    iconWrap: {
      alignSelf: 'center' as const,
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: colors.accentMuted,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginBottom: spacing.lg,
    },
    title: { color: colors.textPrimary, fontSize: 22, fontWeight: '700' as const, textAlign: 'center' as const, fontFamily: fonts.bold },
    desc: { color: colors.textSecondary, fontSize: 15, lineHeight: 24, textAlign: 'center' as const, marginTop: spacing.sm, fontFamily: fonts.regular },
    actions: { flexDirection: 'row-reverse' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, marginTop: spacing.xl },
    skipBtn: { padding: spacing.sm },
    skipText: { color: colors.textMuted, fontSize: 14, fontFamily: fonts.medium },
    nextBtn: {
      backgroundColor: colors.accent,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: radius.full,
      minWidth: 120,
      alignItems: 'center' as const,
    },
    nextText: { color: colors.textOnPrimary, fontWeight: '700' as const, fontSize: 15, fontFamily: fonts.semibold },
  };
}

export function OnboardingModal() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    void isOnboardingComplete().then((done) => {
      if (!done) setVisible(true);
    });
  }, []);

  const finish = async () => {
    await markOnboardingComplete();
    setVisible(false);
  };

  const slide = ONBOARDING_SLIDES[step];
  const isLast = step === ONBOARDING_SLIDES.length - 1;

  return (
    <Modal visible={visible} animationType="slide" transparent accessibilityViewIsModal>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg), minHeight: height * 0.42 }]}>
          <View style={styles.dots}>
            {ONBOARDING_SLIDES.map((_, i) => (
              <View key={i} style={[styles.dot, i === step && styles.dotActive]} accessibilityElementsHidden />
            ))}
          </View>

          <View style={styles.iconWrap}>
            <Ionicons name={slide.icon as IconName} size={44} color={colors.accent} accessibilityElementsHidden />
          </View>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.desc}>{slide.description}</Text>

          <View style={styles.actions}>
            <TouchableOpacity onPress={() => void finish()} style={styles.skipBtn} accessibilityRole="button" accessibilityLabel="رد کردن راهنما">
              <Text style={styles.skipText}>رد کردن</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => (isLast ? void finish() : setStep((s) => s + 1))}
              style={styles.nextBtn}
              accessibilityRole="button"
              accessibilityLabel={isLast ? 'شروع استفاده' : 'مرحله بعد'}
            >
              <Text style={styles.nextText}>{isLast ? 'شروع کنید' : 'بعدی'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
