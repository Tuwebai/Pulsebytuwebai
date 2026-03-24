import { AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
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
import { useRequestAccountDeletion } from '@/features/profile/hooks/useRequestAccountDeletion';

export function DangerZone() {
  const { requestDeletion, isRequesting } = useRequestAccountDeletion();

  const handleRequestDeletion = async () => {
    try {
      await requestDeletion();
      toast({
        title: 'Solicitud enviada',
        description: 'El equipo te contactará para continuar con la baja.'
      });
    } catch (error) {
      toast({
        title: 'No pudimos enviar tu solicitud',
        description: error instanceof Error ? error.message : 'Intentalo nuevamente.',
        variant: 'destructive'
      });
    }
  };

  return (
    <section className="rounded-[var(--radius-xl)] border border-[rgba(255,92,122,0.3)] bg-[var(--bg-surface)] p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-[var(--danger-dim)] p-2 text-[var(--danger)]">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-medium text-[var(--danger)]">Zona de peligro</h3>
          <p className="mt-2 text-[13px] leading-5 text-[var(--text-secondary)]">
            Enviamos tu solicitud al equipo de TuWebAI. No eliminamos tu cuenta de forma automática.
          </p>
        </div>
      </div>

      <div className="mt-5">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="border-[var(--danger)] text-[var(--danger)] hover:bg-[var(--danger-dim)]" type="button" variant="outline">
              <Trash2 className="h-4 w-4" />
              Solicitar baja de cuenta
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]">
            <AlertDialogHeader>
              <AlertDialogTitle>¿Querés solicitar la baja de tu cuenta?</AlertDialogTitle>
              <AlertDialogDescription className="text-[var(--text-secondary)]">
                El equipo de TuWebAI va a revisar tu solicitud y te va a contactar.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-[var(--border-default)] bg-transparent text-[var(--text-primary)]">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction className="bg-[var(--danger)] text-white hover:opacity-90" onClick={() => void handleRequestDeletion()}>
                {isRequesting ? 'Enviando...' : 'Sí, solicitar baja'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  );
}
