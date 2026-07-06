import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { apiFetch } from '@/lib/api';
import { CoverArt } from '@/components/CoverArt';
import { SectionHeader } from '@/components/SectionHeader';
import { spacing, radius } from '@/constants/theme';
import { useThemedStyles, type ThemeColors } from '@/hooks/useThemedStyles';

interface ContentItem {
  id: string;
  title: string;
  type: string;
  coverUrl?: string | null;
  episodeCount: number;
  isPremium: boolean;
  creator: { displayName: string };
}

function createStyles(colors: ThemeColors) {
  return {
    section: { marginTop: spacing.lg },
    scroll: { paddingHorizontal: spacing.md, gap: spacing.md, flexDirection: 'row-reverse' as const },
    card: {
      width: 150,
      backgroundColor: colors.bgCard,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.sm,
    },
    title: { color: colors.textPrimary, fontSize: 13, fontWeight: '600' as const, marginTop: spacing.sm, textAlign: 'right' as const },
    meta: { color: colors.textMuted, fontSize: 11, marginTop: 4, textAlign: 'right' as const },
  };
}

export function TrendingSection() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const [items, setItems] = useState<ContentItem[]>([]);

  useEffect(() => {
    void apiFetch<ContentItem[]>('/trending').then((res) => {
      if (res.data) setItems(res.data);
    });
  }, []);

  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionHeader title="ترند" actionLabel="جستجو" onAction={() => router.push('/(tabs)/search')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {items.map((item) => (
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
