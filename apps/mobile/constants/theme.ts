import { colors, spacing, radius, typography } from '@castaminofen/ui-tokens';

/** Static dark palette — prefer `useAppTheme().colors` for themed UI */
export { colors };

export { spacing, radius, typography };

export const fonts = {
  regular: typography.fontFamilyRegular,
  medium: typography.fontFamilyMedium,
  semibold: typography.fontFamilySemibold,
  bold: typography.fontFamilyBold,
};

export const shadows = {
  card: {
    shadowColor: colors.bgPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  glow: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
};
