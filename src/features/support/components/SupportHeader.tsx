export default function SupportHeader() {
  return (
    <section className="rounded-[var(--cliente-card-radius)] border border-[var(--cliente-border-default)] bg-[var(--cliente-bg-surface)]/92 p-4 shadow-[var(--cliente-card-shadow)] sm:p-5">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--cliente-text-tertiary)]">
          Soporte
        </p>
        <div>
          <h1 className="text-xl font-medium text-[var(--cliente-text-primary)] sm:text-[22px]">
            Consultas y seguimiento
          </h1>
          <p className="mt-1 max-w-[620px] text-sm text-[var(--cliente-text-secondary)]">
            Envia una consulta, sigue la respuesta del equipo y retoma la conversacion desde un solo lugar.
          </p>
        </div>
      </div>
    </section>
  );
}
