import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ResizeMode, Video } from 'expo-av';
import { spacing, radius } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useThemedStyles, type ThemeColors } from '@/hooks/useThemedStyles';

function createStyles(colors: ThemeColors) {
  return {
    safe: { flex: 1, backgroundColor: colors.bgPrimary },
    videoWrap: { width: '100%' as const, aspectRatio: 16 / 9, backgroundColor: colors.videoBg },
    video: { width: '100%' as const, height: '100%' as const },
    videoPlaceholder: { flex: 1, justifyContent: 'center' as const, alignItems: 'center' as const },
    info: { padding: spacing.md },
    title: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' as const, textAlign: 'right' as const },
    channel: { color: colors.textMuted, fontSize: 14, marginTop: 6, textAlign: 'right' as const },
    actions: {
      flexDirection: 'row-reverse' as const,
      justifyContent: 'space-around' as const,
      marginTop: spacing.lg,
      paddingVertical: spacing.md,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    actionBtn: { alignItems: 'center' as const, gap: 4 },
    actionLabel: { color: colors.textMuted, fontSize: 11 },
    sectionTitle: {
      color: colors.textPrimary,
      fontWeight: '700' as const,
      fontSize: 16,
      padding: spacing.md,
      textAlign: 'right' as const,
    },
    epPlaceholder: {
      margin: spacing.md,
      padding: spacing.xl,
      backgroundColor: colors.bgCard,
      borderRadius: radius.md,
      alignItems: 'center' as const,
    },
    epPlaceholderText: { color: colors.textMuted },
    backBtn: {
      flexDirection: 'row-reverse' as const,
      alignItems: 'center' as const,
      gap: spacing.sm,
      padding: spacing.md,
      justifyContent: 'center' as const,
    },
    backText: { color: colors.accent, fontWeight: '600' as const },
  };
}

function ActionBtn({
  icon,
  label,
  active,
  onPress,
  colors,
  styles,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress?: () => void;
  colors: ThemeColors;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <Ionicons name={icon} size={22} color={active ? colors.accent : colors.textSecondary} />
      <Text style={[styles.actionLabel, active && { color: colors.accent }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function VideoPlayerScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const { url, title, contentTitle } = useLocalSearchParams<{
    id: string;
    url: string;
    title: string;
    contentTitle: string;
  }>();
  const [liked, setLiked] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.videoWrap}>
          {url ? (
            <Video
              source={{ uri: url }}
              style={styles.video}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
            />
          ) : (
            <View style={styles.videoPlaceholder}>
              <Ionicons name="videocam" size={48} color={colors.textMuted} />
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.channel}>{contentTitle}</Text>

          <View style={styles.actions}>
            <ActionBtn icon="share-outline" label="اشتراک" colors={colors} styles={styles} />
            <ActionBtn icon="download-outline" label="دانلود" colors={colors} styles={styles} />
            <ActionBtn icon="chatbubble-outline" label="نظر" colors={colors} styles={styles} />
            <ActionBtn
              icon={liked ? 'heart' : 'heart-outline'}
              label="پسندیدن"
              active={liked}
              onPress={() => setLiked(!liked)}
              colors={colors}
              styles={styles}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>اپیزودهای دیگر</Text>
        <View style={styles.epPlaceholder}>
          <Text style={styles.epPlaceholderText}>اپیزودهای بیشتر به‌زودی</Text>
        </View>

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.accent} />
          <Text style={styles.backText}>بازگشت</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
