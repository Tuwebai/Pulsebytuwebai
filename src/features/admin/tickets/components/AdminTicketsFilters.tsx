import { Search, SortAsc, SortDesc } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { TicketFilters } from '@/features/admin/tickets/types/adminTicket.types';

interface AdminTicketsFiltersProps {
  filters: TicketFilters;
  onChange: (updates: Partial<TicketFilters>) => void;
}

export function AdminTicketsFilters({ filters, onChange }: AdminTicketsFiltersProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-[0_12px_30px_rgba(2,6,23,0.28)]">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(180px,1fr)_minmax(180px,1fr)_140px]">
        <div className="space-y-2">
          <Label htmlFor="ticket-search" className="text-slate-200">Buscar</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
            <Input
              id="ticket-search"
              value={filters.searchTerm}
              placeholder="Buscá por asunto, descripción o correo"
              onChange={(event) => onChange({ searchTerm: event.target.value })}
              className="border-white/10 bg-slate-950/60 pl-10 text-slate-100 placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-200">Estado</Label>
          <Select value={filters.status} onValueChange={(value) => onChange({ status: value })}>
            <SelectTrigger className="border-white/10 bg-slate-950/60 text-slate-100">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="abierto">Abierto</SelectItem>
              <SelectItem value="en_progreso">En progreso</SelectItem>
              <SelectItem value="resuelto">Resuelto</SelectItem>
              <SelectItem value="cerrado">Cerrado</SelectItem>
              <SelectItem value="respondido">Respondido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-200">Prioridad</Label>
          <Select value={filters.priority} onValueChange={(value) => onChange({ priority: value })}>
            <SelectTrigger className="border-white/10 bg-slate-950/60 text-slate-100">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="low">Baja</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-200">Orden</Label>
          <button
            type="button"
            onClick={() => onChange({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
            className="flex h-10 w-full items-center justify-center rounded-xl border border-white/10 bg-slate-950/60 text-slate-100 transition hover:border-sky-400/30 hover:bg-slate-900"
          >
            {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </section>
  );
}
