import { useEffect } from 'react';
import { supabase } from '@/data/supabase/client';

interface UseAdminTicketsRealtimeParams {
  enabled: boolean;
  onRefresh: () => void;
}

export function useAdminTicketsRealtime({
  enabled,
  onRefresh,
}: UseAdminTicketsRealtimeParams) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const channel = supabase
      .channel('admin-tickets-live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
        },
        () => onRefresh(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, onRefresh]);
}
