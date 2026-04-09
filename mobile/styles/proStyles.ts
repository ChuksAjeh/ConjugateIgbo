/**
 * @fileoverview Styles for the Pro upgrade screen.
 *
 * Uses the `createStyles(theme, isDark)` factory pattern so all values
 * are resolved from design-token constants rather than hardcoded.
 *
 * @example
 * ```ts
 * const { theme, isDark } = useTheme();
 * const styles = createStyles(theme, isDark);
 * ```
 */

import { StyleSheet, Dimensions } from 'react-native';
import { Theme } from '@/components/ThemeProvider';
import {
  Colors,
  FontFamily,
  FontSize,
  Radius,
  Shadows,
  Spacing,
} from '@/constants/theme';

const { height } = Dimensions.get('window');

/**
 * Produces a theme-aware StyleSheet for the Pro screen.
 *
 * @param theme  - The resolved theme object from `useTheme()`.
 * @param isDark - Whether dark mode is currently active.
 * @returns A `StyleSheet` object covering both the paywall and the
 *          "already subscribed" views.
 */
export const createStyles = (theme: Theme, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
    },

    // ----- Decorative top section with pattern -----
    topSection: {
      height: height * 0.5,
      position: 'relative',
      overflow: 'hidden',
    },
    patternContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.3,
    },
    patternElement: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    patternIcon: {
      fontSize: FontSize.xl,
      opacity: 0.6,
    },

    // ----- Mascot circle -----
    catContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    catCircle: {
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: Colors.light.surface,
      padding: Spacing.sm,
      ...Shadows.md,
      shadowOpacity: 0.3,
    },
    catBackground: {
      width: '100%',
      height: '100%',
      borderRadius: 92,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    cat: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    catEars: {
      flexDirection: 'row',
      gap: 20,
      marginBottom: -10,
    },
    catEar: {
      width: 20,
      height: 25,
      backgroundColor: '#000',
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
      transform: [{ rotate: '15deg' }],
    },
    catFace: {
      width: 80,
      height: 70,
      backgroundColor: '#000',
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    catEyes: {
      flexDirection: 'row',
      gap: 16,
      marginTop: Spacing.sm,
    },
    catEye: {
      width: 12,
      height: 12,
      backgroundColor: Colors.light.yellow,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: '#000',
    },
    catMouth: {
      marginTop: Spacing.sm,
      alignItems: 'center',
    },
    catTongue: {
      width: 8,
      height: 6,
      backgroundColor: Colors.light.pink,
      borderRadius: 4,
    },
    catBody: {
      width: 60,
      height: 40,
      backgroundColor: '#000',
      borderRadius: 30,
      marginTop: -5,
    },
    catTail: {
      position: 'absolute',
      right: -25,
      top: 30,
      width: 40,
      height: 8,
      backgroundColor: '#000',
      borderRadius: 4,
      transform: [{ rotate: '45deg' }],
    },

    // ----- Bottom content section -----
    bottomSection: {
      backgroundColor: theme.colors.background,
      paddingHorizontal: Spacing.xxl,
      paddingVertical: Spacing.xxxl,
      alignItems: 'center',
      flex: 1,
    },
    mainTitle: {
      fontSize: FontSize.xxxl,
      fontFamily: FontFamily.semiBold,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 4,
    },
    brandTitle: {
      fontSize: FontSize.xxxl,
      fontFamily: FontFamily.manjariBold,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: Spacing.xxxl,
    },

    // ----- Feature list -----
    featuresList: {
      alignItems: 'flex-start',
      marginBottom: Spacing.xxxl,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.base,
    },
    featureBullet: {
      width: 8,
      height: 8,
      borderRadius: Radius.xs,
      backgroundColor: theme.colors.primary,
      marginRight: Spacing.base,
    },
    featureText: {
      fontSize: FontSize.lg,
      fontFamily: FontFamily.manjariRegular,
      color: theme.colors.text,
    },

    // ----- Purchase button -----
    buyButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: Spacing.huge,
      paddingVertical: Spacing.base,
      borderRadius: Radius.pill,
      marginBottom: Spacing.xl,
      minWidth: 200,
      alignItems: 'center',
    },
    buyButtonDisabled: {
      opacity: 0.6,
    },
    buyButtonText: {
      color: Colors.light.textOnPrimary,
      fontSize: FontSize.lg,
      fontFamily: FontFamily.manjariBold,
    },

    // ----- Pricing info -----
    pricingInfo: {
      alignItems: 'center',
      marginBottom: 60,
    },
    priceText: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.manjariRegular,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    subscriptionText: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.manjariRegular,
      color: theme.colors.textSecondary,
    },

    // ----- Restore link -----
    restoreButton: {
      paddingVertical: Spacing.md,
    },
    restoreButtonText: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.manjariRegular,
      color: theme.colors.primary,
      textAlign: 'center',
    },

    // ----- Pro subscriber view -----
    header: {
      alignItems: 'center',
      paddingVertical: Spacing.huge,
      borderBottomLeftRadius: Radius.xxl,
      borderBottomRightRadius: Radius.xxl,
    },
    headerTitle: {
      fontSize: FontSize.display,
      fontFamily: FontFamily.manjariBold,
      color: Colors.light.textOnPrimary,
      marginTop: Spacing.base,
      marginBottom: Spacing.sm,
    },
    headerSubtitle: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.manjariRegular,
      color: 'rgba(255, 255, 255, 0.9)',
    },
    proStatusContainer: {
      padding: Spacing.lg,
      margin: Spacing.lg,
      borderRadius: Radius.xl,
      backgroundColor: theme.colors.surface,
    },
    proStatusTitle: {
      fontSize: FontSize.xl,
      fontFamily: FontFamily.manjariBold,
      color: theme.colors.text,
      marginBottom: Spacing.lg,
      textAlign: 'center',
    },
    featureIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? '#064e3b' : '#dcfce7',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.base,
    },
    thankYouContainer: {
      margin: Spacing.lg,
      padding: Spacing.xl,
      borderRadius: Radius.xl,
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
    },
    thankYouText: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.manjariRegular,
      color: theme.colors.text,
      textAlign: 'center',
    },
  });

/** Convenience type alias for the return value of `createStyles`. */
export type ProStyles = ReturnType<typeof createStyles>;
