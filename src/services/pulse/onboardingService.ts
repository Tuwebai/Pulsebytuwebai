import { onboardingApi } from '@/api/pulse/onboardingApi';

function normalizeDomain(input: string): string {
  const trimmed = input.trim();

  if (!trimmed) {
    return '';
  }

  return trimmed
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/+$/, '');
}

export const onboardingService = {
  async getState(userId: string) {
    const [user, project] = await Promise.all([
      onboardingApi.getUserSnapshot(userId),
      onboardingApi.getLatestProject(userId)
    ]);

    return {
      user,
      project,
      domain: project?.domain || user?.website || ''
    };
  },

  async saveDomain(userId: string, domain: string) {
    const normalizedDomain = normalizeDomain(domain);

    if (!normalizedDomain) {
      return {
        saved: false,
        normalizedDomain: ''
      };
    }

    await onboardingApi.saveDomain(userId, normalizedDomain);

    return {
      saved: true,
      normalizedDomain
    };
  },

  async complete(userId: string) {
    await onboardingApi.completeOnboarding(userId);
  }
};
