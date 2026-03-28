import { supabase } from '@/lib/supabase';

interface AdminProjectTrackingRow {
  id: string;
  name: string;
  status: string | null;
  priority: string | null;
  progress: number | null;
  completion_percentage: number | null;
  approval_status: string | null;
  updated_at: string;
  start_date: string | null;
  end_date: string | null;
  fases: unknown;
  tareas: unknown;
}

type AdminProjectTrackingStoredPhase = Record<string, unknown>;
type AdminProjectTrackingStoredTask = Record<string, unknown>;

export async function fetchAdminProjectTracking(projectId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select(
      'id, name, status, priority, progress, completion_percentage, approval_status, updated_at, start_date, end_date, fases, tareas',
    )
    .eq('id', projectId)
    .single();

  if (error) {
    throw error;
  }

  return data as AdminProjectTrackingRow;
}

export async function updateAdminProjectTrackingPhases(
  projectId: string,
  phases: AdminProjectTrackingStoredPhase[],
): Promise<void> {
  await updateAdminProjectTrackingProject(projectId, { fases: phases });
}

export async function updateAdminProjectTrackingProject(
  projectId: string,
  payload: {
    fases?: AdminProjectTrackingStoredPhase[];
    tareas?: AdminProjectTrackingStoredTask[];
  },
): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId);

  if (error) {
    throw error;
  }
}
