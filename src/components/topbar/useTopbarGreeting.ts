import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { getPulseGreeting } from '@/components/topbar/topbarGreeting.utils';

interface UseTopbarGreetingParams {
  isAdminPage: boolean;
  isClientPulseRoute: boolean;
}

export function useTopbarGreeting({
  isAdminPage,
  isClientPulseRoute,
}: UseTopbarGreetingParams) {
  const { user, getUserProjects } = useApp();

  const greeting = useMemo(() => {
    return getPulseGreeting({
      isAdminPage,
      isClientPulseRoute,
      projectCount: getUserProjects().length,
      userName: user?.full_name?.split(' ')[0] || null,
    });
  }, [getUserProjects, isAdminPage, isClientPulseRoute, user?.full_name]);

  return {
    greeting,
  };
}
