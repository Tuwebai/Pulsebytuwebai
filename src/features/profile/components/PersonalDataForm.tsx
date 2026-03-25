import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ProfileRow, ProfileUpdatePayload } from '@/data/types/profile';
import {
  PROFILE_INPUT_CLASSNAME,
  PROFILE_SURFACE_CLASSNAME,
} from '@/features/profile/constants/profile.constants';
import { personalDataSchema } from '@/features/profile/profile.schemas';

type PersonalDataFormValues = {
  full_name: string;
  phone: string;
};

interface PersonalDataFormProps {
  email: string;
  isSaving: boolean;
  profile: ProfileRow;
  save: (data: ProfileUpdatePayload) => Promise<unknown>;
}

export function PersonalDataForm({ email, isSaving, profile, save }: PersonalDataFormProps) {
  const form = useForm<PersonalDataFormValues>({
    resolver: zodResolver(personalDataSchema),
    defaultValues: {
      full_name: profile.full_name ?? '',
      phone: profile.phone ?? '',
    },
  });

  useEffect(() => {
    form.reset({
      full_name: profile.full_name ?? '',
      phone: profile.phone ?? '',
    });
  }, [form, profile.full_name, profile.phone]);

  const onSubmit = async (values: PersonalDataFormValues) => {
    try {
      await save(values);
      toast({
        title: 'Datos actualizados',
        description: 'Tus datos personales quedaron guardados.',
      });
    } catch (error) {
      toast({
        title: 'No pudimos guardar tus datos',
        description: error instanceof Error ? error.message : 'Intentá nuevamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <section className={PROFILE_SURFACE_CLASSNAME} data-tour="profile-form-datos">
      <div className="mb-5">
        <h3 className="text-[18px] font-medium text-[var(--text-primary)]">Datos personales</h3>
        <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
          Actualizá tu información de contacto para mantener tu cuenta al día.
        </p>
      </div>

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-[12px] font-normal text-[var(--text-secondary)]" htmlFor="full_name">
              Nombre completo
            </Label>
            <Input autoComplete="name" className={PROFILE_INPUT_CLASSNAME} id="full_name" {...form.register('full_name')} />
            <p className="text-[12px] text-[var(--danger)]">{form.formState.errors.full_name?.message}</p>
          </div>

          <div className="space-y-2">
            <Label className="text-[12px] font-normal text-[var(--text-secondary)]" htmlFor="phone">
              Teléfono
            </Label>
            <Input
              autoComplete="tel"
              className={PROFILE_INPUT_CLASSNAME}
              id="phone"
              inputMode="tel"
              placeholder="+54 9 ..."
              {...form.register('phone')}
            />
            <p className="text-[12px] text-[var(--danger)]">{form.formState.errors.phone?.message}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[12px] font-normal text-[var(--text-secondary)]" htmlFor="email">
            Email
          </Label>
          <Input className={PROFILE_INPUT_CLASSNAME} disabled id="email" value={email} />
          <p className="text-[12px] text-[var(--text-secondary)]">
            Tu email de acceso no se edita desde esta pantalla.
          </p>
        </div>

        {form.formState.isDirty ? (
          <div className="pt-2">
            <Button disabled={isSaving} type="submit">
              <Save className="h-4 w-4" />
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        ) : null}
      </form>
    </section>
  );
}
