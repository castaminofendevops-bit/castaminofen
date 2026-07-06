import { useWindowDimensions } from 'react-native';
import { spacing } from '@/constants/theme';

const TABLET_BREAKPOINT = 768;
const WIDE_BREAKPOINT = 1024;
const MAX_CONTENT_WIDTH = 1200;

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;
  const isWide = width >= WIDE_BREAKPOINT;
  const columns = isWide ? 3 : isTablet ? 2 : 1;
  const categoryItemPercent = isWide ? '12%' : isTablet ? '15%' : '22%';
  const contentPadding = isTablet ? spacing.xl : spacing.md;
  const maxContentWidth = isTablet ? Math.min(width, MAX_CONTENT_WIDTH) : width;
  const splitGap = spacing.lg;

  const isLandscape = width > height;

  return {
    width,
    height,
    isTablet,
    isWide,
    isLandscape,
    columns,
    categoryItemPercent,
    contentPadding,
    maxContentWidth,
    splitGap,
  };
}
