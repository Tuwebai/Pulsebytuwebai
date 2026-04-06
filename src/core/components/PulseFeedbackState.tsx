import { AlertCircle, Inbox, LoaderCircle } from 'lucide-react';
import { Button } from '@/core/ui/button';
import { cn } from '@/core/utils/cn';

type PulseFeedbackVariant = 'loading' | 'error' | 'empty';

interface PulseFeedbackAction {
  label: string;
  onClick?: () => void;
  href?: string;
  target?: '_blank' | '_self';
  variant?: 'primary' | 'secondary';
}

export interface PulseFeedbackStateProps {
  title: string;
  description?: string;
  variant?: PulseFeedbackVariant;
  primaryAction?: PulseFeedbackAction;
  secondaryAction?: PulseFeedbackAction;
  className?: string;
  surfaceClassName?: string;
}

function FeedbackAction({ action }: { action: PulseFeedbackAction }) {
  const isPrimary = action.variant !== 'secondary';
  const className = isPrimary
    ? 'rounded-[10px] bg-[var(--signal)] px-5 text-white hover:bg-[var(--signal-dim)]'
    : 'rounded-[10px] border border-[var(--border-default)] bg-transparent px-5 text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]';

  if (action.href) {
    return (
      <a
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal-border)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-surface)] disabled:pointer-events-none disabled:opacity-50',
          className,
        )}
        href={action.href}
        rel={action.target === '_blank' ? 'noreferrer' : undefined}
        target={action.target}
      >
        {action.label}
      </a>
    );
  }

  return (
    <Button className={className} onClick={action.onClick} type="button" variant={isPrimary ? 'default' : 'outline'}>
      {action.label}
    </Button>
  );
}

export default function PulseFeedbackState({
  title,
  description,
  variant = 'empty',
  primaryAction,
  secondaryAction,
  className,
  surfaceClassName,
}: PulseFeedbackStateProps) {
  const icon =
    variant === 'loading' ? (
      <LoaderCircle className="h-5 w-5 animate-spin text-[var(--signal)]" />
    ) : variant === 'error' ? (
      <AlertCircle className="h-5 w-5 text-[var(--danger)]" strokeWidth={1.7} />
    ) : (
      <Inbox className="h-5 w-5 text-[var(--text-secondary)]" strokeWidth={1.7} />
    );

  const iconSurfaceClassName =
    variant === 'loading'
      ? 'bg-[var(--signal-glow)]'
      : variant === 'error'
        ? 'bg-[var(--danger-dim)]'
        : 'bg-[var(--bg-elevated)]';

  return (
    <div className={cn('mx-auto flex w-full items-center justify-center', className)}>
      <section
        className={cn(
          'w-full rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] px-6 py-12 text-center',
          surfaceClassName,
        )}
      >
        <div className={cn('mx-auto flex h-14 w-14 items-center justify-center rounded-full', iconSurfaceClassName)}>
          {icon}
        </div>

        <h2 className="mt-5 text-lg font-medium text-[var(--text-primary)]">{title}</h2>

        {description ? (
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
        ) : null}

        {primaryAction || secondaryAction ? (
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            {primaryAction ? <FeedbackAction action={primaryAction} /> : null}
            {secondaryAction ? <FeedbackAction action={secondaryAction} /> : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
