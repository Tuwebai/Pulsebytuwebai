import { useCallback } from 'react';

export function useTutorialAudio(enableSounds: boolean) {
  return useCallback(
    (volume: number) => {
      if (!enableSounds) {
        return;
      }

      const audio = new Audio('/notification-sound.mp3');
      audio.volume = volume;
      audio.play().catch(() => {});
    },
    [enableSounds],
  );
}
