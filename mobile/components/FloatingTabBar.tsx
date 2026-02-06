import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Mic, List, Settings, Crown, Bookmark } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './ThemeProvider';


export function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  // Count visible routes to shrink the bar
  const visibleRoutesCount = state.routes.filter((route) => {
    const { options } = descriptors[route.key] as any;
    return options.href !== null;
  }).length;

  const barWidth = visibleRoutesCount <= 4 ? 260 : 320;

  return (
    <View style={[styles.container, { bottom: insets.bottom + 10 }]}>
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: isDark ? theme.colors.surface : '#FFFFFF',
            width: barWidth,
            borderColor: '#F3703E',
            shadowColor: isDark ? '#000000' : '#F3703E',
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key] as any;
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;

          const labelToRender =
            typeof label === 'function'
              ? label({
                  focused: isFocused,
                  color: isFocused ? '#CE3B3B' : '#9ca3af',
                  position: 'below-icon',
                  children: route.name,
                })
              : label;

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
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          // Skip rendering if href is null (for Pro tab logic)
          if (options.href === null) {
            return null;
          }

          let Icon = Mic;
          if (route.name === 'index') Icon = Mic;
          else if (route.name === 'verbs') Icon = List;
          else if (route.name === 'favorites') Icon = Bookmark;
          else if (route.name === 'settings') Icon = Settings;
          else if (route.name === 'pro') Icon = Crown;

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
              <Icon
                size={24}
                color={isFocused ? '#CE3B3B' : '#9ca3af'}
                strokeWidth={isFocused ? 2.5 : 2}
              />
              <Text
                style={[
                  styles.label,
                  { color: isFocused ? (isDark ? '#F3703E' : '#333') : '#9ca3af' },
                ]}
              >
                {labelToRender}
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
    zIndex: 100,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 25,
    height: 65,
    paddingHorizontal: 10,
    // Shadow for iOS
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    // Elevation for Android
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
    fontSize: 10,
    marginTop: 2,
    fontFamily: 'Manjari-Regular',
  },
  indicator: {
    position: 'absolute',
    bottom: 6,
    width: 16,
    height: 3,
    backgroundColor: '#CE3B3B',
    borderRadius: 2,
  },
});
