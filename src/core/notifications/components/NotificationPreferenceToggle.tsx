import type { ReactNode } from 'react';
import { cn } from '@/core/utils/cn';

interface NotificationPreferenceToggleProps {
  icon: ReactNode;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}

export function NotificationPreferenceToggle({
  icon,
  title,
  description,
  checked,
  disabled,
  onChange
}: NotificationPreferenceToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-4 shadow-2xl">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-[var(--signal)]">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-[var(--text-primary)]">{title}</p>
          <p className="mt-1 text-[12px] leading-5 text-[var(--text-secondary)]">{description}</p>
        </div>
      </div>

      <button
        aria-checked={checked}
        className={cn(
          'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-150',
          checked ? 'bg-[var(--signal)]' : 'bg-[var(--bg-subtle)]',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
        )}
        disabled={disabled}
        role="switch"
        type="button"
        onClick={() => onChange(!checked)}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 rounded-full transition-transform duration-150',
            checked ? 'translate-x-6 bg-white' : 'translate-x-1 bg-[var(--text-tertiary)]'
          )}
        />
      </button>
    </div>
  );
}
