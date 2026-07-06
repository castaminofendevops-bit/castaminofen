/** Castaminofen brand color system — sync with tokens.css */

export const brand = {
  primary: '#776CFE',
  accentGreen: '#00EA99',
  accentPurple: '#A03CFF',
  secondaryOlive: '#99BE7D',
} as const;

export type ThemeMode = 'light' | 'dark';

const dark = {
  bgMain: '#0F111A',
  bgContent: '#1A1D29',
  bgSurfaceAlt: '#232735',
  bgSurfaceHover: '#2D3748',
  bgSurfaceActive: '#4A5568',
  textPrimary: '#F3F4F6',
  textSecondary: '#9CA3AF',
  textBody: '#D1D5DB',
} as const;

const light = {
  bgMain: '#F9FAFB',
  bgContent: '#FFFFFF',
  bgSurfaceAlt: '#F3F4F6',
  bgSurfaceHover: '#F3F4F6',
  bgSurfaceActive: '#E5E7EB',
  textPrimary: '#111827',
  textSecondary: '#4B5563',
  textBody: '#4B5563',
} as const;

export const themes = { dark, light } as const;

/** Flat token map for React Native (default: dark) */
export const colors = {
  brandPrimary: brand.primary,
  brandAccentGreen: brand.accentGreen,
  brandAccentPurple: brand.accentPurple,
  brandSecondaryOlive: brand.secondaryOlive,

  bgPrimary: dark.bgMain,
  bgSecondary: dark.bgContent,
  bgElevated: dark.bgSurfaceAlt,
  bgCard: dark.bgContent,
  bgInput: dark.bgSurfaceAlt,
  bgSurfaceHover: dark.bgSurfaceHover,
  bgSurfaceActive: dark.bgSurfaceActive,

  accent: brand.primary,
  accentHover: brand.accentPurple,
  accentLight: brand.accentPurple,
  accentMuted: 'rgba(119, 108, 254, 0.15)',
  accentBorder: 'rgba(119, 108, 254, 0.35)',

  secondary: brand.secondaryOlive,
  secondaryHover: brand.accentGreen,

  textPrimary: dark.textPrimary,
  textSecondary: dark.textSecondary,
  textMuted: dark.textSecondary,
  textBody: dark.textBody,
  textOnPrimary: dark.textPrimary,
  textOnAccent: dark.bgMain,

  border: dark.bgSurfaceHover,
  borderLight: dark.bgSurfaceActive,

  success: brand.accentGreen,
  error: brand.accentPurple,
  videoProgress: brand.secondaryOlive,
  overlay: 'rgba(15, 17, 26, 0.72)',
  videoBg: dark.bgMain,
} as const;

export function getThemeColors(mode: ThemeMode) {
  const surface = mode === 'dark' ? dark : light;
  const linkHover = mode === 'dark' ? brand.accentGreen : brand.primary;
  const linkActive = mode === 'dark' ? brand.accentGreen : brand.primary;

  return {
    ...colors,
    bgPrimary: surface.bgMain,
    bgSecondary: surface.bgContent,
    bgElevated: surface.bgSurfaceAlt,
    bgCard: surface.bgContent,
    bgInput: surface.bgSurfaceAlt,
    bgSurfaceHover: surface.bgSurfaceHover,
    bgSurfaceActive: surface.bgSurfaceActive,
    textPrimary: surface.textPrimary,
    textSecondary: surface.textSecondary,
    textMuted: surface.textSecondary,
    textBody: surface.textBody,
    textOnPrimary: surface.textPrimary,
    textOnAccent: mode === 'dark' ? surface.bgMain : surface.bgContent,
    border: surface.bgSurfaceHover,
    borderLight: surface.bgSurfaceActive,
    accentMuted:
      mode === 'dark' ? 'rgba(119, 108, 254, 0.15)' : 'rgba(119, 108, 254, 0.12)',
    overlay: mode === 'dark' ? 'rgba(15, 17, 26, 0.72)' : 'rgba(17, 24, 39, 0.45)',
    videoBg: surface.bgMain,
    linkHover,
    linkActive,
  };
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export const typography = {
  fontFamily: 'Vazirmatn',
  fontFamilyRegular: 'Vazirmatn_400Regular',
  fontFamilyMedium: 'Vazirmatn_500Medium',
  fontFamilySemibold: 'Vazirmatn_600SemiBold',
  fontFamilyBold: 'Vazirmatn_700Bold',
} as const;

export const layout = {
  playerHeight: 80,
  navHeight: 64,
  touchTarget: 44,
} as const;
