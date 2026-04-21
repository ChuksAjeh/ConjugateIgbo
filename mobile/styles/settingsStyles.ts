/**
 * @fileoverview Styles for the Settings screen and its sub-modals.
 *
 * Follows the `createStyles(theme, isDark)` factory pattern so every style
 * value is resolved from the design-token constants rather than hardcoded.
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
  Spacing,
} from '@/constants/theme';

/**
 * Produces a theme-aware StyleSheet for the Settings screen.
 *
 * @param theme  - The resolved theme object from `useTheme()`.
 * @param isDark - Whether dark mode is currently active.
 * @returns A `StyleSheet` object covering all Settings UI variants.
 */
export const createStyles = (theme: Theme, isDark: boolean) =>
  StyleSheet.create({
    // ----- Screen container -----
    container: {
      flex: 1,
      backgroundColor: isDark ? theme.colors.background : Colors.light.surface,
      position: 'relative',
    },

    // ----- Background wave decorations -----
    bgWaveLeft: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 40,
      opacity: isDark ? 0.15 : 0.2,
    },
    bgWaveRight: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      width: 40,
      opacity: isDark ? 0.15 : 0.2,
    },

    // ----- Orange header bar -----
    header: {
      backgroundColor: Colors.light.accent,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: Spacing.lg,
      paddingHorizontal: 15,
      position: 'relative',
    },
    headerInner: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    backButton: {
      position: 'absolute',
      left: 15,
      bottom: Spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButtonText: {
      color: Colors.light.textOnPrimary,
      fontSize: FontSize.md,
      fontFamily: FontFamily.manjariRegular,
      marginLeft: -4,
    },
    headerTitle: {
      fontSize: FontSize.xxl,
      color: Colors.light.textOnPrimary,
      fontFamily: FontFamily.manjariBold,
    },
    headerSubtitle: {
      display: 'none',
    },

    // ----- Scrollable content -----
    content: {
      flex: 1,
    },
    contentContainer: {
      alignItems: 'center',
    },
    contentInner: {
      width: '100%',
    },

    // ----- Section groups -----
    section: {
      marginBottom: Spacing.lg,
    },
    sectionTitle: {
      fontSize: FontSize.base,
      color: Colors.light.textMuted,
      paddingVertical: 10,
      textTransform: 'uppercase',
      fontFamily: FontFamily.manjariRegular,
      letterSpacing: 1,
    },
    subSectionTitle: {
      fontSize: FontSize.base,
      color: Colors.light.textMuted,
      paddingVertical: 10,
      textTransform: 'uppercase',
      fontFamily: FontFamily.manjariRegular,
      letterSpacing: 1,
    },
    sectionContent: {
      backgroundColor: Colors.light.transparent,
    },

    // ----- Individual setting row -----
    settingsItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 18,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? theme.colors.border : Colors.light.separator,
    },
    lockedItem: {
      opacity: 0.6,
    },
    settingsItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingsItemIcon: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.md,
    },
    lockedIcon: {
      backgroundColor: isDark ? '#1f2937' : Colors.light.slate100,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingsItemTitle: {
      fontSize: FontSize.md,
      color: isDark ? theme.colors.text : '#333',
      fontFamily: FontFamily.manjariRegular,
    },
    lockedText: {
      color: Colors.light.textMuted,
    },
    proLabel: {
      backgroundColor: Colors.light.proLabel,
      color: Colors.light.textOnPrimary,
      fontSize: FontSize.xs,
      fontFamily: FontFamily.manjariBold,
      paddingHorizontal: Spacing.xs + 2,
      paddingVertical: 2,
      borderRadius: Radius.sm,
      marginLeft: Spacing.sm,
    },
    settingsItemSubtitle: {
      display: 'none',
    },
    settingsItemRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },

    // ----- App info footer -----
    appInfo: {
      alignItems: 'center',
      paddingVertical: Spacing.xxl,
      paddingHorizontal: Spacing.lg,
    },
    appInfoTitle: {
      fontSize: FontSize.xl,
      fontFamily: FontFamily.bold,
      color: theme.colors.text,
      marginBottom: 4,
    },
    appInfoVersion: {
      fontSize: FontSize.base,
      fontFamily: FontFamily.regular,
      color: theme.colors.textSecondary,
      marginBottom: Spacing.md,
    },
    appInfoDescription: {
      fontSize: FontSize.base,
      fontFamily: FontFamily.regular,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },

    // ----- Modal scaffolding -----
    modalContainer: {
      flex: 1,
      backgroundColor: isDark ? theme.colors.background : Colors.light.surface,
      position: 'relative',
    },
    modalWaveLeft: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 40,
      opacity: isDark ? 0.15 : 0.2,
    },
    modalWaveRight: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      width: 40,
      opacity: isDark ? 0.15 : 0.2,
    },
    modalOrangeHeader: {
      backgroundColor: Colors.light.accent,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: Spacing.lg,
      paddingHorizontal: 15,
      position: 'relative',
      zIndex: 2,
    },
    modalHeaderBackButton: {
      position: 'absolute',
      left: 15,
      bottom: Spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
    },
    modalHeaderTitle: {
      fontSize: FontSize.xxl,
      color: Colors.light.textOnPrimary,
      fontFamily: FontFamily.manjariBold,
    },
    modalHeaderCloseButton: {
      position: 'absolute',
      right: 15,
      bottom: Spacing.lg,
      padding: 4,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: Spacing.lg,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.dark.border : theme.colors.border,
    },
    modalTitle: {
      fontSize: FontSize.xl,
      fontFamily: FontFamily.bold,
      color: theme.colors.text,
    },
    modalContent: {
      flex: 1,
      padding: Spacing.lg,
    },
    modalText: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.regular,
      color: theme.colors.text,
      textAlign: 'center',
    },

    // ----- Sub-page option rows (dialect / appearance / display) -----
    // Match the settings home page: a row with a bottom-border separator,
    // title (+ optional subtitle) on the left, selected indicator on the
    // right. No rounded cards / no tinted backgrounds.
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 18,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? theme.colors.border : Colors.light.separator,
    },
    selectedOption: {
      // Intentionally empty — selection is indicated via the check icon and
      // coloured text, not a background change.
    },
    optionText: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.manjariRegular,
      color: isDark ? theme.colors.text : '#333',
    },
    selectedOptionText: {
      color: Colors.light.accent,
      fontFamily: FontFamily.manjariBold,
    },

    // Aliases so existing JSX that references dialect* / appearance* styles
    // continues to render with the unified row look.
    dialectOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 18,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? theme.colors.border : Colors.light.separator,
    },
    selectedDialectOption: {},
    dialectLabel: {
      fontSize: FontSize.md,
      color: isDark ? theme.colors.text : '#333',
      fontFamily: FontFamily.manjariRegular,
    },
    selectedDialectLabel: {
      color: Colors.light.accent,
      fontFamily: FontFamily.manjariBold,
    },
    dialectDescription: {
      fontSize: FontSize.xs,
      color: Colors.light.textMuted,
      marginTop: 2,
      fontFamily: FontFamily.manjariRegular,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    selectedDialectDescription: {
      color: Colors.light.accent,
    },

    appearanceToggle: {
      padding: Spacing.sm,
      borderRadius: Radius.sm,
      backgroundColor: isDark
        ? Colors.dark.toggleBackground
        : Colors.light.toggleBackground,
    },
    appearanceOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 18,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? theme.colors.border : Colors.light.separator,
    },
    appearanceOptionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    appearanceIcon: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.md,
    },
    appearanceLabel: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.semiBold,
      color: theme.colors.text,
    },
    appearanceDescription: {
      fontSize: FontSize.base,
      fontFamily: FontFamily.regular,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },

    // ----- Notifications / reminder -----
    reminderToggleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      padding: Spacing.lg,
      borderRadius: Radius.md,
      marginBottom: Spacing.lg,
    },
    reminderToggleLabel: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.semiBold,
      color: theme.colors.text,
    },
    timePickerContainer: {
      backgroundColor: theme.colors.surface,
      padding: Spacing.lg,
      borderRadius: Radius.md,
    },
    timePickerLabel: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.semiBold,
      color: theme.colors.text,
      marginBottom: Spacing.base,
    },
    currentTimeText: {
      fontSize: FontSize.base,
      fontFamily: FontFamily.regular,
      color: theme.colors.textSecondary,
      marginTop: Spacing.md,
      textAlign: 'center',
    },
    reminderHint: {
      fontSize: FontSize.base,
      fontFamily: FontFamily.manjariRegular,
      color: theme.colors.textSecondary,
      marginTop: Spacing.base,
      marginBottom: Spacing.sm,
      textAlign: 'center',
      lineHeight: 20,
    },
    timePicker: {
      alignItems: 'center',
    },
    timeDisplayButton: {
      backgroundColor: isDark
        ? Colors.dark.toggleBackground
        : Colors.light.toggleBackground,
      borderRadius: Radius.md,
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.xxxl,
      alignItems: 'center',
      marginBottom: Spacing.base,
      borderWidth: 2,
      borderColor: Colors.light.accent,
    },
    timeDisplayText: {
      fontSize: FontSize.giant,
      fontFamily: FontFamily.manjariBold,
      color: theme.colors.text,
    },
    timeDisplayHint: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.manjariRegular,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    dateTimePickerWrapper: {
      backgroundColor: isDark ? Colors.dark.surface : Colors.light.background,
      borderRadius: Radius.md,
      padding: Spacing.base,
      marginBottom: Spacing.base,
      alignItems: 'center',
    },
    doneButton: {
      backgroundColor: Colors.light.accent,
      paddingHorizontal: Spacing.xxl,
      paddingVertical: 10,
      borderRadius: Radius.sm,
      marginTop: Spacing.md,
    },
    doneButtonText: {
      color: Colors.light.textOnPrimary,
      fontSize: FontSize.md,
      fontFamily: FontFamily.manjariBold,
    },
    timeInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    timeInput: {
      backgroundColor: isDark
        ? Colors.dark.toggleBackground
        : Colors.light.toggleBackground,
      borderRadius: Radius.sm,
      padding: Spacing.md,
      fontSize: FontSize.lg,
      fontFamily: FontFamily.bold,
      textAlign: 'center',
      width: 60,
      color: theme.colors.text,
    },
    timeSeparator: {
      fontSize: FontSize.lg,
      fontFamily: FontFamily.bold,
      marginHorizontal: Spacing.sm,
      color: theme.colors.text,
    },
    timeFormat: {
      fontSize: FontSize.sm,
      fontFamily: FontFamily.regular,
      color: theme.colors.textSecondary,
    },

    // ----- Save / action buttons -----
    saveButton: {
      backgroundColor: Colors.light.primary,
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.md,
      borderRadius: Radius.sm,
      marginTop: Spacing.lg,
    },
    saveButtonText: {
      color: Colors.light.textOnPrimary,
      fontSize: FontSize.md,
      fontFamily: FontFamily.semiBold,
      textAlign: 'center',
    },

    // ----- Daily goal modal -----
    goalDescription: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.regular,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: Spacing.xl,
    },
    goalInputContainer: {
      alignItems: 'center',
      marginBottom: Spacing.xl,
    },
    goalInput: {
      backgroundColor: isDark
        ? Colors.dark.toggleBackground
        : Colors.light.toggleBackground,
      borderRadius: Radius.md,
      padding: Spacing.base,
      fontSize: FontSize.xxxl,
      fontFamily: FontFamily.bold,
      textAlign: 'center',
      width: 200,
      marginBottom: Spacing.sm,
      color: theme.colors.text,
    },
    goalUnit: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.regular,
      color: theme.colors.textSecondary,
    },
  });

/** Convenience type alias for the return value of `createStyles`. */
export type SettingsStyles = ReturnType<typeof createStyles>;
