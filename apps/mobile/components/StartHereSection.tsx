'use client';

import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { CoverArt } from '@/components/CoverArt';
import { usePlayerStore } from '@/store/player';
import { apiFetch } from '@/lib/api';
import { spacing, radius } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useThemedStyles, type ThemeColors } from '@/hooks/useThemedStyles';

interface ContentPick {
  id: string;
  title: string;
  type: string;
  coverUrl?: string | null;
  creator: { displayName: string };
}

function createStyles(colors: ThemeColors) {
  return {
    section: { marginTop: spacing.lg, paddingHorizontal: spacing.md },
    heading: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' as const, textAlign: 'right' as const },
    desc: { color: colors.textMuted, fontSize: 14, marginTop: spacing.xs, textAlign: 'right' as const, lineHeight: 22 },
    scroll: { marginTop: spacing.md, gap: spacing.md, flexDirection: 'row-reverse' as const },
    card: {
      width: 140,
      backgroundColor: colors.bgCard,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.sm,
      alignItems: 'center' as const,
    },
    title: { color: colors.textPrimary, fontSize: 13, fontWeight: '600' as const, marginTop: spacing.sm, textAlign: 'center' as const },
    meta: { color: colors.textMuted, fontSize: 11, marginTop: 4, textAlign: 'center' as const },
  };
}

export function StartHereSection({ picks }: { picks: ContentPick[] }) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const accessToken = usePlayerStore((s) => s.accessToken);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      setVisible(false);
      return;
    }
    void Promise.all([
      apiFetch<Array<{ content: { id: string } }>>('/user/library', {}, accessToken),
      apiFetch<unknown[]>('/media/continue', {}, accessToken),
    ]).then(([libRes, contRes]) => {
      setVisible(!libRes.data?.length && !contRes.data?.length);
    });
  }, [accessToken]);

  if (!visible || picks.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>شروع کنید</Text>
      <Text style={styles.desc}>کتابخانه‌تان خالی است — با یکی از این محتواها شروع کنید.</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {picks.slice(0, 4).map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => router.push(`/content/${item.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}، ${item.creator.displayName}`}
          >
            <CoverArt type={item.type} coverUrl={item.coverUrl} title={item.title} size="md" />
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.meta} numberOfLines={1}>{item.creator.displayName}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
