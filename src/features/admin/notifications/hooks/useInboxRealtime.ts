import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useInboxRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('admin-inbox-operational-events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'operational_events',
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: ['admin-inbox'] });
          void queryClient.invalidateQueries({ queryKey: ['admin-inbox-counts'] });
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'operational_events',
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: ['admin-inbox'] });
          void queryClient.invalidateQueries({ queryKey: ['admin-inbox-counts'] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
