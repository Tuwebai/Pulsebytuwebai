import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useUserProject } from '@/features/project/hooks/useUserProject';
import { usePulseMetrics } from './usePulseMetrics';
import { usePulsePeriod } from './usePulsePeriod';
import { getDaysInRange } from '../services/pulse.service';

export function usePulsePageState() {
  const navigate = useNavigate();
  const { authReady, isAuthenticated, user } = useApp();
  const { period, setPeriod } = usePulsePeriod();
  const { projectId, domain, ga4PropertyId, loading: projectLoading, projectsReady } = useUserProject();
  const { data, isLoading } = usePulseMetrics(projectId, period);

  const projectHydrating = isAuthenticated && authReady && !projectsReady;
  const loading = projectHydrating || projectLoading || isLoading;
  const hasProject = Boolean(projectId);
  const hasGa4 = Boolean(ga4PropertyId);
  const averagePerDay = data ? Math.round(data.visits / getDaysInRange(period)) : null;
  const websitePendingReview = user?.website_status === 'pending_review' && Boolean(user.website);
  const websiteApprovedWithoutData = user?.website_status === 'approved' && Boolean(user.website);

  return {
    averagePerDay,
    data,
    domain,
    ga4PropertyId,
    hasGa4,
    hasProject,
    loading,
    onOpenSettings: () => navigate('/dashboard/configuracion'),
    onOpenSite: () => {
      if (typeof window !== 'undefined' && domain) {
        window.open(`https://${domain}`, '_blank', 'noopener,noreferrer');
      }
    },
    period,
    setPeriod,
    websiteApprovedWithoutData,
    websitePendingReview,
  };
}
