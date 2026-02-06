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
    background: '#0f172a', // slate-900
    surface: '#1e293b', // slate-800
    primary: '#FF8C5A', // brighter orange accent
    secondary: '#94a3b8', // slate-400
    text: '#f8fafc', // slate-50
    textSecondary: '#cbd5e1', // slate-300
    border: '#334155', // slate-700
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    card: '#1e293b', // slate-800
    headerBackground: '#1e293b', // slate-800
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
