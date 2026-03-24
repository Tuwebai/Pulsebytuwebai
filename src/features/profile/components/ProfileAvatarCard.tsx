import { useRef } from 'react';
import { Camera, LoaderCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ProfileRow } from '@/data/types/profile';
import { PROFILE_AVATAR_ACCEPT } from '@/features/profile/constants/profile.constants';

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

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative mx-auto sm:mx-0">
          <Avatar className="h-20 w-20 border border-[var(--border-default)]">
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

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="truncate text-[20px] font-medium text-[var(--text-primary)]">{fullName || 'Tu perfil'}</h2>
              <p className="mt-1 truncate text-[13px] text-[var(--text-secondary)]">{email}</p>
            </div>

            <Badge className="mx-auto bg-[var(--signal-glow)] text-[var(--signal)] sm:mx-0" variant="default">
              Cliente TuWebAI
            </Badge>
          </div>

          <p className="mt-3 text-[12px] text-[var(--text-secondary)]">
            Tu foto de perfil se usa en el sidebar y en el encabezado de Pulse.
          </p>
        </div>
      </div>

      <div className="mt-4 sm:hidden">
        <Button fullWidth type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
          Cambiar foto
        </Button>
      </div>
    </section>
  );
}
