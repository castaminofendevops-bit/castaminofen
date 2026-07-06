import { useRef, type ReactNode } from 'react';
import {
  Animated,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { motion } from '@/constants/motion';
import { nativeDriver } from '@/lib/animated';
import { hapticLight } from '@/lib/haptics';

type ScalePressableProps = PressableProps & {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
  haptic?: boolean;
  scaleTo?: number;
};

export function ScalePressable({
  children,
  style,
  haptic = false,
  scaleTo = motion.press.scale,
  onPressIn,
  onPressOut,
  onPress,
  disabled,
  ...rest
}: ScalePressableProps) {
  const reducedMotion = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    if (reducedMotion) {
      scale.setValue(value);
      return;
    }
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: nativeDriver,
      bounciness: value < 1 ? 0 : motion.spring.bounciness,
      speed: motion.spring.speed,
    }).start();
  };

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      onPressIn={(e) => {
        animateTo(scaleTo);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        animateTo(1);
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic) void hapticLight();
        onPress?.(e);
      }}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
