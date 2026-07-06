import { Platform } from 'react-native';

/** Opacity/transform animations on web must use JS driver (no native module). */
export const nativeDriver = Platform.OS !== 'web';
