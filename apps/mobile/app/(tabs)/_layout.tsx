import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MiniPlayer } from '@/components/MiniPlayer';
import { PlayerBottomSheet } from '@/components/PlayerBottomSheet';
import { TabletTabRail } from '@/components/TabletTabRail';
import { TabBarButton } from '@/components/TabBarButton';
import { PlayerAudioProvider } from '@/context/PlayerAudioContext';
import { useAppTheme } from '@/context/ThemeContext';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { fonts } from '@/constants/theme';

type IconName = keyof typeof Ionicons.glyphMap;

function TabIcon({ name, color, focused }: { name: IconName; color: string; focused: boolean }) {
  const iconName = (focused ? name : `${String(name)}-outline`) as IconName;
  return <Ionicons name={iconName} size={24} color={color} />;
}

function TabLayoutInner() {
  const { colors } = useAppTheme();
  const { isTablet } = useResponsiveLayout();

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        <Tabs
          screenOptions={{
            tabBarButton: (props) => <TabBarButton {...props} />,
            tabBarStyle: isTablet
              ? { display: 'none' }
              : {
                  backgroundColor: colors.bgSecondary,
                  borderTopColor: colors.border,
                  borderTopWidth: 1,
                  height: 64,
                  paddingBottom: 10,
                  paddingTop: 6,
                },
            tabBarActiveTintColor: colors.accent,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarLabelStyle: { fontSize: 11, fontWeight: '600', fontFamily: fonts.semibold },
            headerShown: false,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'خانه',
              tabBarIcon: ({ color, focused }) => <TabIcon name="home" color={color} focused={focused} />,
            }}
          />
          <Tabs.Screen
            name="search"
            options={{
              title: 'جستجو',
              tabBarIcon: ({ color, focused }) => <TabIcon name="search" color={color} focused={focused} />,
            }}
          />
          <Tabs.Screen
            name="library"
            options={{
              title: 'کتابخانه',
              tabBarIcon: ({ color, focused }) => <TabIcon name="library" color={color} focused={focused} />,
            }}
          />
          <Tabs.Screen
            name="downloads"
            options={{
              href: null,
            }}
          />
          <Tabs.Screen
            name="tools"
            options={{
              title: 'ابزارها',
              tabBarIcon: ({ color, focused }) => <TabIcon name="settings" color={color} focused={focused} />,
            }}
          />
          <Tabs.Screen name="player" options={{ href: null }} />
        </Tabs>
        <View style={[styles.playerOverlay, isTablet ? styles.playerOverlayTablet : styles.playerOverlayPhone]}>
          {isTablet ? <MiniPlayer /> : <PlayerBottomSheet />}
        </View>
      </View>
      {isTablet ? <TabletTabRail /> : null}
    </View>
  );
}

export default function TabLayout() {
  return (
    <PlayerAudioProvider>
      <TabLayoutInner />
    </PlayerAudioProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row-reverse' },
  content: { flex: 1 },
  playerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 10,
  },
  playerOverlayPhone: { bottom: 64 },
  playerOverlayTablet: { bottom: 0 },
});
