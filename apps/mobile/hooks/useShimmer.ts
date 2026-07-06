import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { motion } from '@/constants/motion';
import { nativeDriver } from '@/lib/animated';

/** Subtle opacity pulse for skeleton placeholders — respects reduced motion. */
export function useShimmer() {
  const reducedMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    if (reducedMotion) {
      opacity.setValue(0.55);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: motion.duration.slow,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: nativeDriver,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: motion.duration.slow,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: nativeDriver,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, reducedMotion]);

  return opacity;
}
