/**
 * @fileoverview Custom floating pill-shaped bottom tab bar.
 *
 * Renders a centred, rounded tab bar that floats above the content with a
 * drop shadow. The Pro tab is automatically hidden for subscribers so the
 * bar shrinks to fit the remaining tabs.
 *
 * Consumed by the tab navigator in `app/(tabs)/_layout.tsx` via the
 * `tabBar` prop on `<Tabs>`.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Mic, List, Settings, Crown, Bookmark } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './ThemeProvider';
import { usePurchases } from '@/hooks/usePurchases';
import { Colors, FontFamily, FontSize, Radius, ZIndex } from '@/constants/theme';

/** Minimum bar width (px) when 4 or fewer tabs are visible. */
const BAR_WIDTH_SMALL = 260;

/** Bar width (px) when all 5 tabs are visible. */
const BAR_WIDTH_FULL = 320;

/**
 * Returns the Lucide icon component that corresponds to a route name.
 *
 * @param routeName - The Expo Router route file name.
 * @returns The matching icon component (defaults to `Mic`).
 */
function iconForRoute(routeName: string) {
  switch (routeName) {
    case 'index':     return Mic;
    case 'verbs':     return List;
    case 'favorites': return Bookmark;
    case 'settings':  return Settings;
    case 'pro':       return Crown;
    default:          return Mic;
  }
}

/**
 * Floating pill tab bar rendered at the bottom of every tab screen.
 *
 * Hides the "Pro" tab once the user has an active Pro subscription to avoid
 * surfacing the paywall to paying customers.
 *
 * @param state       - Current navigator state (active index, routes).
 * @param descriptors - Route descriptors containing tab options.
 * @param navigation  - Navigation object used to emit press/long-press events.
 */
export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { isProUser, isLoading: purchasesLoading } = usePurchases();
  const { width } = useWindowDimensions();

  const shouldHideProTab = !purchasesLoading && isProUser;

  const visibleCount = state.routes.filter(
    (route) => !(route.name === 'pro' && shouldHideProTab),
  ).length;

  const baseWidth = visibleCount <= 4 ? BAR_WIDTH_SMALL : BAR_WIDTH_FULL;
  const barWidth =
    width >= 1024 ? 640 : width >= 768 ? 460 : baseWidth;

  return (
    <View style={[styles.container, { bottom: insets.bottom + 10 }]}>
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: isDark
              ? Colors.dark.tabBarBackground
              : Colors.light.tabBarBackground,
            width: barWidth,
            borderColor: Colors.light.tabBarBorder,
            shadowColor: isDark
              ? Colors.dark.tabBarShadow
              : Colors.light.tabBarShadow,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          if (route.name === 'pro' && shouldHideProTab) return null;

          const { options } = descriptors[route.key] as any;
          const isFocused = state.index === index;

          const rawLabel =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const label =
            typeof rawLabel === 'function'
              ? rawLabel({
                  focused: isFocused,
                  color: isFocused
                    ? Colors.light.tabIndicator
                    : Colors.light.tabInactive,
                  position: 'below-icon',
                  children: route.name,
                })
              : rawLabel;

          const activeColor = isDark
            ? Colors.dark.primary
            : Colors.light.tabActive;
          const inactiveColor = isDark
            ? Colors.dark.tabInactive
            : Colors.light.tabInactive;
          const iconColor = isFocused ? Colors.light.tabIndicator : inactiveColor;

          const Icon = iconForRoute(route.name);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
            >
              <Icon size={24} color={iconColor} strokeWidth={isFocused ? 2.5 : 2} />
              <Text style={[styles.label, { color: isFocused ? activeColor : inactiveColor }]}>
                {label}
              </Text>
              {isFocused && <View style={styles.indicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: ZIndex.tabBar,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: Radius.pill,
    height: 65,
    paddingHorizontal: 10,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 2,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  label: {
    fontSize: FontSize.xs,
    marginTop: 2,
    fontFamily: FontFamily.manjariRegular,
  },
  indicator: {
    position: 'absolute',
    bottom: 6,
    width: 16,
    height: 3,
    backgroundColor: Colors.light.tabIndicator,
    borderRadius: Radius.xs,
  },
});
