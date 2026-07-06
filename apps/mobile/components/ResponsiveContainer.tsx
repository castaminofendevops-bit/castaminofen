import { View, type ViewStyle } from 'react-native';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/** Centers content and caps width on tablet / wide screens. */
export function ResponsiveContainer({ children, style }: ResponsiveContainerProps) {
  const { isTablet, maxContentWidth } = useResponsiveLayout();

  if (!isTablet) {
    return <View style={[{ flex: 1 }, style]}>{children}</View>;
  }

  return (
    <View style={[{ flex: 1, alignItems: 'center' }, style]}>
      <View style={{ flex: 1, width: '100%', maxWidth: maxContentWidth }}>{children}</View>
    </View>
  );
}
