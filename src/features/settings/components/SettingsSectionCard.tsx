import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/ui/card';
import AccentIcon from '@/core/components/AccentIcon';
import { useReducedMotionPreference } from '@/core/hooks/useReducedMotionPreference';

interface SettingsSectionCardProps {
  icon: ReactNode;
  title: string;
  description?: string;
  tone?: 'signal' | 'success' | 'warning' | 'danger' | 'default';
  children: ReactNode;
}

export function SettingsSectionCard({
  icon,
  title,
  description,
  tone = 'signal',
  children,
}: SettingsSectionCardProps) {
  const prefersReducedMotion = useReducedMotionPreference();

  return (
    <Card
      className="rounded-[24px] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]"
      hover={!prefersReducedMotion}
    >
      <CardHeader className="space-y-4">
        <div className="flex items-start gap-4">
          <AccentIcon tone={tone}>{icon}</AccentIcon>
          <div className="space-y-1">
            <CardTitle className="text-[18px] font-medium text-[var(--text-primary)]">{title}</CardTitle>
            {description ? (
              <CardDescription className="text-[13px] text-[var(--text-secondary)]">
                {description}
              </CardDescription>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">{children}</CardContent>
    </Card>
  );
}
