import { useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Animated,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePlayerStore } from '@/store/player';
import { CoverArt } from '@/components/CoverArt';
import { ProgressBar } from '@/components/ProgressBar';
import { PlayerControls } from '@/components/PlayerControls';
import { PlayerCoachMark } from '@/components/PlayerCoachMark';
import { ScalePressable } from '@/components/ScalePressable';
import { useAudioEngineContext } from '@/context/PlayerAudioContext';
import { spacing, radius } from '@/constants/theme';
import { motion } from '@/constants/motion';
import { nativeDriver } from '@/lib/animated';
import { useAppTheme } from '@/context/ThemeContext';
import { useThemedStyles, type ThemeColors } from '@/hooks/useThemedStyles';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { hapticLight, hapticSelection } from '@/lib/haptics';

const MINI_HEIGHT = 72;

function createStyles(colors: ThemeColors) {
  return {
    miniRow: {
      flexDirection: 'row-reverse' as const,
      alignItems: 'center' as const,
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      minHeight: MINI_HEIGHT,
    },
    info: { flex: 1, alignItems: 'flex-end' as const },
    title: { color: colors.textPrimary, fontWeight: '600' as const, fontSize: 14 },
    subtitle: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
    playBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.accent,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    sheet: {
      backgroundColor: colors.bgCard,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      overflow: 'hidden' as const,
      shadowColor: colors.bgPrimary,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 16,
    },
    handle: {
      alignSelf: 'center' as const,
      width: 40,
      height: 4,
      borderRadius: radius.sm,
      backgroundColor: colors.border,
      marginTop: spacing.sm,
      marginBottom: spacing.sm,
    },
    expandedHeader: {
      flexDirection: 'row-reverse' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.sm,
    },
    nowPlaying: { color: colors.textMuted, fontSize: 13, fontWeight: '600' as const },
    artworkWrap: { alignItems: 'center' as const, marginVertical: spacing.md },
    expandedTitle: {
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: '700' as const,
      textAlign: 'center' as const,
      paddingHorizontal: spacing.lg,
    },
    expandedSubtitle: {
      color: colors.textMuted,
      fontSize: 14,
      textAlign: 'center' as const,
      marginTop: spacing.xs,
      paddingHorizontal: spacing.lg,
    },
    expandedBody: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  };
}

export function PlayerBottomSheet() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const { height: screenHeight, isLandscape, isTablet } = useResponsiveLayout();
  const { seekTo, skipForward, skipBackward } = useAudioEngineContext();

  const expandedHeight = useMemo(() => {
    const base = isLandscape && !isTablet ? 0.92 : 0.85;
    return Math.min(screenHeight * base, screenHeight - insets.top - spacing.md);
  }, [screenHeight, isLandscape, isTablet, insets.top]);

  const currentEpisode = usePlayerStore((s) => s.currentEpisode);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const position = usePlayerStore((s) => s.position);
  const expanded = usePlayerStore((s) => s.playerSheetExpanded);
  const setExpanded = usePlayerStore((s) => s.setPlayerSheetExpanded);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  const heightAnim = useRef(new Animated.Value(MINI_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const dragStartHeight = useRef(expandedHeight);

  const collapse = useCallback(() => {
    void hapticSelection();
    setExpanded(false);
  }, [setExpanded]);

  const expand = useCallback(() => {
    void hapticLight();
    setExpanded(true);
  }, [setExpanded]);

  const animateHeight = useCallback(
    (target: number, velocity = 0) => {
      if (reducedMotion) {
        heightAnim.setValue(target);
        return;
      }
      Animated.spring(heightAnim, {
        toValue: target,
        useNativeDriver: false,
        bounciness: motion.spring.bounciness,
        speed: motion.spring.speed,
        velocity,
      }).start();
    },
    [heightAnim, reducedMotion],
  );

  useEffect(() => {
    dragStartHeight.current = expandedHeight;
    const target = expanded ? expandedHeight : MINI_HEIGHT;
    if (reducedMotion) {
      heightAnim.setValue(target);
      backdropAnim.setValue(expanded ? 1 : 0);
      return;
    }
    Animated.parallel([
      Animated.spring(heightAnim, {
        toValue: target,
        useNativeDriver: false,
        bounciness: expanded ? motion.spring.bounciness : 0,
        speed: motion.spring.speed,
      }),
      Animated.timing(backdropAnim, {
        toValue: expanded ? 1 : 0,
        duration: motion.duration.medium,
        useNativeDriver: nativeDriver,
      }),
    ]).start();
  }, [expanded, expandedHeight, heightAnim, backdropAnim, reducedMotion]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 6,
        onPanResponderGrant: () => {
          heightAnim.stopAnimation((v) => {
            dragStartHeight.current = v;
          });
        },
        onPanResponderMove: (_, g) => {
          const base = expanded ? dragStartHeight.current : MINI_HEIGHT;
          const next = Math.max(MINI_HEIGHT, Math.min(expandedHeight, base + g.dy));
          heightAnim.setValue(next);
        },
        onPanResponderRelease: (_, g) => {
          const current = dragStartHeight.current + g.dy;
          const shouldExpand = g.vy < -0.4 || (!expanded && g.dy < -40);
          const shouldCollapse = g.vy > 0.4 || g.dy > 60 || current < expandedHeight * 0.55;

          if (shouldExpand && !expanded) {
            expand();
            return;
          }
          if (shouldCollapse && expanded) {
            collapse();
            return;
          }
          if (expanded) {
            animateHeight(expandedHeight, g.vy);
          } else {
            animateHeight(MINI_HEIGHT, g.vy);
          }
        },
      }),
    [expanded, expandedHeight, heightAnim, expand, collapse, animateHeight],
  );

  const handleTogglePlay = useCallback(() => {
    togglePlay();
  }, [togglePlay]);

  if (!currentEpisode) return null;

  const progress = currentEpisode.duration ? (position / currentEpisode.duration) * 100 : 0;
  const backdropOpacity = backdropAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] });

  return (
    <>
      <Animated.View
        pointerEvents={expanded ? 'auto' : 'none'}
        style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.overlay, opacity: backdropOpacity }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={collapse} accessibilityLabel="بستن پخش‌کننده" />
      </Animated.View>

      <PlayerCoachMark visible={expanded} />

      <Animated.View style={[styles.sheet, { height: heightAnim }]}>
        {expanded ? (
          <View style={{ flex: 1 }} {...panResponder.panHandlers}>
            <View style={styles.handle} accessibilityElementsHidden importantForAccessibility="no" />
            <View style={styles.expandedHeader}>
              <ScalePressable
                onPress={collapse}
                hitSlop={12}
                haptic
                accessibilityLabel="بستن پخش‌کننده"
                accessibilityRole="button"
                style={{ width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }}
              >
                <Ionicons name="chevron-down" size={28} color={colors.textPrimary} accessibilityElementsHidden />
              </ScalePressable>
              <Text style={styles.nowPlaying}>در حال پخش</Text>
              <View style={{ width: 44 }} />
            </View>
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              <View style={styles.artworkWrap}>
                <CoverArt
                  type={currentEpisode.contentType || 'PODCAST'}
                  coverUrl={currentEpisode.coverUrl}
                  title={currentEpisode.contentTitle}
                  size={isLandscape && !isTablet ? 'md' : 'lg'}
                  glow
                />
              </View>
              <Text style={styles.expandedTitle} numberOfLines={2}>
                {currentEpisode.title}
              </Text>
              <Text style={styles.expandedSubtitle} numberOfLines={1}>
                {currentEpisode.contentTitle}
              </Text>
              <View style={[styles.expandedBody, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
                <PlayerControls
                  onSeek={seekTo}
                  onSkipForward={() => void skipForward()}
                  onSkipBackward={() => void skipBackward()}
                />
              </View>
            </ScrollView>
          </View>
        ) : null}

        <View {...(!expanded ? panResponder.panHandlers : {})}>
          <ProgressBar
            progress={progress}
            height={2}
            accessibilityLabel={`پیشرفت ${currentEpisode.title}`}
            positionSeconds={position}
            durationSeconds={currentEpisode.duration}
          />
          <View style={styles.miniRow}>
            <ScalePressable
              style={styles.playBtn}
              haptic
              onPress={handleTogglePlay}
              accessibilityRole="button"
              accessibilityLabel={isPlaying ? 'توقف پخش' : 'شروع پخش'}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={22}
                color={colors.textOnPrimary}
                accessibilityElementsHidden
              />
            </ScalePressable>
            <Pressable
              style={styles.info}
              onPress={expand}
              accessibilityRole="button"
              accessibilityLabel={`${currentEpisode.title}، ${currentEpisode.contentTitle}`}
            >
              <Text style={styles.title} numberOfLines={1}>
                {currentEpisode.title}
              </Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {currentEpisode.contentTitle}
              </Text>
            </Pressable>
            <Pressable onPress={expand} accessibilityRole="imagebutton" accessibilityLabel="باز کردن پخش‌کننده">
              <CoverArt
                type={currentEpisode.contentType || 'PODCAST'}
                coverUrl={currentEpisode.coverUrl}
                title={currentEpisode.contentTitle}
                size="sm"
              />
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </>
  );
}
