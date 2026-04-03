import { useEffect } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
import { PulseFeedbackState } from '@/core/components';
import { ProfileAvatarCard } from '@/features/profile/components/ProfileAvatarCard';
import { ProfileTabsNav } from '@/features/profile/components/ProfileTabsNav';
import { PersonalDataForm } from '@/features/profile/components/PersonalDataForm';
import { BusinessDataForm } from '@/features/profile/components/BusinessDataForm';
import { SecuritySection } from '@/features/profile/components/SecuritySection';
import { DangerZone } from '@/features/profile/components/DangerZone';
import { useAvatarUpload } from '@/features/profile/hooks/useAvatarUpload';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useUpdateProfile } from '@/features/profile/hooks/useUpdateProfile';
import { PRODUCT_TOUR_STEP_CHANGE_EVENT } from '@/features/product-tour/services/productTour.service';
import type { ProductTourStep } from '@/features/product-tour/types/productTour.types';
import { useSessionStorageState } from '@/core/hooks/useSessionStorageState';
import { toast } from '@/hooks/use-toast';
import { getDisplayAvatar } from '@/lib/identity/userIdentity';

export default function ProfilePage() {
  const { user } = useApp();
  const { profile, isLoading, error } = useProfile();
  const { upload, isUploading } = useAvatarUpload();
  const { save, isSaving } = useUpdateProfile();
  const [activeTab, setActiveTab] = useSessionStorageState(`pulse:perfil:${user?.id ?? 'anon'}:active-tab`, 'datos');

  useEffect(() => {
    const handleTourStepChange = (event: Event) => {
      const step = (event as CustomEvent<ProductTourStep | null>).detail;

      if (!step || step.scope !== 'profile' || !step.tabValue) {
        return;
      }

      setActiveTab(step.tabValue);
    };

    window.addEventListener(PRODUCT_TOUR_STEP_CHANGE_EVENT, handleTourStepChange);

    return () => {
      window.removeEventListener(PRODUCT_TOUR_STEP_CHANGE_EVENT, handleTourStepChange);
    };
  }, [setActiveTab]);

  if (isLoading || !user) {
    return (
      <PulseFeedbackState
        className="min-h-[60vh] max-w-[880px] px-4 py-10"
        description="Estamos preparando tus datos de cuenta y negocio dentro de Pulse."
        surfaceClassName="max-w-[560px]"
        title="Cargando tu perfil"
        variant="loading"
      />
    );
  }

  if (error || !profile) {
    return (
      <PulseFeedbackState
        className="max-w-[880px] px-4 py-6"
        description="Probá recargando la página o volvé a intentarlo en unos segundos."
        primaryAction={{ label: 'Recargar página', onClick: () => window.location.reload() }}
        surfaceClassName="max-w-[560px]"
        title="No pudimos cargar tu perfil"
        variant="error"
      />
    );
  }

  const displayAvatar = getDisplayAvatar(profile, user);

  return (
    <div className="mx-auto flex w-full max-w-[880px] flex-col gap-4 px-4 py-4 md:px-6 md:py-6" data-tour="profile-root">
      <header className="space-y-1" data-tour="profile-header">
        <h1 className="text-[22px] font-medium text-[var(--text-primary)]">Mi Perfil</h1>
        <p className="text-[13px] text-[var(--text-secondary)]">
          Gestioná tu información personal y la identidad de tu negocio dentro de Pulse.
        </p>
      </header>

      <div data-tour="profile-avatar-card">
        <ProfileAvatarCard
          avatarUrl={displayAvatar}
          email={profile.email}
          fullName={profile.full_name}
          isUploading={isUploading}
          profile={profile}
          onUpload={async (file) => {
            try {
              await upload(file);
              toast({
                title: 'Avatar actualizado',
                description: 'Tu foto de perfil ya se ve en Pulse.',
              });
            } catch (uploadError) {
              toast({
                title: 'No pudimos subir tu avatar',
                description: uploadError instanceof Error ? uploadError.message : 'Intentá nuevamente.',
                variant: 'destructive',
              });
            }
          }}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4" data-tour="profile-tabs">
        <ProfileTabsNav />

        <TabsContent value="datos" className="mt-0" data-tour="profile-panel-datos">
          <PersonalDataForm email={profile.email} isSaving={isSaving} profile={profile} save={save} />
        </TabsContent>

        <TabsContent value="negocio" className="mt-0" data-tour="profile-panel-negocio">
          <BusinessDataForm isSaving={isSaving} profile={profile} save={save} website={user.website} />
        </TabsContent>

        <TabsContent value="seguridad" className="mt-0" data-tour="profile-panel-seguridad">
          <SecuritySection />
        </TabsContent>

        <TabsContent value="cuenta" className="mt-0" data-tour="profile-panel-cuenta">
          <DangerZone />
        </TabsContent>
      </Tabs>
    </div>
  );
}
