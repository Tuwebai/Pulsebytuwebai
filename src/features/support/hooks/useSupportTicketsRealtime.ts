import { useEffect } from 'react';
import { supabase } from '@/data/supabase/client';

interface UseSupportTicketsRealtimeParams {
  enabled: boolean;
  onRefresh: () => void;
  userId: string | null;
}

export function useSupportTicketsRealtime({
  enabled,
  onRefresh,
  userId,
}: UseSupportTicketsRealtimeParams) {
  useEffect(() => {
    if (!enabled || !userId) {
      return;
    }

    const channel = supabase
      .channel(`support-tickets-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: `user_id=eq.${userId}`,
        },
        () => onRefresh(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, onRefresh, userId]);
}
