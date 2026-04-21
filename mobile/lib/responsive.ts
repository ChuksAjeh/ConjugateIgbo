import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

/**
 * Shared large-screen breakpoints used across the app.
 *
 * The app was originally tuned for phones, so several screens ended up with
 * hardcoded widths that looked undersized on iPad. This helper centralises the
 * width caps we want to use when a screen grows beyond handset sizes.
 */
export const TABLET_BREAKPOINT = 768;
export const LARGE_SCREEN_BREAKPOINT = 1024;

/**
 * Shape returned by `useResponsiveLayout`.
 */
export interface ResponsiveLayout {
  windowWidth: number;
  isTablet: boolean;
  isLargeScreen: boolean;
  screenPadding: number;
  contentMaxWidth: number;
  listMaxWidth: number;
  formMaxWidth: number;
  cardMaxWidth: number;
  heroMaxWidth: number;
}

/**
 * Returns shared responsive layout values based on the current window width.
 *
 * These values are intentionally conservative: screens still keep their
 * existing interaction model, but are allowed to breathe on tablets rather
 * than staying locked to phone-sized cards and columns.
 */
export function useResponsiveLayout(): ResponsiveLayout {
  const { width } = useWindowDimensions();

  return useMemo(() => {
    const isLargeScreen = width >= LARGE_SCREEN_BREAKPOINT;
    const isTablet = width >= TABLET_BREAKPOINT;
    const screenPadding = isLargeScreen ? 56 : isTablet ? 36 : 20;
    const usableWidth = Math.max(width - screenPadding * 2, 320);

    return {
      windowWidth: width,
      isTablet,
      isLargeScreen,
      screenPadding,
      contentMaxWidth: Math.min(
        usableWidth,
        isLargeScreen ? 1380 : isTablet ? 1040 : 480,
      ),
      listMaxWidth: Math.min(
        usableWidth,
        isLargeScreen ? 1500 : isTablet ? 1120 : 560,
      ),
      formMaxWidth: Math.min(
        usableWidth,
        isLargeScreen ? 1480 : isTablet ? 1120 : 520,
      ),
      cardMaxWidth: Math.min(
        usableWidth,
        isLargeScreen ? 980 : isTablet ? 760 : 340,
      ),
      heroMaxWidth: Math.min(
        usableWidth,
        isLargeScreen ? 1260 : isTablet ? 960 : 360,
      ),
    };
  }, [width]);
}
