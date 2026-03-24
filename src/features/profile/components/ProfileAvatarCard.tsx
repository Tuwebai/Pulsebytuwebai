import { useRef } from 'react';
import { Camera, LoaderCircle, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ProfileRow } from '@/data/types/profile';
import {
  PROFILE_AVATAR_ACCEPT,
  PROFILE_SURFACE_CLASSNAME,
} from '@/features/profile/constants/profile.constants';

interface ProfileAvatarCardProps {
  email: string;
  fullName: string | null;
  isUploading: boolean;
  onUpload: (file: File) => Promise<void>;
  profile: ProfileRow;
}

function getInitials(fullName: string | null, email: string) {
  if (fullName?.trim()) {
    return fullName
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }

  return email.slice(0, 2).toUpperCase();
}

export function ProfileAvatarCard({ email, fullName, isUploading, onUpload, profile }: ProfileAvatarCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileReady = Boolean(profile.full_name?.trim() && profile.business_name?.trim());

  return (
    <section className={PROFILE_SURFACE_CLASSNAME}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative mx-auto sm:mx-0">
            <Avatar className="h-20 w-20 border border-[var(--signal-border)] shadow-[0_0_0_1px_var(--signal-glow),0_18px_36px_-24px_var(--signal)]">
              <AvatarImage alt={fullName ?? email} className="object-cover" src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="bg-[var(--signal-glow)] text-[18px] font-medium text-[var(--text-primary)]">
                {getInitials(fullName, email)}
              </AvatarFallback>
            </Avatar>

            <button
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-white transition-colors hover:bg-black/45 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isUploading}
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Camera className="h-4 w-4" />}
            </button>

            <input
              ref={fileInputRef}
              accept={PROFILE_AVATAR_ACCEPT}
              className="hidden"
              type="file"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void onUpload(file);
                }
                event.currentTarget.value = '';
              }}
            />
          </div>

          <div className="min-w-0 text-center sm:text-left">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <h2 className="truncate text-[22px] font-medium text-[var(--text-primary)]">{fullName || 'Tu perfil'}</h2>
              <Badge className="mx-auto bg-[var(--signal-glow)] text-[var(--signal)] sm:mx-0" variant="default">
                Cliente TuWebAI
              </Badge>
            </div>

            <p className="mt-1 truncate text-[13px] text-[var(--text-secondary)]">{email}</p>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <div className="rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-1 text-[12px] text-[var(--text-secondary)]">
                Tu avatar se replica en todo Pulse
              </div>
              <div className="rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-1 text-[12px] text-[var(--text-secondary)]">
                {profileReady ? 'Perfil listo para operar' : 'Completa tus datos de negocio'}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center lg:justify-end">
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Sparkles className="h-4 w-4" />
            {isUploading ? 'Subiendo foto...' : 'Actualizar foto'}
          </Button>
        </div>
      </div>
    </section>
  );
}
