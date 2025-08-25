import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme, StatusBar } from 'react-native';
import { useSettings } from '@/hooks/useSettings';

export interface Theme {
  colors: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    card: string;
    headerBackground: string;
  };
}

const lightTheme: Theme = {
  colors: {
    background: '#f8fafc',
    surface: '#ffffff',
    primary: '#3b82f6',
    secondary: '#6b7280',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    card: '#ffffff',
    headerBackground: '#3b82f6',
  },
};

const darkTheme: Theme = {
  colors: {
    background: '#111827',
    surface: '#1f2937',
    primary: '#60a5fa',
    secondary: '#9ca3af',
    text: '#f9fafb',
    textSecondary: '#d1d5db',
    border: '#374151',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    card: '#1f2937',
    headerBackground: '#1f2937',
  },
};

const ThemeContext = createContext<{
  theme: Theme;
  isDark: boolean;
}>({
  theme: lightTheme,
  isDark: false,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
  }, [isDark]);
  return (
    <ThemeContext.Provider value={{ theme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};