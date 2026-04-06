import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/data/supabase/client';

export function usePulseRealtime(projectId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId) {
      return;
    }

    const channel = supabase
      .channel(`pulse-metrics-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pulse_metrics',
          filter: `project_id=eq.${projectId}`
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: ['pulse-metrics', projectId]
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);
}
