import { useCallback, useState } from 'react';

import type { AdminPaymentRecord, AdminProjectRecord } from '@/api/admin/adminDashboard.api';
import { toast } from '@/hooks/use-toast';
import {
  getAdminDashboardData,
  type AdminDashboardTicket,
} from '@/features/admin/services/adminDashboardService';
import type { AdminManagedUser } from '@/features/admin/users/types/adminUser';

interface UseAdminDashboardPageParams {
  setUsers: React.Dispatch<React.SetStateAction<AdminManagedUser[]>>;
}

export function useAdminDashboardPage({ setUsers }: UseAdminDashboardPageParams) {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<AdminProjectRecord[]>([]);
  const [tickets, setTickets] = useState<AdminDashboardTicket[]>([]);
  const [payments, setPayments] = useState<AdminPaymentRecord[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const dashboardData = await getAdminDashboardData();

      setUsers(dashboardData.users);
      setProjects(dashboardData.projects);
      setTickets(dashboardData.tickets);
      setPayments(dashboardData.payments);
    } catch (error) {
      console.error('Error fatal cargando datos del admin:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setLastUpdate(new Date());
    }
  }, [setUsers]);

  const refreshData = useCallback(async () => {
    await loadData();
    setLastUpdate(new Date());
    toast({ title: 'Actualizado', description: 'Datos actualizados correctamente.' });
  }, [loadData]);

  return {
    loading,
    projects,
    tickets,
    payments,
    setPayments,
    lastUpdate,
    loadData,
    refreshData,
  };
}
