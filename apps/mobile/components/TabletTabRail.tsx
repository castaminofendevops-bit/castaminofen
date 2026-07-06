import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/ThemeContext';
import { useThemedStyles, type ThemeColors } from '@/hooks/useThemedStyles';
import { spacing, radius, fonts } from '@/constants/theme';
import { hapticSelection } from '@/lib/haptics';

type IconName = keyof typeof Ionicons.glyphMap;

const TABS: Array<{ segment: string; href: string; icon: IconName; label: string }> = [
  { segment: 'index', href: '/(tabs)', icon: 'home', label: 'خانه' },
  { segment: 'search', href: '/(tabs)/search', icon: 'search', label: 'جستجو' },
  { segment: 'library', href: '/(tabs)/library', icon: 'library', label: 'کتابخانه' },
  { segment: 'tools', href: '/(tabs)/tools', icon: 'settings', label: 'ابزارها' },
];

function createStyles(colors: ThemeColors) {
  return {
    rail: {
      width: 88,
      borderLeftWidth: 1,
      borderLeftColor: colors.border,
      backgroundColor: colors.bgSecondary,
      paddingTop: spacing.md,
      paddingHorizontal: spacing.xs,
      gap: spacing.xs,
    },
    tab: {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      minHeight: 64,
      gap: 4,
    },
    tabActive: {
      backgroundColor: colors.accentMuted,
    },
    label: {
      fontSize: 10,
      fontFamily: fonts.semibold,
      color: colors.textMuted,
      textAlign: 'center' as const,
    },
    labelActive: {
      color: colors.accent,
      fontWeight: '700' as const,
    },
  };
}

export function TabletTabRail() {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const active = segments[segments.length - 1] || 'index';

  return (
    <View style={[styles.rail, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
      {TABS.map((tab) => {
        const focused = active === tab.segment;
        const iconName = (focused ? tab.icon : `${tab.icon}-outline`) as IconName;
        return (
          <TouchableOpacity
            key={tab.segment}
            style={[styles.tab, focused && styles.tabActive]}
            onPress={() => {
              void hapticSelection();
              router.push(tab.href as never);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={tab.label}
          >
            <Ionicons name={iconName} size={24} color={focused ? colors.accent : colors.textMuted} />
            <Text style={[styles.label, focused && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
