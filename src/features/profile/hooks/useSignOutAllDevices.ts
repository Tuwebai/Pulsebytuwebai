import { useMutation } from '@tanstack/react-query';
import { closeAllSessions } from '@/features/profile/services/profile.service';

export function useSignOutAllDevices() {
  const mutation = useMutation({
    mutationFn: closeAllSessions
  });

  return {
    signOutAllDevices: mutation.mutateAsync,
    isSigningOut: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess
  };
}
