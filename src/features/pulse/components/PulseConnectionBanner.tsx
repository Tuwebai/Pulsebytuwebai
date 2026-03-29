interface PulseConnectionBannerProps {
  websiteApprovedWithoutData: boolean;
  websitePendingReview: boolean;
}

export default function PulseConnectionBanner({
  websiteApprovedWithoutData,
  websitePendingReview,
}: PulseConnectionBannerProps) {
  return (
    <div className="rounded-[14px] border border-[color:rgba(245,158,11,0.28)] bg-[color:rgba(245,158,11,0.12)] px-4 py-3.5 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="flex items-start gap-3">
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--warning)]" />
        <div>
          <p className="font-medium leading-5 text-[var(--text-primary)]">
            {websitePendingReview
              ? 'Estamos revisando tu dominio para terminar de conectar Pulse.'
              : websiteApprovedWithoutData
                ? 'Tu dominio ya está confirmado. Estamos terminando de conectar tus datos.'
                : 'Conectá tu dominio para ver los datos reales.'}
          </p>
          <p className="mt-1 text-[13px] leading-5 text-[color:rgba(240,244,255,0.82)]">
            {websitePendingReview
              ? 'Apenas quede confirmado, vas a empezar a ver la actividad real de tu sitio.'
              : websiteApprovedWithoutData
                ? 'Apenas quede lista la conexión, vas a empezar a ver movimiento real acá.'
                : 'Tu equipo de TuWebAI lo configura automáticamente al entregar tu proyecto.'}
          </p>
        </div>
      </div>
    </div>
  );
}
