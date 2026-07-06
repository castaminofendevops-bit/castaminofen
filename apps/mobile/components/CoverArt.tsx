import { useState } from 'react';
import { View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { radius } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useThemedStyles, type ThemeColors } from '@/hooks/useThemedStyles';

type IconName = keyof typeof Ionicons.glyphMap;

const TYPE_ICONS: Record<string, IconName> = {
  PODCAST: 'mic',
  AUDIOBOOK: 'book',
  VIDEO: 'videocam',
};

interface CoverArtProps {
  type?: string;
  coverUrl?: string | null;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
}

const SIZES = { sm: 56, md: 80, lg: 160, xl: 220 };

function createStyles(colors: ThemeColors) {
  return {
    wrap: {
      backgroundColor: colors.bgElevated,
      borderWidth: 1,
      borderColor: colors.accentBorder,
      overflow: 'hidden' as const,
    },
    glow: {
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 10,
    },
    image: {
      width: '100%' as const,
      height: '100%' as const,
    },
    inner: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      backgroundColor: colors.bgCard,
    },
  };
}

export function CoverArt({
  type = 'AUDIOBOOK',
  coverUrl,
  title,
  size = 'md',
  glow = false,
}: CoverArtProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const reducedMotion = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const dim = SIZES[size];
  const iconSize = size === 'xl' ? 56 : size === 'lg' ? 44 : size === 'md' ? 32 : 24;
  const iconName = TYPE_ICONS[type] || 'musical-notes';
  const borderRadius = size === 'xl' ? radius.lg : radius.md;
  const showImage = Boolean(coverUrl) && !failed;
  const showGlow = glow && !reducedMotion;

  return (
    <View
      style={[
        styles.wrap,
        { width: dim, height: dim, borderRadius },
        showGlow && styles.glow,
      ]}
      accessibilityLabel={title ? `کاور ${title}` : `کاور ${type}`}
    >
      {showImage ? (
        <Image
          source={{ uri: coverUrl! }}
          style={[styles.image, { borderRadius: borderRadius - 2 }]}
          resizeMode="cover"
          onError={() => setFailed(true)}
          accessibilityIgnoresInvertColors
          progressiveRenderingEnabled
        />
      ) : (
        <View style={[styles.inner, { borderRadius: borderRadius - 2 }]}>
          <Ionicons name={iconName} size={iconSize} color={colors.accentLight} />
        </View>
      )}
    </View>
  );
}
