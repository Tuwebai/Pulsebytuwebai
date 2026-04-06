import { onboardingApi } from '@/api/pulse/onboardingApi';
import { validateBusinessDomain } from '@/features/pulse/utils/domainValidation';

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
    const validation = validateBusinessDomain(domain);

    if (!validation.isValid) {
      throw new Error(validation.errorMessage || 'La URL ingresada no es valida.');
    }

    await onboardingApi.saveDomainSubmission(userId, validation.normalizedDomain);

    return {
      saved: true,
      normalizedDomain: validation.normalizedDomain
    };
  },

  async complete(userId: string) {
    await onboardingApi.completeOnboarding(userId);
  }
};
