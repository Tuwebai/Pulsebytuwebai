import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ProfileRow, ProfileUpdatePayload } from '@/data/types/profile';
import {
  BUSINESS_INDUSTRY_OPTIONS,
  PROFILE_INPUT_CLASSNAME,
  PROFILE_SURFACE_CLASSNAME,
} from '@/features/profile/constants/profile.constants';
import { businessDataSchema } from '@/features/profile/profile.schemas';

type BusinessDataFormValues = {
  business_name: string;
  business_industry: string;
};

interface BusinessDataFormProps {
  isSaving: boolean;
  profile: ProfileRow;
  save: (data: ProfileUpdatePayload) => Promise<unknown>;
  website: string | null | undefined;
}

export function BusinessDataForm({ isSaving, profile, save, website }: BusinessDataFormProps) {
  const form = useForm<BusinessDataFormValues>({
    resolver: zodResolver(businessDataSchema),
    defaultValues: {
      business_name: profile.business_name ?? '',
      business_industry: profile.business_industry ?? 'otro',
    },
  });

  useEffect(() => {
    form.reset({
      business_name: profile.business_name ?? '',
      business_industry: profile.business_industry ?? 'otro',
    });
  }, [form, profile.business_industry, profile.business_name]);

  const onSubmit = async (values: BusinessDataFormValues) => {
    try {
      await save({
        business_name: values.business_name,
        business_industry: values.business_industry as ProfileUpdatePayload['business_industry'],
      });
      toast({
        title: 'Negocio actualizado',
        description: 'Los datos de tu negocio quedaron guardados.',
      });
    } catch (error) {
      toast({
        title: 'No pudimos guardar tu negocio',
        description: error instanceof Error ? error.message : 'Intentá nuevamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <section className={PROFILE_SURFACE_CLASSNAME} data-tour="profile-form-negocio">
      <div className="mb-5">
        <h3 className="text-[18px] font-medium text-[var(--text-primary)]">Mi negocio</h3>
        <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
          Estos datos ayudan a que Pulse entienda mejor tu contexto comercial.
        </p>
      </div>

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-[12px] font-normal text-[var(--text-secondary)]" htmlFor="business_name">
              Nombre del negocio
            </Label>
            <Input
              className={PROFILE_INPUT_CLASSNAME}
              id="business_name"
              {...form.register('business_name')}
            />
            <p className="text-[12px] text-[var(--danger)]">{form.formState.errors.business_name?.message}</p>
          </div>

          <div className="space-y-2">
            <Label className="text-[12px] font-normal text-[var(--text-secondary)]" htmlFor="business_industry">
              Rubro / industria
            </Label>
            <Controller
              control={form.control}
              name="business_industry"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={PROFILE_INPUT_CLASSNAME} id="business_industry">
                    <SelectValue placeholder="Selecciona un rubro" />
                  </SelectTrigger>
                  <SelectContent className="border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]">
                    {BUSINESS_INDUSTRY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-[12px] text-[var(--danger)]">{form.formState.errors.business_industry?.message}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[12px] font-normal text-[var(--text-secondary)]" htmlFor="website">
            Sitio web
          </Label>
          <Input className={PROFILE_INPUT_CLASSNAME} disabled id="website" value={website ?? ''} />
          <p className="text-[12px] text-[var(--text-secondary)]">
            Tu dominio se configura desde el equipo de TuWebAI.
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
