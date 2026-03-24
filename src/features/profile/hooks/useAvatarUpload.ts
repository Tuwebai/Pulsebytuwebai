import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApp } from '@/contexts/AppContext';
import { changeAvatar } from '@/features/profile/services/profile.service';

export function useAvatarUpload() {
  const queryClient = useQueryClient();
  const { user } = useApp();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      setProgress(15);
      const avatarUrl = await changeAvatar(user!.id, file);
      setProgress(100);
      return avatarUrl;
    },
    onSuccess: async (avatarUrl) => {
      queryClient.setQueryData(['profile', user?.id], (current: Record<string, unknown> | undefined) =>
        current
          ? {
              ...current,
              avatar_url: avatarUrl,
              updated_at: new Date().toISOString()
            }
          : current
      );
      await queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
    onSettled: () => {
      window.setTimeout(() => setProgress(0), 300);
    }
  });

  return {
    upload: mutation.mutateAsync,
    isUploading: mutation.isPending,
    progress,
    error: mutation.error
  };
}
