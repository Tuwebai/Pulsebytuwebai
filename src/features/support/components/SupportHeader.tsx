export default function SupportHeader() {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/92 p-4 shadow-[0_18px_40px_rgba(2,6,23,0.24)] sm:p-5">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Soporte</p>
        <div>
          <h1 className="text-xl font-medium text-slate-50 sm:text-[22px]">Consultas y seguimiento</h1>
          <p className="mt-1 max-w-[620px] text-sm text-slate-400">
            Enviá una consulta, seguí la respuesta del equipo y retomá la conversación desde un solo lugar.
          </p>
        </div>
      </div>
    </section>
  );
}
