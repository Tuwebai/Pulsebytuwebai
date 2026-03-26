import { useEffect, useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';

import type { User } from '@/contexts/appContext.types';

interface UseAdminAccessGateParams {
  user: User | null;
  navigate: NavigateFunction;
  loadData: () => Promise<void>;
}

export function useAdminAccessGate({
  user,
  navigate,
  loadData,
}: UseAdminAccessGateParams) {
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const hasAdminAccess = user?.role === 'admin';

  useEffect(() => {
    if (!hasAdminAccess) {
      navigate('/dashboard');
      return;
    }

    if (initialDataLoaded) {
      return;
    }

    setInitialDataLoaded(true);
    void loadData();
  }, [hasAdminAccess, initialDataLoaded, loadData, navigate]);

  return {
    hasAdminAccess,
  };
}
