/**
 * @fileoverview Styles for the Practice (index) screen.
 *
 * Uses the `createStyles` factory pattern so styles can reference the current
 * `Theme` and `isDark` flag resolved by `useTheme()`.  Call this once per
 * render and memoize with `useMemo` if performance profiling suggests it is
 * necessary (StyleSheet.create is cheap for small sheets).
 *
 * @example
 * ```ts
 * const { theme, isDark } = useTheme();
 * const styles = createStyles(theme, isDark);
 * ```
 */

import { StyleSheet } from 'react-native';
import { Theme } from '@/components/ThemeProvider';
import {
  Colors,
  FontFamily,
  FontSize,
  Radius,
  Shadows,
  Spacing,
} from '@/constants/theme';

/**
 * Produces a theme-aware StyleSheet for the Practice screen.
 *
 * @param theme  - The resolved theme object from `useTheme()`.
 * @param isDark - Whether dark mode is currently active.
 * @returns A `StyleSheet` object scoped to the Practice screen.
 */
export const createStyles = (theme: Theme, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    // ----- Progress bar header -----
    progressContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    progressTitle: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.regular,
      color: theme.colors.text,
    },
    progressCount: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.regular,
      color: theme.colors.text,
    },

    // ----- Main scrollable content -----
    content: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: Spacing.lg,
    },

    // ----- Conjugation card -----
    cardContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 400,
    },
    card: {
      width: '100%',
      maxWidth: 350,
      borderRadius: Radius.xxl,
      padding: Spacing.xxxl,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.card,
      minHeight: 320,
      position: 'relative',
      ...Shadows.md,
    },

    // ----- Card content -----
    englishMeaning: {
      fontSize: FontSize.lg,
      textAlign: 'center',
      marginBottom: Spacing.xxxl,
      fontFamily: FontFamily.regular,
      color: theme.colors.textSecondary,
    },
    igboVerb: {
      fontSize: FontSize.jumbo,
      fontFamily: FontFamily.bold,
      textAlign: 'center',
      marginBottom: 60,
      color: theme.colors.text,
    },
    tenseBadge: {
      paddingHorizontal: Spacing.base,
      paddingVertical: Spacing.sm,
      borderRadius: Radius.xl,
      marginBottom: Spacing.xxxl,
      backgroundColor: isDark ? Colors.dark.primary : Colors.light.primary,
    },
    tenseBadgeText: {
      color: Colors.light.textOnPrimary,
      fontSize: FontSize.base,
      fontFamily: FontFamily.semiBold,
    },

    // ----- Answer reveal section -----
    answerSection: {
      alignItems: 'center',
      minHeight: 60,
      justifyContent: 'center',
    },
    pronounText: {
      fontSize: FontSize.lg,
      fontFamily: FontFamily.semiBold,
      textAlign: 'center',
      marginBottom: Spacing.base,
      color: theme.colors.text,
    },
    answerText: {
      fontSize: FontSize.hero,
      fontFamily: FontFamily.bold,
      textAlign: 'center',
      color: theme.colors.text,
    },
    tapToNextText: {
      fontSize: FontSize.base,
      textAlign: 'center',
      marginTop: Spacing.md,
      fontFamily: FontFamily.regular,
      color: theme.colors.textSecondary,
    },

    // ----- "Tap to show" placeholder -----
    answerPlaceholder: {
      alignItems: 'center',
    },
    answerLine: {
      width: 200,
      height: 2,
      marginBottom: Spacing.lg,
      backgroundColor: theme.colors.border,
    },
    tapToShowButton: {
      paddingVertical: Spacing.sm,
    },
    tapToShowText: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.regular,
      color: theme.colors.textSecondary,
    },

    // ----- Bottom action row -----
    bottomActions: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.xxxl,
      gap: Spacing.xl,
    },
    actionButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      ...Shadows.button,
    },

    // ----- Loading state -----
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: FontSize.lg,
      fontFamily: FontFamily.regular,
      color: theme.colors.textSecondary,
    },
  });
