import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useSegments } from 'expo-router';
import { motion } from '@/constants/motion';
import { nativeDriver } from '@/lib/animated';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface TabFadeWrapperProps {
  /** Route segment for this tab — e.g. `index`, `search`, `library`, `tools` */
  segment: string;
  children: ReactNode;
}

function useTabFocused(segment: string): boolean {
  const segments = useSegments();
  const active = segments[segments.length - 1] || 'index';

  if (segment === 'index') {
    return active === 'index' || active === '(tabs)';
  }

  return active === segment;
}

export function TabFadeWrapper({ segment, children }: TabFadeWrapperProps) {
  const isFocused = useTabFocused(segment);
  const reducedMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isFocused) return;

    if (reducedMotion) {
      opacity.setValue(1);
      return;
    }

    opacity.setValue(0.88);
    const anim = Animated.timing(opacity, {
      toValue: 1,
      duration: motion.duration.fast,
      useNativeDriver: nativeDriver,
    });
    anim.start();
    return () => anim.stop();
  }, [isFocused, reducedMotion, opacity]);

  return <Animated.View style={[styles.fill, { opacity }]}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
