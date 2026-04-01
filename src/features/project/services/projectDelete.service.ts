import { supabase } from '@/lib/supabase';

export async function deleteProject(
  projectId: string,
  userId: string,
  userRole?: string,
): Promise<void> {
  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('created_by, approval_status')
    .eq('id', projectId)
    .single();

  if (fetchError) {
    throw new Error('No se pudo encontrar el proyecto');
  }

  let role = userRole;
  if (!role) {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new Error('No se pudo verificar el rol del usuario');
    }

    role = userData.role;
  }

  if (role === 'admin') {
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) {
      throw new Error('Error al eliminar el proyecto');
    }
    return;
  }

  if (project.created_by !== userId) {
    throw new Error('No tenés permisos para eliminar este proyecto');
  }

  if (project.approval_status !== 'rejected') {
    throw new Error('Solo podés eliminar proyectos que hayan sido rechazados');
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('created_by', userId);

  if (error) {
    throw new Error('Error al eliminar el proyecto');
  }
}
