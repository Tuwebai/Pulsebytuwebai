import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { AlertTriangle, Eye, EyeOff, LogOut, Save } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { passwordSchema } from '@/features/profile/profile.schemas';
import { useApp } from '@/contexts/AppContext';
import { useChangePassword } from '@/features/profile/hooks/useChangePassword';
import { useSignOutAllDevices } from '@/features/profile/hooks/useSignOutAllDevices';

type PasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function SecuritySection() {
  const navigate = useNavigate();
  const { logout } = useApp();
  const { changePassword, isChanging } = useChangePassword();
  const { signOutAllDevices, isSigningOut } = useSignOutAllDevices();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (values: PasswordFormValues) => {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      toast({
        title: 'Contraseña actualizada',
        description: 'Tu contraseña se actualizó correctamente.'
      });
      form.reset();
    } catch (error) {
      toast({
        title: 'No pudimos actualizar la contraseña',
        description: error instanceof Error ? error.message : 'Intentalo nuevamente.',
        variant: 'destructive'
      });
    }
  };

  const handleSignOutAllDevices = async () => {
    try {
      await signOutAllDevices();
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      toast({
        title: 'No pudimos cerrar tus sesiones',
        description: error instanceof Error ? error.message : 'Intentalo nuevamente.',
        variant: 'destructive'
      });
    }
  };

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-6">
      <div className="mb-5">
        <h3 className="text-[18px] font-medium text-[var(--text-primary)]">Seguridad</h3>
        <p className="mt-1 text-[13px] text-[var(--text-secondary)]">Protegé tu acceso a Pulse y tus sesiones activas.</p>
      </div>

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label className="text-[12px] font-normal text-[var(--text-secondary)]" htmlFor="currentPassword">
            Contraseña actual
          </Label>
          <div className="relative">
            <Input id="currentPassword" type={showCurrentPassword ? 'text' : 'password'} {...form.register('currentPassword')} />
            <button className="absolute inset-y-0 right-3 text-[var(--text-secondary)]" type="button" onClick={() => setShowCurrentPassword((value) => !value)}>
              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-[12px] text-[var(--danger)]">{form.formState.errors.currentPassword?.message}</p>
        </div>

        <div className="space-y-2">
          <Label className="text-[12px] font-normal text-[var(--text-secondary)]" htmlFor="newPassword">
            Nueva contraseña
          </Label>
          <div className="relative">
            <Input id="newPassword" type={showNewPassword ? 'text' : 'password'} {...form.register('newPassword')} />
            <button className="absolute inset-y-0 right-3 text-[var(--text-secondary)]" type="button" onClick={() => setShowNewPassword((value) => !value)}>
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-[12px] text-[var(--danger)]">{form.formState.errors.newPassword?.message}</p>
        </div>

        <div className="space-y-2">
          <Label className="text-[12px] font-normal text-[var(--text-secondary)]" htmlFor="confirmPassword">
            Confirmar contraseña
          </Label>
          <div className="relative">
            <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} {...form.register('confirmPassword')} />
            <button className="absolute inset-y-0 right-3 text-[var(--text-secondary)]" type="button" onClick={() => setShowConfirmPassword((value) => !value)}>
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-[12px] text-[var(--danger)]">{form.formState.errors.confirmPassword?.message}</p>
        </div>

        <Button disabled={isChanging} type="submit">
          <Save className="h-4 w-4" />
          {isChanging ? 'Actualizando...' : 'Actualizar contraseña'}
        </Button>
      </form>

      <div className="mt-8 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-[var(--warning-dim)] p-2 text-[var(--warning)]">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-medium text-[var(--text-primary)]">Sesiones</p>
            <p className="mt-1 text-[13px] leading-5 text-[var(--text-secondary)]">
              Cerrá sesión en todos tus dispositivos si sospechás que alguien accedió a tu cuenta.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline">
                <LogOut className="h-4 w-4" />
                Cerrar todas las sesiones
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]">
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription className="text-[var(--text-secondary)]">
                  Vas a cerrar todas las sesiones activas y ser redirigido al login.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-[var(--border-default)] bg-transparent text-[var(--text-primary)]">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction className="bg-[var(--signal)] text-white hover:opacity-90" onClick={() => void handleSignOutAllDevices()}>
                  {isSigningOut ? 'Cerrando...' : 'Sí, cerrar sesiones'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </section>
  );
}
