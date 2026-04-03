export function AdminProjectTrackingReadyState() {
  return (
    <>
      <section className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)]/95 p-6 shadow-2xl">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Base de seguimiento lista</h2>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            El proyecto ya tiene estructura de seguimiento cargada. Desde la navegacion lateral podes entrar a fases,
            tareas criticas y alertas para leer cada desvio operativo por separado.
          </p>
        </div>
      </section>

      <section className="rounded-[24px] border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)]/95 p-6 shadow-2xl">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Consola lista para operar</h2>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            La pantalla ya quedo preparada para separar resumen, fases, tareas criticas y alertas sin volver al panel
            legacy ni mezclar contextos.
          </p>
        </div>
      </section>
    </>
  );
}
