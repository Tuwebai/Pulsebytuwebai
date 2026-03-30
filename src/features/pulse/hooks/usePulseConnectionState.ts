import type { User } from '@/contexts/appContext.types';

interface PulseConnectionStateInput {
  domain: string | null;
  ga4PropertyId: string | null;
  hasMetricsData: boolean;
  projectId: string | null;
  website: User['website'];
  websiteStatus: User['website_status'];
}

export type PulseConnectionState =
  | 'missing_site'
  | 'pending_review'
  | 'approved_pending_connection'
  | 'connected_no_data'
  | 'connected_with_data';

export function resolvePulseConnectionState({
  domain,
  ga4PropertyId,
  hasMetricsData,
  projectId,
  website,
  websiteStatus,
}: PulseConnectionStateInput): PulseConnectionState {
  const hasWebsite = Boolean(website);
  const hasProject = Boolean(projectId);
  const hasGa4 = Boolean(ga4PropertyId);

  if (websiteStatus === 'pending_review' && hasWebsite) {
    return 'pending_review';
  }

  if (websiteStatus === 'approved' && (!hasProject || !domain || !hasGa4)) {
    return 'approved_pending_connection';
  }

  if (hasProject && hasGa4 && hasMetricsData) {
    return 'connected_with_data';
  }

  if (hasProject && hasGa4) {
    return 'connected_no_data';
  }

  return 'missing_site';
}
