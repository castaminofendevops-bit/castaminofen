import { RefreshControl } from 'react-native';
import { useAppTheme } from '@/context/ThemeContext';
import { hapticLight } from '@/lib/haptics';

interface ThemedRefreshControlProps {
  refreshing: boolean;
  onRefresh: () => void | Promise<void>;
}

export function ThemedRefreshControl({ refreshing, onRefresh }: ThemedRefreshControlProps) {
  const { colors } = useAppTheme();

  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={() => {
        void hapticLight();
        onRefresh();
      }}
      tintColor={colors.accent}
      colors={[colors.accent]}
      progressBackgroundColor={colors.bgCard}
      title={refreshing ? 'در حال به‌روزرسانی…' : undefined}
      titleColor={colors.textMuted}
      accessibilityLabel="کشیدن برای به‌روزرسانی"
    />
  );
}
