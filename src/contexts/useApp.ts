import { useContext } from 'react';

import { AppContext } from '@/contexts/appContext.shared';
import { defaultAppContext } from '@/contexts/appContext.default';

export function useApp() {
  const context = useContext(AppContext);

  if (context === undefined) {
    return defaultAppContext;
  }

  return context;
}
