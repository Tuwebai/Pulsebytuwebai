import { Plus, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface AdminTicketsHeaderProps {
  lastUpdate?: Date;
  onCreate: () => void;
  onRefresh?: () => void;
}

export function AdminTicketsHeader({ lastUpdate, onCreate, onRefresh }: AdminTicketsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">Pulse admin</p>
        <h1 className="text-3xl font-semibold text-slate-50">Bandeja de soporte</h1>
        <p className="max-w-2xl text-sm text-slate-300">
          Revisá conversaciones, respondé más rápido y mantené el seguimiento del soporte desde un solo lugar.
        </p>
        {lastUpdate ? (
          <p className="text-xs text-slate-400">Última actualización: {lastUpdate.toLocaleString()}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {onRefresh ? (
          <Button
            variant="outline"
            onClick={onRefresh}
            className="border-slate-700 bg-slate-950/40 text-slate-200 hover:bg-slate-900 hover:text-white"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        ) : null}
        <Button
          onClick={onCreate}
          className="bg-sky-500 text-slate-950 hover:bg-sky-400"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo ticket
        </Button>
      </div>
    </div>
  );
}
