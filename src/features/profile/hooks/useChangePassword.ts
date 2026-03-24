import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { changePassword } from '@/features/profile/services/profile.service';

export function useChangePassword() {
  const mutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      changePassword(currentPassword, newPassword)
  });

  useEffect(() => {
    if (!mutation.isSuccess) {
      return;
    }

    const timeout = window.setTimeout(() => mutation.reset(), 3000);
    return () => window.clearTimeout(timeout);
  }, [mutation]);

  return {
    changePassword: mutation.mutateAsync,
    isChanging: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess
  };
}
