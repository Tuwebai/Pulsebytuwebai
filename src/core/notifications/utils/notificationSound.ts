type AudioContextConstructor = typeof AudioContext;

type WindowWithOptionalWebkitAudio = Window &
  typeof globalThis & {
    webkitAudioContext?: AudioContextConstructor;
  };

const NOTIFICATION_GAIN_MAX = 0.18;
const FIRST_TONE_FREQUENCY = 520;
const SECOND_TONE_FREQUENCY = 780;
const TONE_DURATION_SECONDS = 0.18;
const TONE_GAP_SECONDS = 0.06;

let notificationAudioContext: AudioContext | null = null;

function getAudioContextConstructor(): AudioContextConstructor | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const audioWindow = window as WindowWithOptionalWebkitAudio;
  return audioWindow.AudioContext ?? audioWindow.webkitAudioContext ?? null;
}

function getNotificationAudioContext(): AudioContext | null {
  if (notificationAudioContext) {
    return notificationAudioContext;
  }

  const AudioContextClass = getAudioContextConstructor();

  if (!AudioContextClass) {
    return null;
  }

  notificationAudioContext = new AudioContextClass();
  return notificationAudioContext;
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function scheduleTone(
  context: AudioContext,
  startTime: number,
  frequency: number,
  peakGain: number,
  durationSeconds: number,
) {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  const attackEnd = startTime + 0.025;
  const releaseStart = startTime + durationSeconds - 0.08;
  const stopTime = startTime + durationSeconds;

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.linearRampToValueAtTime(peakGain, attackEnd);
  gainNode.gain.exponentialRampToValueAtTime(Math.max(peakGain * 0.45, 0.0001), releaseStart);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, stopTime);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(stopTime);
  oscillator.onended = () => {
    oscillator.disconnect();
    gainNode.disconnect();
  };
}

export function playPulseNotificationSound() {
  if (prefersReducedMotion()) {
    return;
  }

  const context = getNotificationAudioContext();

  if (!context || context.state === 'suspended') {
    return;
  }

  const startTime = context.currentTime + 0.01;

  scheduleTone(context, startTime, FIRST_TONE_FREQUENCY, 0.12, TONE_DURATION_SECONDS);
  scheduleTone(
    context,
    startTime + TONE_DURATION_SECONDS + TONE_GAP_SECONDS,
    SECOND_TONE_FREQUENCY,
    NOTIFICATION_GAIN_MAX,
    TONE_DURATION_SECONDS,
  );
}
