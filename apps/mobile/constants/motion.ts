/** Motion timing — use with Animated API (no Reanimated dep) */
export const motion = {
  duration: {
    fast: 160,
    medium: 240,
    slow: 320,
  },
  spring: {
    bounciness: 5,
    speed: 14,
  },
  press: {
    scale: 0.94,
    duration: 100,
  },
} as const;
