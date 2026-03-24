interface PulseLoaderScreenProps {
  className?: string;
}

export function PulseLoaderScreen({ className = '' }: PulseLoaderScreenProps) {
  return (
    <div className={`relative min-h-screen overflow-hidden bg-[var(--bg-base)] ${className}`.trim()}>
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <svg
          aria-label="Pulse"
          height="56"
          role="img"
          viewBox="0 0 100 100"
          width="56"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="pulse-loader-screen-clip">
              <circle cx="50" cy="50" r="37" />
            </clipPath>
          </defs>
          <circle cx="50" cy="50" fill="none" r="38" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" />
          <g clipPath="url(#pulse-loader-screen-clip)">
            <path
              d="M12 50 L26 50 L34 26 L44 74 L52 38 L60 50 L88 50"
              fill="none"
              stroke="rgba(255,255,255,0.9)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </g>
          <circle className="pulse-logo-dot" cx="60" cy="50" fill="#3B9EF5" r="2.5" />
        </svg>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 px-6 pb-7 text-center">
        <span className="text-[18px] font-medium uppercase tracking-[0.35em] text-[var(--text-primary)]">
          Pulse
        </span>
        <span className="text-[11px] font-light tracking-[0.22em] text-[rgba(240,244,255,0.86)]">
          by <span className="brand-gradient-text font-medium">TuWebAI</span>
        </span>
      </div>
    </div>
  );
}
