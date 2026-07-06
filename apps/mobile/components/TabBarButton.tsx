import { Pressable, type PressableProps } from 'react-native';
import { hapticSelection } from '@/lib/haptics';

export function TabBarButton({ children, onPress, style, ...rest }: PressableProps) {
  return (
    <Pressable
      {...rest}
      style={style}
      onPress={(e) => {
        void hapticSelection();
        onPress?.(e);
      }}
    >
      {children}
    </Pressable>
  );
}
