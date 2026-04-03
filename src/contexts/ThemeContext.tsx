import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useApp } from './AppContext';
import { userPreferencesService } from '@/features/auth/services/userPreferences.service';

interface ThemeContextType {
  theme: 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'dark') => void;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

function applyDarkTheme() {
  const root = document.documentElement;
  root.classList.remove('light');
  root.classList.add('dark');
  root.style.colorScheme = 'dark';
  localStorage.setItem('theme', 'dark');
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useApp();

  useEffect(() => {
    applyDarkTheme();
  }, []);

  useEffect(() => {
    const syncDarkPreference = async () => {
      try {
        applyDarkTheme();

        if (isAuthenticated && user) {
          await userPreferencesService.saveUserTheme(user.id, 'dark');
          await userPreferencesService.saveUserPreference(user.id, 'theme', 'hasSetTheme', true);
        }
      } catch (error) {
        console.error('Error enforcing dark theme:', error);
      } finally {
        setLoading(false);
      }
    };

    void syncDarkPreference();
  }, [isAuthenticated, user]);

  const value = useMemo<ThemeContextType>(
    () => ({
      theme: 'dark',
      toggleTheme: () => {
        applyDarkTheme();
      },
      setTheme: () => {
        applyDarkTheme();
      },
      loading,
    }),
    [loading],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
