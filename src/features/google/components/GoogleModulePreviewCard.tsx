const previewItems = [
  {
    title: 'Cómo te encuentran',
    description: 'Vas a poder ver las búsquedas que ya te están acercando visitas reales desde Google.',
  },
  {
    title: 'Qué páginas aparecen más',
    description: 'Pulse te va a mostrar qué secciones de tu sitio ganan más visibilidad y dónde conviene reforzar.',
  },
  {
    title: 'Oportunidades claras',
    description: 'No vas a ver jerga técnica. Vas a ver señales simples para decidir qué vale la pena mejorar.',
  },
] as const;

export default function GoogleModulePreviewCard() {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/92 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.24)] sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Lo que vas a ver</p>
      <h2 className="mt-3 text-[18px] font-medium text-[var(--text-primary)]">Google dentro de Pulse, explicado en simple</h2>

      <div className="mt-5 space-y-4">
        {previewItems.map((item) => (
          <div key={item.title} className="rounded-2xl border border-white/10 bg-[var(--bg-elevated)]/55 p-4">
            <p className="text-sm font-medium text-[var(--text-primary)]">{item.title}</p>
            <p className="mt-2 text-[14px] leading-6 text-[var(--text-secondary)]">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

