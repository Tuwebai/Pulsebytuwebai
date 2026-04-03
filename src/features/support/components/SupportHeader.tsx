export default function SupportHeader() {
  return (
    <section className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)]/92 p-4 shadow-2xl sm:p-5">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
          Soporte
        </p>
        <div>
          <h1 className="text-xl font-medium text-[var(--text-primary)] sm:text-[22px]">
            Consultas y seguimiento
          </h1>
          <p className="mt-1 max-w-[620px] text-sm text-[var(--text-secondary)]">
            Envía una consulta, sigue la respuesta del equipo y retoma la conversación desde un solo lugar.
          </p>
        </div>
      </div>
    </section>
  );
}
