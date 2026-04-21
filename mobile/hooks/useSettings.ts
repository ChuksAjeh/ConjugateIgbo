/**
 * @fileoverview Global app settings hook with singleton storage.
 *
 * `useSettings` provides access to the user's preferences (dialect, tenses,
 * appearance, daily goal, etc.) from any component without prop-drilling.
 *
 * ## Architecture — module-level singleton
 * Settings state lives in module-level variables (`currentSettings`,
 * `settingsListeners`) rather than inside a React context. This means:
 * - All hook instances share the same state automatically.
 * - Settings are loaded from storage exactly once per app launch.
 * - Calling `updateSettings` from any component notifies every subscriber.
 *
 * ## Usage
 * ```ts
 * const { settings, updateSettings, isLoading } = useSettings();
 *
 * // Toggle the dark theme:
 * updateSettings({ appearance: 'dark' });
 *
 * // Enable the future tense:
 * updateSettings({
 *   enabledTenses: { ...settings.enabledTenses, future: true }
 * });
 * ```
 */

import { useState, useEffect } from 'react';
import * as Sentry from '@sentry/react-native';
import { Dialect, Pronoun, Tense } from '@/models/verb';

/** A map from every `Tense` key to an enabled/disabled boolean. */
type EnabledTenses = Record<Tense, boolean>;

/**
 * The full settings object persisted to and restored from storage.
 * Defaults are applied for any keys absent from a saved snapshot
 * (forward-compatible when new settings are added).
 */
export interface AppSettings {
  /** Whether audio auto-play is enabled. */
  audioEnabled: boolean;
  /** Whether the app should automatically pronounce the verb on reveal. */
  autoPronounce: boolean;
  /** Daily conjugation goal (number of cards to complete). */
  dailyGoal: number;
  /** Colour scheme preference: explicit or follow the OS. */
  appearance: 'light' | 'dark' | 'system';
  /** The Igbo dialect used for verb conjugation and data fetching. */
  dialect: Dialect;
  /** Controls how much of the verb card is shown before the answer is revealed. */
  displayMode: 'Verb and translation' | 'Only translation' | 'Only verb';
  /** Whether the user can manually rate their answer as correct/incorrect. */
  rateAnswers: boolean;
  /** Which tenses are included in the practice session. */
  enabledTenses: EnabledTenses;
  /**
   * Maximum number of verbs loaded from the verb pool.
   * Higher limits require a Pro subscription.
   */
  verbLimit: 100 | 250 | 500 | 1000;
  /** Which pronoun persons are included in the practice session. */
  enabledPronouns: Record<Pronoun, boolean>;
  /** Daily push notification configuration. */
  notifications: {
    daily: boolean;
    /** Time of day for the daily reminder in `HH:MM` 24-hour format. */
    reminderTime: string;
  };
}

/** Applied when no saved settings are found or after a reset. */
const defaultSettings: AppSettings = {
  audioEnabled: true,
  autoPronounce: false,
  dailyGoal: 100,
  appearance: 'light',
  dialect: 'delta',
  displayMode: 'Verb and translation',
  rateAnswers: false,
  enabledTenses: {
    // Free-tier defaults — present, past, future enabled out of the box.
    present: true,
    past: true,
    future: true,
    imperative: false,
    presentPerfect: false,
    habitualPresent: false,
    negativePast: false,
    negativeFuture: false,
    negativeImperative: false,
    negativePerfect: false,
    neverPerfect: false,
    // Pro-only derivational helpers, off by default.
    finished: false,
    together: false,
    first: false,
    polite: false,
  },
  verbLimit: 100,
  enabledPronouns: {
    m: true,
    i: true,
    o: true,
    anyi: true,
    unu: true,
    wa: true,
  },
  notifications: {
    daily: true,
    reminderTime: '19:00',
  },
};

const SETTINGS_STORAGE_KEY = 'igbo_verb_settings';

// ---------------------------------------------------------------------------
// Module-level singleton store
// ---------------------------------------------------------------------------

let currentSettings: AppSettings = defaultSettings;
let initialized = false;
const settingsListeners = new Set<(s: AppSettings) => void>();

/**
 * Lightweight cross-platform storage shim.
 * Prefers `localStorage` (web) and falls back to an in-memory map.
 * The real AsyncStorage is imported separately in native builds; this shim
 * exists only for web and test environments where AsyncStorage is unavailable.
 */
const memoryStorage: Record<string, string> = {};

const AsyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
      return memoryStorage[key] ?? null;
    } catch {
      return memoryStorage[key] ?? null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      memoryStorage[key] = value;
    } catch {
      memoryStorage[key] = value;
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
      delete memoryStorage[key];
    } catch {
      delete memoryStorage[key];
    }
  },
};

/**
 * Loads persisted settings from storage exactly once per app session.
 * Merges saved values onto `defaultSettings` so new keys added in future
 * releases are always present.
 * Notifies all active listeners after the load completes.
 */
async function loadFromStorageOnce() {
  if (initialized) return;
  try {
    const saved = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      currentSettings = { ...defaultSettings, ...parsed } as AppSettings;
    } else {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(currentSettings));
    }
  } catch (e: any) {
    Sentry.captureException(e, {
      tags: { feature: 'settings', hook: 'useSettings' },
      extra: { context: 'Loading settings' },
    });
  } finally {
    initialized = true;
    settingsListeners.forEach((cb) => cb(currentSettings));
  }
}

/** Broadcasts the current settings snapshot to all active hook instances. */
function notifyAll() {
  settingsListeners.forEach((cb) => cb(currentSettings));
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Provides the current app settings and mutators.
 *
 * Safe to call in multiple components — they all share the same underlying
 * state and will re-render together when settings change.
 *
 * @returns An object with:
 *   - `settings`       — the current `AppSettings` snapshot.
 *   - `updateSettings` — shallow-merges a partial update and persists it.
 *   - `resetSettings`  — restores factory defaults and persists them.
 *   - `isLoading`      — `true` until the first storage read completes.
 */
export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(currentSettings);
  const [isLoading, setIsLoading] = useState(!initialized);

  useEffect(() => {
    let mounted = true;

    const listener = (s: AppSettings) => {
      if (mounted) {
        setSettings(s);
        setIsLoading(false);
      }
    };
    settingsListeners.add(listener);

    if (!initialized) {
      loadFromStorageOnce();
    } else {
      setSettings(currentSettings);
      setIsLoading(false);
    }

    return () => {
      mounted = false;
      settingsListeners.delete(listener);
    };
  }, []);

  /**
   * Shallow-merges `newSettings` into the current settings and persists the
   * result. For nested objects (e.g. `enabledTenses`) callers must spread the
   * existing value themselves.
   *
   * @param newSettings - Partial settings to merge in.
   */
  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      currentSettings = { ...currentSettings, ...newSettings } as AppSettings;
      notifyAll();
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(currentSettings));
    } catch (error: any) {
      Sentry.captureException(error, {
        tags: { feature: 'settings', hook: 'useSettings' },
        extra: { context: 'Error Saving settings' },
      });
    }
  };

  /**
   * Restores all settings to the factory defaults and persists the reset.
   */
  const resetSettings = async () => {
    try {
      currentSettings = { ...defaultSettings };
      notifyAll();
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(currentSettings));
    } catch (error: any) {
      Sentry.captureException(error, {
        tags: { feature: 'settings', hook: 'useSettings' },
        extra: { context: 'Error Resetting settings' },
      });
    }
  };

  return { settings, updateSettings, resetSettings, isLoading };
};
