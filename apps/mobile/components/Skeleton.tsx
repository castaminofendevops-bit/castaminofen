import { View, Animated } from 'react-native';
import { radius, spacing } from '@/constants/theme';
import { useThemedStyles, type ThemeColors } from '@/hooks/useThemedStyles';
import { useShimmer } from '@/hooks/useShimmer';

interface SkeletonBoxProps {
  width?: number | `${number}%`;
  height?: number;
  style?: object;
  rounded?: boolean;
}

function createStyles(colors: ThemeColors) {
  return {
    box: {
      backgroundColor: colors.bgElevated,
      overflow: 'hidden' as const,
    },
    grid: {
      flexDirection: 'row-reverse' as const,
      flexWrap: 'wrap' as const,
      gap: spacing.md,
      padding: spacing.md,
    },
    card: {
      width: '47%' as const,
      gap: spacing.xs,
    },
    cover: {
      borderRadius: radius.md,
      marginBottom: spacing.xs,
    },
    list: { paddingHorizontal: spacing.md, gap: spacing.sm },
    row: {
      flexDirection: 'row-reverse' as const,
      alignItems: 'center' as const,
      gap: spacing.md,
      padding: spacing.md,
      backgroundColor: colors.bgCard,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    rowBody: { flex: 1, gap: spacing.xs },
    detailHero: { alignItems: 'center' as const, padding: spacing.lg, gap: spacing.md },
    searchBlock: { padding: spacing.md, gap: spacing.sm },
  };
}

function ShimmerBox({ width = '100%', height = 16, style, rounded }: SkeletonBoxProps) {
  const styles = useThemedStyles(createStyles);
  const opacity = useShimmer();

  return (
    <Animated.View
      style={[
        styles.box,
        { width, height, borderRadius: rounded ? radius.full : radius.sm, opacity },
        style,
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

export function SkeletonBox(props: SkeletonBoxProps) {
  return <ShimmerBox {...props} />;
}

export function ContentGridSkeleton({ count = 4 }: { count?: number }) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.grid} accessibilityLabel="در حال بارگذاری" accessibilityRole="progressbar">
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.card}>
          <ShimmerBox height={140} style={styles.cover} />
          <ShimmerBox height={14} width="80%" />
          <ShimmerBox height={10} width="55%" />
        </View>
      ))}
    </View>
  );
}

export function ListRowSkeleton({ count = 4 }: { count?: number }) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.list} accessibilityLabel="در حال بارگذاری" accessibilityRole="progressbar">
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.row}>
          <ShimmerBox width={48} height={48} rounded />
          <View style={styles.rowBody}>
            <ShimmerBox height={14} width="75%" />
            <ShimmerBox height={10} width="45%" />
          </View>
        </View>
      ))}
    </View>
  );
}

export function ContentDetailSkeleton() {
  const styles = useThemedStyles(createStyles);

  return (
    <View accessibilityLabel="در حال بارگذاری محتوا" accessibilityRole="progressbar">
      <View style={styles.detailHero}>
        <ShimmerBox width={200} height={200} style={{ borderRadius: radius.lg }} />
        <ShimmerBox height={22} width="70%" />
        <ShimmerBox height={14} width="50%" />
      </View>
      <View style={styles.list}>
        {Array.from({ length: 5 }).map((_, i) => (
          <View key={i} style={styles.row}>
            <View style={styles.rowBody}>
              <ShimmerBox height={14} width="85%" />
              <ShimmerBox height={10} width="30%" />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function SearchResultsSkeleton() {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.searchBlock} accessibilityLabel="در حال جستجو" accessibilityRole="progressbar">
      <ShimmerBox height={12} width={80} />
      <ListRowSkeleton count={3} />
    </View>
  );
}
