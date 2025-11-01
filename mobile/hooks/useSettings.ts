import { useState, useEffect } from 'react';
import { Tense } from '@/models/verb';

// Type-safe enabledTenses that only includes actual Tense types
type EnabledTenses = Record<Tense, boolean>;

export interface AppSettings {
  audioEnabled: boolean;
  autoPronounce: boolean;
  dailyGoal: number;
  appearance: 'light' | 'dark' | 'system';
  dialect: 'central' | 'delta' | 'anambra' | 'imo' | 'abia';
  displayMode: 'Verb and translation' | 'Only translation' | 'Only verb';
  rateAnswers: boolean;
  enabledTenses: EnabledTenses;
  notifications: {
    daily: boolean;
    reminderTime: string;
  };
}

const defaultSettings: AppSettings = {
  audioEnabled: true,
  autoPronounce: false,
  dailyGoal: 100,
  appearance: 'light',
  dialect: 'delta',
  displayMode: 'Verb and translation',
  rateAnswers: false,
  enabledTenses: {
    present: true,
    past: true,
    future: false,
    imperative: false,
    imperfect: false,
    conditional: false,
    subjunctive: false
  },
  notifications: {
    daily: true,
    reminderTime: '19:00',
  },
};

const SETTINGS_STORAGE_KEY = 'igbo_verb_settings';

// ---------------- Singleton store (module-level) ----------------
let currentSettings: AppSettings = defaultSettings;
let initialized = false;
const settingsListeners = new Set<(s: AppSettings) => void>();

// Mock AsyncStorage for cross-platform compatibility
// Use in-memory storage for React Native environments
const memoryStorage: Record<string, string> = {};

const AsyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      return memoryStorage[key] || null;
    } catch {
      return memoryStorage[key] || null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
      memoryStorage[key] = value;
    } catch {
      memoryStorage[key] = value;
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
      delete memoryStorage[key];
    } catch {
      delete memoryStorage[key];
    }
  },
};

async function loadFromStorageOnce() {
  if (initialized) return;
  try {
    const saved = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      currentSettings = { ...defaultSettings, ...parsed } as AppSettings;
    } else {
      // Persist defaults on the first run to keep storage in sync
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(currentSettings));
    }
  } catch (e) {
    console.error('Error loading settings:', e);
  } finally {
    initialized = true;
    // Notify all subscribers of the initial value
    settingsListeners.forEach((cb) => cb(currentSettings));
  }
}

function notifyAll() {
  settingsListeners.forEach((cb) => cb(currentSettings));
}

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(currentSettings);
  const [isLoading, setIsLoading] = useState(!initialized);

  useEffect(() => {
    let mounted = true;
    // Subscribe to store updates
    const listener = (s: AppSettings) => {
      if (mounted) setSettings(s);
      if (mounted) setIsLoading(false);
    };
    settingsListeners.add(listener);

    // Ensure storage is loaded (once)
    if (!initialized) {
      loadFromStorageOnce();
    } else {
      // Already initialized, ensure the local state is up to date
      setSettings(currentSettings);
      setIsLoading(false);
    }

    return () => {
      mounted = false;
      settingsListeners.delete(listener);
    };
  }, []);

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      // Shallow merge. Callers supply nested merges as needed (existing callers do).
      currentSettings = { ...currentSettings, ...newSettings } as AppSettings;
      notifyAll();
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(currentSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const resetSettings = async () => {
    try {
      currentSettings = { ...defaultSettings };
      notifyAll();
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(currentSettings));
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  };

  return {
    settings,
    updateSettings,
    resetSettings,
    isLoading,
  };
};