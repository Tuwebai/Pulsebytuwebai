import { createContext } from 'react';

import type { ThemeContextType } from '@/contexts/themeContext.types';

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
