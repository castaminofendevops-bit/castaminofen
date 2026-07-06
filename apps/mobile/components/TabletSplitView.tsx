import { View, type ViewStyle } from 'react-native';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

interface TabletSplitViewProps {
  master: React.ReactNode;
  detail: React.ReactNode;
  masterStyle?: ViewStyle;
  detailStyle?: ViewStyle;
  /** Master column flex ratio on tablet (default 0.42). */
  masterFlex?: number;
}

/** Two-column master-detail on tablet; stacked on phone. */
export function TabletSplitView({
  master,
  detail,
  masterStyle,
  detailStyle,
  masterFlex = 0.42,
}: TabletSplitViewProps) {
  const { isTablet, splitGap } = useResponsiveLayout();

  if (!isTablet) {
    return (
      <View style={{ flex: 1 }}>
        {master}
        {detail}
      </View>
    );
  }

  return (
    <View style={{ flex: 1, flexDirection: 'row-reverse', gap: splitGap, paddingHorizontal: splitGap }}>
      <View style={[{ flex: masterFlex }, masterStyle]}>{master}</View>
      <View style={[{ flex: 1 }, detailStyle]}>{detail}</View>
    </View>
  );
}
