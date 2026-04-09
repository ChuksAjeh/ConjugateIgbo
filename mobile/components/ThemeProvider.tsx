/**
 * @fileoverview App-wide theme context and provider.
 *
 * Supplies a `theme` object and `isDark` flag to the component tree via React
 * context. The active theme is derived from the user's appearance setting
 * (`'light'`, `'dark'`, or `'system'`) combined with the OS colour scheme.
 *
 * ## Usage
 * ```tsx
 * // Wrap at the app root (already done in app/_layout.tsx):
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 *
 * // Consume anywhere in the tree:
 * const { theme, isDark } = useTheme();
 * ```
 *
 * ## Extending the theme
 * Add new colour roles to the `Theme` interface, then supply values in
 * `lightTheme` and `darkTheme`. Components can reference `theme.colors.newRole`
 * immediately after.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme, StatusBar } from 'react-native';
import { useSettings } from '@/hooks/useSettings';
import { Colors } from '@/constants/theme';

// ---------------------------------------------------------------------------
// Theme shape
// ---------------------------------------------------------------------------

/**
 * The full set of theme colour roles consumed by components and style
 * factories (`createStyles`). All values are resolved hex strings.
 */
export interface Theme {
  colors: {
    /** Page / screen background. */
    background: string;
    /** Elevated surface (cards, sheets). */
    surface: string;
    /** Card background — typically the same as `surface`. */
    card: string;
    /** Brand / interactive primary colour. */
    primary: string;
    /** Muted secondary text / icons. */
    secondary: string;
    /** Primary body text. */
    text: string;
    /** De-emphasised body text. */
    textSecondary: string;
    /** Dividers, input borders, and subtle separators. */
    border: string;
    /** Positive state (success messages, check marks). */
    success: string;
    /** Cautionary state. */
    warning: string;
    /** Destructive / error state. */
    error: string;
    /** Navigation header background. */
    headerBackground: string;
  };
}

// ---------------------------------------------------------------------------
// Theme definitions — sourced from design tokens in @/constants/theme
// ---------------------------------------------------------------------------

/** Resolved colour values for the light theme. */
const lightTheme: Theme = {
  colors: {
    background: Colors.light.background,
    surface: Colors.light.surface,
    card: Colors.light.card,
    primary: Colors.light.primary,
    secondary: Colors.light.textSecondary,
    text: Colors.light.text,
    textSecondary: Colors.light.textSecondary,
    border: Colors.light.border,
    success: Colors.light.success,
    warning: Colors.light.warning,
    error: Colors.light.error,
    headerBackground: Colors.light.headerBackground,
  },
};

/** Resolved colour values for the dark theme. */
const darkTheme: Theme = {
  colors: {
    background: Colors.dark.background,
    surface: Colors.dark.surface,
    card: Colors.dark.card,
    primary: Colors.dark.primary,
    secondary: Colors.dark.textSecondary,
    text: Colors.dark.text,
    textSecondary: Colors.dark.textSecondary,
    border: Colors.dark.border,
    success: Colors.dark.success,
    warning: Colors.dark.warning,
    error: Colors.dark.error,
    headerBackground: Colors.dark.headerBackground,
  },
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ThemeContext = createContext<{
  theme: Theme;
  isDark: boolean;
}>({
  theme: lightTheme,
  isDark: false,
});

/**
 * Returns the current theme and dark-mode flag.
 * Must be called inside a component tree wrapped by `ThemeProvider`.
 */
export const useTheme = () => useContext(ThemeContext);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/**
 * Provides theme context to the component tree.
 *
 * Reads the user's `appearance` setting and reconciles it with the OS colour
 * scheme to decide which theme is active. Also keeps `StatusBar` style in sync.
 *
 * @param children - Child components that can access `useTheme()`.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { settings } = useSettings();
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    let shouldUseDark = false;
    switch (settings.appearance) {
      case 'dark':
        shouldUseDark = true;
        break;
      case 'light':
        shouldUseDark = false;
        break;
      case 'system':
        shouldUseDark = systemColorScheme === 'dark';
        break;
    }
    setIsDark(shouldUseDark);
  }, [settings.appearance, systemColorScheme]);

  useEffect(() => {
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
  }, [isDark]);

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};
