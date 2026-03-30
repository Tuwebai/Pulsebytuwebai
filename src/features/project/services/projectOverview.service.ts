import { userService } from '@/features/auth/services/user.service';
import { supabase } from '@/lib/supabase';

export interface ProjectCreatorInfo {
  full_name: string;
  email: string;
}

export async function getTargetUserName(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('users')
    .select('full_name, email')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return 'Usuario';
  }

  return data.full_name || data.email || 'Usuario';
}

export async function getProjectCreatorMap(creatorIds: string[]): Promise<Record<string, ProjectCreatorInfo>> {
  const creators = await Promise.all(
    creatorIds.map(async (creatorId) => {
      try {
        const creator = await userService.getUserById(creatorId);

        if (!creator) {
          return [creatorId, { full_name: 'Usuario no disponible', email: 'sin-email@example.com' }] as const;
        }

        return [
          creatorId,
          {
            full_name: creator.full_name || creator.email || 'Usuario',
            email: creator.email || 'sin-email@example.com',
          },
        ] as const;
      } catch {
        return [creatorId, { full_name: 'Usuario no disponible', email: 'sin-email@example.com' }] as const;
      }
    })
  );

  return Object.fromEntries(creators);
}

export async function deleteProjectById(projectId: string) {
  const { error } = await supabase.from('projects').delete().eq('id', projectId);

  if (error) {
    throw error;
  }
}
