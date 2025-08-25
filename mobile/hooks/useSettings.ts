import { useState, useEffect } from 'react';

export interface AppSettings {
  typingMode: boolean;
  audioEnabled: boolean;
  autoPronounce: boolean;
  dailyGoal: number;
  appearance: 'light' | 'dark' | 'system';
  dialect: 'central' | 'delta' | 'anambra' | 'imo' | 'abia';
  displayMode: 'Verb and translation' | 'Only translation' | 'Only verb';
  highlightMistakes: boolean;
  rateAnswers: boolean;
  enabledTenses: {
    present: boolean;
    past: boolean;
    imperfect: boolean;
    conditional: boolean;
    future: boolean;
    subjunctive: boolean;
    imperative: boolean;
  };
  notifications: {
    daily: boolean;
    reminderTime: string;
  };
}

const defaultSettings: AppSettings = {
  typingMode: false,
  audioEnabled: true,
  autoPronounce: false,
  dailyGoal: 100,
  appearance: 'light',
  dialect: 'central',
  displayMode: 'Verb and translation',
  highlightMistakes: true,
  rateAnswers: false,
  enabledTenses: {
    present: true,
    past: true,
    imperfect: false,
    conditional: false,
    future: false,
    subjunctive: false,
    imperative: false,
  },
  notifications: {
    daily: true,
    reminderTime: '19:00',
  },
};

const SETTINGS_STORAGE_KEY = 'igbo_verb_settings';

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const resetSettings = async () => {
    try {
      setSettings(defaultSettings);
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
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

// Mock AsyncStorage for cross-platform compatibility
// Use in-memory storage for React Native environments
const memoryStorage: Record<string, string> = {};

const AsyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      // Try to use localStorage (for web)
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      // Fall back to in-memory storage (for React Native)
      return memoryStorage[key] || null;
    } catch {
      // Fall back to in-memory storage
      return memoryStorage[key] || null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      // Try to use localStorage (for web)
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
      // Also store in memory (for React Native)
      memoryStorage[key] = value;
    } catch {
      // Fall back to in-memory storage
      memoryStorage[key] = value;
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      // Try to use localStorage (for web)
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
      // Also remove from memory (for React Native)
      delete memoryStorage[key];
    } catch {
      // Fall back to in-memory storage
      delete memoryStorage[key];
    }
  },
};