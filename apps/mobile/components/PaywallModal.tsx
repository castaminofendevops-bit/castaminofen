import { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SUBSCRIPTION_PLANS } from '@castaminofen/shared';
import { apiFetch } from '@/lib/api';
import { usePlayerStore } from '@/store/player';
import { spacing, radius } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useThemedStyles, type ThemeColors } from '@/hooks/useThemedStyles';

type Plan = { id: string; name: string; price: number; currency: string };

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  contentId?: string;
  contentTitle?: string;
  onUnlocked?: () => void;
}

function createStyles(colors: ThemeColors) {
  return {
    backdrop: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'flex-end' as const,
    },
    sheet: {
      backgroundColor: colors.bgSecondary,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      padding: spacing.lg,
      paddingBottom: spacing.xxl,
      maxHeight: '90%' as const,
      borderWidth: 1,
      borderColor: colors.border,
    },
    closeBtn: {
      alignSelf: 'flex-start' as const,
      padding: spacing.sm,
      marginBottom: spacing.sm,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 22,
      fontWeight: '700' as const,
      textAlign: 'right' as const,
    },
    desc: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 22,
      textAlign: 'right' as const,
      marginTop: spacing.sm,
      marginBottom: spacing.lg,
    },
    planCard: {
      backgroundColor: colors.bgCard,
      borderRadius: radius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.accentBorder,
    },
    planHeader: {
      flexDirection: 'row-reverse' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: spacing.md,
    },
    planName: { color: colors.accent, fontWeight: '700' as const, fontSize: 16 },
    planPrice: { color: colors.textPrimary, fontWeight: '600' as const, fontSize: 14 },
    feature: {
      color: colors.textBody,
      fontSize: 13,
      textAlign: 'right' as const,
      marginBottom: spacing.xs,
    },
    primaryBtn: {
      backgroundColor: colors.accent,
      borderRadius: radius.md,
      padding: spacing.md,
      alignItems: 'center' as const,
      marginTop: spacing.md,
      minHeight: 48,
      justifyContent: 'center' as const,
    },
    primaryBtnText: { color: colors.textOnPrimary, fontWeight: '700' as const, fontSize: 16 },
    secondaryBtn: {
      borderRadius: radius.md,
      padding: spacing.md,
      alignItems: 'center' as const,
      marginTop: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 44,
      justifyContent: 'center' as const,
    },
    secondaryBtnText: { color: colors.textPrimary, fontWeight: '600' as const, fontSize: 15 },
    error: { color: colors.error, textAlign: 'center' as const, marginTop: spacing.sm, fontSize: 13 },
    footnote: {
      color: colors.textMuted,
      fontSize: 12,
      textAlign: 'center' as const,
      marginTop: spacing.lg,
      lineHeight: 20,
    },
    loginLink: { color: colors.accent, fontWeight: '600' as const },
  };
}

export function PaywallModal({
  visible,
  onClose,
  contentId,
  contentTitle,
  onUnlocked,
}: PaywallModalProps) {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const accessToken = usePlayerStore((s) => s.accessToken);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;
    setError('');
    void apiFetch<Plan[]>('/payment/plans', {}, accessToken).then((res) => {
      if (res.data) setPlans(res.data);
    });
  }, [visible, accessToken]);

  const subscribe = useCallback(async () => {
    if (!accessToken) {
      onClose();
      router.push('/login');
      return;
    }
    setLoading(true);
    setError('');
    const init = await apiFetch<{ gatewayRef: string }>(
      '/payment/subscribe/PREMIUM',
      { method: 'POST' },
      accessToken,
    );
    if (!init.success || !init.data?.gatewayRef) {
      setError(init.error?.message || 'خطا در شروع پرداخت');
      setLoading(false);
      return;
    }
    const verify = await apiFetch(
      '/payment/verify',
      { method: 'POST', body: JSON.stringify({ gatewayRef: init.data.gatewayRef }) },
      accessToken,
    );
    setLoading(false);
    if (verify.success) {
      onUnlocked?.();
      onClose();
    } else {
      setError(verify.error?.message || 'خطا در تأیید پرداخت');
    }
  }, [accessToken, onClose, onUnlocked, router]);

  const purchaseContent = useCallback(async () => {
    if (!contentId) return;
    if (!accessToken) {
      onClose();
      router.push('/login');
      return;
    }
    setLoading(true);
    setError('');
    const init = await apiFetch<{ gatewayRef: string }>(
      `/payment/purchase/${contentId}`,
      { method: 'POST' },
      accessToken,
    );
    if (!init.success || !init.data?.gatewayRef) {
      setError(init.error?.message || 'خطا در شروع خرید');
      setLoading(false);
      return;
    }
    const verify = await apiFetch(
      '/payment/purchase/verify',
      { method: 'POST', body: JSON.stringify({ gatewayRef: init.data.gatewayRef }) },
      accessToken,
    );
    setLoading(false);
    if (verify.success) {
      onUnlocked?.();
      onClose();
    } else {
      setError(verify.error?.message || 'خطا در تأیید خرید');
    }
  }, [accessToken, contentId, onClose, onUnlocked, router]);

  const premiumPlan = plans.find((p) => p.id === 'PREMIUM');
  const premiumPrice = premiumPlan?.price ?? SUBSCRIPTION_PLANS.PREMIUM.price;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              accessibilityLabel="بستن"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            <Text style={styles.title}>محتوای پریمیوم</Text>
            <Text style={styles.desc}>
              {contentTitle
                ? `برای دسترسی به «${contentTitle}» اشتراک پریمیوم بگیرید یا محتوا را تکی خریداری کنید.`
                : 'برای پخش این محتوا به اشتراک پریمیوم نیاز دارید.'}
            </Text>

            <View style={styles.planCard}>
              <View style={styles.planHeader}>
                <Text style={styles.planName}>پریمیوم</Text>
                <Text style={styles.planPrice}>
                  {premiumPrice.toLocaleString('fa-IR')} تومان / ماه
                </Text>
              </View>
              <Text style={styles.feature}>• دسترسی به همه کتاب‌های صوتی و پادکست‌های پریمیوم</Text>
              <Text style={styles.feature}>• پخش بدون محدودیت</Text>
              <Text style={styles.feature}>• ادامه گوش دادن در همه دستگاه‌ها</Text>

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={subscribe}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel="خرید اشتراک پریمیوم"
              >
                {loading ? (
                  <ActivityIndicator color={colors.textOnPrimary} />
                ) : (
                  <Text style={styles.primaryBtnText}>خرید اشتراک پریمیوم</Text>
                )}
              </TouchableOpacity>
            </View>

            {contentId ? (
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={purchaseContent}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel="خرید تکی این محتوا"
              >
                <Text style={styles.secondaryBtnText}>خرید تکی این محتوا</Text>
              </TouchableOpacity>
            ) : null}

            {error ? (
              <Text style={styles.error} accessibilityRole="alert">
                {error}
              </Text>
            ) : null}

            <Text style={styles.footnote}>
              درگاه پرداخت در نسخه MVP شبیه‌سازی شده است.{' '}
              {!accessToken ? (
                <Text style={styles.loginLink} onPress={() => { onClose(); router.push('/login'); }}>
                  برای ادامه وارد شوید
                </Text>
              ) : (
                'پس از خرید می‌توانید بلافاصله پخش کنید.'
              )}
            </Text>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
