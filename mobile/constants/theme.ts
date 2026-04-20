/**
 * @fileoverview Design token constants for the ConjugateIgbo mobile app.
 *
 * This is the single source of truth for all visual design decisions.
 * Screens and components should reference these tokens rather than
 * hardcoding colour hex values, spacing numbers, or font names.
 *
 * ## Usage
 * ```ts
 * import { Colors, Spacing, Typography, Radius, Shadows } from '@/constants/theme';
 *
 * // In a style that doesn't depend on dark mode:
 * backgroundColor: Colors.light.background
 *
 * // In a createStyles function:
 * const styles = (isDark: boolean) => StyleSheet.create({
 *   card: { backgroundColor: isDark ? Colors.dark.surface : Colors.light.surface }
 * });
 * ```
 *
 * ## Adding a new token
 * 1. Add the value to the relevant group below.
 * 2. If it requires light/dark variants, add it to both `Colors.light` and `Colors.dark`.
 * 3. Reference it via the named import — never inline the raw value in a component.
 */

// ---------------------------------------------------------------------------
// Colour palette
// ---------------------------------------------------------------------------

/**
 * Raw palette — specific hex values tied to a named swatch.
 * Do not reference these directly in components; use `Colors.*` instead.
 */
const Palette = {
  // Brand
  orange: '#F3703E',
  orangeLight: '#FF8C5A',
  red: '#CE3B3B',
  green: '#22C55E',
  blue: '#3b82f6',
  blueDark: '#1e3a8a',
  blueLight: '#eff6ff',

  // Neutrals — light names reference Tailwind slate scale
  white: '#FFFFFF',
  slate50: '#f8fafc',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate300: '#cbd5e1',
  slate400: '#94a3b8',
  slate500: '#6b7280',
  slate700: '#374151',
  slate800: '#1e293b',
  slate900: '#0f172a',

  // Semantic status
  success: '#10b981',
  successDark: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',

  // Misc
  amber: '#f59e0b',
  pink: '#ec4899',
  yellow: '#fbbf24',

  // Transparency helpers
  transparent: 'transparent',
} as const;

/** Theme-aware colour tokens. Always reference through `Colors.light` or `Colors.dark`. */
export const Colors = {
  light: {
    background: Palette.slate50,
    surface: Palette.white,
    card: Palette.white,
    headerBackground: Palette.orange,

    primary: Palette.blue,
    accent: Palette.orange,
    accentFocused: Palette.red,

    text: '#1f2937',           // slate-800 equivalent
    textSecondary: Palette.slate500,
    textMuted: '#9ca3af',       // gray-400
    textOnPrimary: Palette.white,

    border: '#e5e7eb',          // gray-200
    borderSubtle: '#F0F0F0',
    separator: '#F0F0F0',

    tabBarBorder: Palette.orange,
    tabBarShadow: Palette.orange,
    tabBarBackground: Palette.white,
    tabActive: '#333333',
    tabInactive: Palette.slate400,
    tabIndicator: Palette.red,

    progressBar: Palette.orange,
    selected: Palette.blue,
    selectedBackground: Palette.blueLight,
    dialectSelected: Palette.green,

    inputBackground: '#f3f4f6',  // gray-100
    proLabel: Palette.amber,
    toggleBackground: '#f3f4f6',

    // Direct palette pass-throughs used in one-off decoration styles
    yellow: Palette.yellow,
    pink: Palette.pink,
    slate100: Palette.slate100,

    success: Palette.success,
    warning: Palette.warning,
    error: Palette.error,

    transparent: Palette.transparent,
  },
  dark: {
    background: Palette.slate900,
    surface: Palette.slate800,
    card: Palette.slate800,
    headerBackground: Palette.slate800,

    primary: Palette.orangeLight,
    accent: Palette.orange,
    accentFocused: Palette.orangeLight,

    text: Palette.slate50,
    textSecondary: Palette.slate300,
    textMuted: Palette.slate400,
    textOnPrimary: Palette.white,

    border: '#334155',           // slate-700
    borderSubtle: '#374151',
    separator: '#374151',

    tabBarBorder: Palette.orange,
    tabBarShadow: '#000000',
    tabBarBackground: Palette.slate800,
    tabActive: Palette.slate50,
    tabInactive: Palette.slate400,
    tabIndicator: Palette.red,

    progressBar: Palette.orange,
    selected: Palette.blue,
    selectedBackground: Palette.blueDark,
    dialectSelected: Palette.green,

    inputBackground: Palette.slate700,
    proLabel: Palette.amber,
    toggleBackground: Palette.slate700,

    success: Palette.successDark,
    warning: Palette.warning,
    error: Palette.error,
  },
} as const;

// ---------------------------------------------------------------------------
// Spacing scale
// ---------------------------------------------------------------------------

/**
 * 4-point spacing scale.
 * - Use `Spacing.xs` through `Spacing.xxl` for margins, paddings, and gaps.
 * - Avoid arbitrary numbers in StyleSheets.
 */
export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
} as const;

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

/**
 * Font family names loaded via expo-google-fonts.
 * Always reference through `FontFamily.*` to avoid typos.
 */
export const FontFamily = {
  regular: 'Inter-Regular',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
  manjariRegular: 'Manjari-Regular',
  manjariBold: 'Manjari-Bold',
  amaticRegular: 'AmaticSC-Regular',
  amaticBold: 'AmaticSC-Bold',
} as const;

/**
 * Typographic size scale.
 * Maps semantic names to pixel values that match the existing design.
 */
export const FontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 22,
  xxxl: 24,
  display: 28,
  hero: 32,
  giant: 36,
  jumbo: 48,
} as const;

/** Convenient typography presets combining font family + size. */
export const Typography = {
  label: { fontFamily: FontFamily.regular, fontSize: FontSize.base },
  labelSemiBold: { fontFamily: FontFamily.semiBold, fontSize: FontSize.base },
  body: { fontFamily: FontFamily.regular, fontSize: FontSize.md },
  bodySemiBold: { fontFamily: FontFamily.semiBold, fontSize: FontSize.md },
  heading: { fontFamily: FontFamily.bold, fontSize: FontSize.xl },
  title: { fontFamily: FontFamily.bold, fontSize: FontSize.xxxl },
  sectionLabel: {
    fontFamily: FontFamily.manjariRegular,
    fontSize: FontSize.base,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  tabLabel: { fontFamily: FontFamily.manjariRegular, fontSize: FontSize.xs },
  timeDisplay: { fontFamily: FontFamily.manjariBold, fontSize: FontSize.giant },
  verbDisplay: { fontFamily: FontFamily.bold, fontSize: FontSize.jumbo },
  cardAnswer: { fontFamily: FontFamily.bold, fontSize: FontSize.hero },
} as const;

// ---------------------------------------------------------------------------
// Border radius
// ---------------------------------------------------------------------------

/** Border radius scale used across cards, buttons, badges, and modals. */
export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 15,
  xl: 20,
  xxl: 24,
  pill: 25,
  full: 9999,
} as const;

// ---------------------------------------------------------------------------
// Shadows
// ---------------------------------------------------------------------------

/**
 * Cross-platform shadow presets.
 * iOS uses shadow* props; Android uses elevation.
 * Spread both into a StyleSheet to ensure correct rendering on each platform.
 */
export const Shadows = {
  /** Subtle shadow for list items and inputs. */
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  /** Standard shadow for cards. */
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  /** Heavy shadow for floating elements (tab bar, action buttons). */
  lg: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  /** Action button shadow. */
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
} as const;

// ---------------------------------------------------------------------------
// Z-index scale
// ---------------------------------------------------------------------------

/** Explicit z-index values to prevent stacking context surprises. */
export const ZIndex = {
  base: 0,
  card: 1,
  overlay: 10,
  modal: 50,
  tabBar: 100,
} as const;
