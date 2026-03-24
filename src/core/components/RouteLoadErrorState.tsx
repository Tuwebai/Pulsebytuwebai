import PulseFeedbackState from './PulseFeedbackState';

export default function RouteLoadErrorState() {
  return (
    <PulseFeedbackState
      className="min-h-screen bg-[var(--bg-base)] px-6"
      description="No pudimos abrir esta pantalla ahora. Proba recargando o volve a intentarlo en unos segundos."
      primaryAction={{
        label: 'Recargar pagina',
        onClick: () => window.location.reload(),
      }}
      surfaceClassName="max-w-[560px]"
      title="Error de carga"
      variant="error"
    />
  );
}
