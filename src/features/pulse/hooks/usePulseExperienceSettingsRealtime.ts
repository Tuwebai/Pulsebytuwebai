import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/data/supabase/client';

export function usePulseExperienceSettingsRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('pulse-admin-settings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pulse_admin_settings',
          filter: 'scope=eq.global',
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: ['pulse-experience-settings'],
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
