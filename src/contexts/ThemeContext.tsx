import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useApp } from './AppContext';
import { userPreferencesService } from '@/lib/services/userPreferencesService';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const root = document.documentElement;

  if (root.classList.contains('dark')) {
    return 'dark';
  }

  if (root.classList.contains('light')) {
    return 'light';
  }

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme;
  }

  return 'dark';
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<'light' | 'dark'>(getInitialTheme);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useApp();

  useEffect(() => {
    const loadUserTheme = async () => {
      try {
        let userTheme: 'light' | 'dark' = getInitialTheme();

        if (isAuthenticated && user) {
          const savedTheme = await userPreferencesService.getUserTheme(user.id);
          userTheme = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark';
        } else {
          userTheme = getInitialTheme();
        }

        setThemeState(userTheme);

        if (isAuthenticated && user) {
          await userPreferencesService.saveUserTheme(user.id, userTheme);
          await userPreferencesService.saveUserPreference(user.id, 'theme', 'hasSetTheme', true);
        } else {
          localStorage.setItem('theme', userTheme);
        }
      } catch (error) {
        console.error('Error loading user theme:', error);
        setThemeState('dark');
      }

      setLoading(false);
    };

    loadUserTheme();
  }, [isAuthenticated, user]);

  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove('light', 'dark');
    root.style.transition = 'background-color 0.2s ease, color 0.2s ease';
    root.style.colorScheme = theme;
    root.classList.add(theme);

    localStorage.setItem('theme', theme);

    if (isAuthenticated && user && !loading) {
      userPreferencesService.saveUserTheme(user.id, theme).catch((error) => {
        console.error('Error saving user theme:', error);
      });
    }

    window.setTimeout(() => {
      root.style.transition = '';
    }, 200);
  }, [theme, isAuthenticated, user, loading]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
