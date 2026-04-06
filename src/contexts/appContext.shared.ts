import { createContext } from 'react';

import type { AppContextType } from '@/contexts/appContext.types';

export const AppContext = createContext<AppContextType | undefined>(undefined);
