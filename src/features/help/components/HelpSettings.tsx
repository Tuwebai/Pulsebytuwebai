import { Bell, BellOff, Zap } from 'lucide-react';

import { Button } from '@/core/ui/button';
import { useHelpCenterState } from '@/features/help/hooks/useHelpCenterState';

export function HelpSettings() {
  const {
    autoStart,
    showHints,
    enableSounds,
    setAutoStart,
    setShowHints,
    setEnableSounds,
  } = useHelpCenterState();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-slate-800">Auto-iniciar tutoriales</h4>
          <p className="text-sm text-slate-500">
            Iniciar automáticamente tutoriales para nuevos usuarios
          </p>
        </div>
        <Button
          variant={autoStart ? 'default' : 'outline'}
          size="sm"
          onClick={() => setAutoStart(!autoStart)}
        >
          {autoStart ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-slate-800">Mostrar hints</h4>
          <p className="text-sm text-slate-500">Mostrar consejos y sugerencias contextuales</p>
        </div>
        <Button
          variant={showHints ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowHints(!showHints)}
        >
          <Zap className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-slate-800">Sonidos de notificación</h4>
          <p className="text-sm text-slate-500">
            Reproducir sonidos para notificaciones del tutorial
          </p>
        </div>
        <Button
          variant={enableSounds ? 'default' : 'outline'}
          size="sm"
          onClick={() => setEnableSounds(!enableSounds)}
        >
          {enableSounds ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
