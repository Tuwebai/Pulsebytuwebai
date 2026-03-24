import { LoaderCircle, Shield } from 'lucide-react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
import { ProfileAvatarCard } from '@/features/profile/components/ProfileAvatarCard';
import { ProfileTabsNav } from '@/features/profile/components/ProfileTabsNav';
import { PersonalDataForm } from '@/features/profile/components/PersonalDataForm';
import { BusinessDataForm } from '@/features/profile/components/BusinessDataForm';
import { SecuritySection } from '@/features/profile/components/SecuritySection';
import { DangerZone } from '@/features/profile/components/DangerZone';
import { useAvatarUpload } from '@/features/profile/hooks/useAvatarUpload';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useUpdateProfile } from '@/features/profile/hooks/useUpdateProfile';
import { useSessionStorageState } from '@/hooks/useSessionStorageState';
import { toast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user } = useApp();
  const { profile, isLoading, error } = useProfile();
  const { upload, isUploading } = useAvatarUpload();
  const { save, isSaving } = useUpdateProfile();
  const [activeTab, setActiveTab] = useSessionStorageState(`pulse:perfil:${user?.id ?? 'anon'}:active-tab`, 'datos');

  if (isLoading || !user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-[880px] items-center justify-center px-4 py-10">
        <div className="flex items-center gap-3 rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-5 py-4 text-[var(--text-secondary)]">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Cargando tu perfil...
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-[880px] px-4 py-6">
        <section className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[var(--warning-dim)] p-2 text-[var(--warning)]">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-[18px] font-medium text-[var(--text-primary)]">No pudimos cargar tu perfil</h1>
              <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
                Proba recargando la pagina o volve a intentarlo en unos segundos.
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[880px] flex-col gap-4 px-4 py-4 md:px-6 md:py-6">
      <header className="space-y-1">
        <h1 className="text-[22px] font-medium text-[var(--text-primary)]">Mi Perfil</h1>
        <p className="text-[13px] text-[var(--text-secondary)]">
          Gestiona tu informacion personal y la identidad de tu negocio dentro de Pulse.
        </p>
      </header>

      <ProfileAvatarCard
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
              description: uploadError instanceof Error ? uploadError.message : 'Intentalo nuevamente.',
              variant: 'destructive',
            });
          }
        }}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <ProfileTabsNav />

        <TabsContent value="datos" className="mt-0">
          <PersonalDataForm email={profile.email} isSaving={isSaving} profile={profile} save={save} />
        </TabsContent>

        <TabsContent value="negocio" className="mt-0">
          <BusinessDataForm isSaving={isSaving} profile={profile} save={save} website={user.website} />
        </TabsContent>

        <TabsContent value="seguridad" className="mt-0">
          <SecuritySection />
        </TabsContent>

        <TabsContent value="cuenta" className="mt-0">
          <DangerZone />
        </TabsContent>
      </Tabs>
    </div>
  );
}
