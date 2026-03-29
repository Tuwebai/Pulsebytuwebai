import type { User } from '@/contexts/appContext.types';
import { onboardingService } from '@/services/pulse/onboardingService';

const MAX_DOMAIN_REQUEST_ATTEMPTS = 2;
const DOMAIN_REQUEST_STORAGE_KEY = 'pulse-domain-request-attempts';

type WebsiteStatus = User['website_status'];

function getStorageKey(userId: string) {
  return `${DOMAIN_REQUEST_STORAGE_KEY}:${userId}`;
}

function readStoredAttempts(userId: string) {
  if (typeof window === 'undefined') {
    return 0;
  }

  const rawValue = window.localStorage.getItem(getStorageKey(userId));
  const parsedValue = Number.parseInt(rawValue ?? '0', 10);

  if (Number.isNaN(parsedValue) || parsedValue < 0) {
    return 0;
  }

  return parsedValue;
}

export function getDomainRequestAttemptCount(user: Pick<User, 'id' | 'website_submitted_at'> | null) {
  if (!user?.id) {
    return 0;
  }

  const seededAttempts = user.website_submitted_at ? 1 : 0;
  return Math.max(seededAttempts, readStoredAttempts(user.id));
}

export function saveDomainRequestAttemptCount(userId: string, attempts: number) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(getStorageKey(userId), String(attempts));
}

export function canSubmitDomainRequest(status: WebsiteStatus, attempts: number) {
  if (status === 'pending_review' || status === 'approved') {
    return false;
  }

  return attempts < MAX_DOMAIN_REQUEST_ATTEMPTS;
}

export function getRemainingDomainRequestAttempts(attempts: number) {
  return Math.max(0, MAX_DOMAIN_REQUEST_ATTEMPTS - attempts);
}

export async function submitPulseDomainRequest(userId: string, domain: string) {
  return onboardingService.saveDomain(userId, domain);
}
