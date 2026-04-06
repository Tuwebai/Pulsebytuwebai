import { useContext } from 'react';

import { ThemeContext } from '@/contexts/themeContext.shared';
import type { ThemeContextType } from '@/contexts/themeContext.types';

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
