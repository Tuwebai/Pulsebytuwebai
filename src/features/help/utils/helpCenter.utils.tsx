import type { ReactNode } from 'react';

import {
  BookOpen,
  CreditCard,
  FolderKanban,
  LifeBuoy,
  Settings,
  Target,
  TrendingUp,
} from 'lucide-react';

export const HELP_CENTER_CATEGORIES = [
  'all',
  'onboarding',
  'pulse',
  'project',
  'payments',
  'support',
  'settings',
] as const;

export function getArticlePreview(content: string, maxLength = 120) {
  const plainLines = content
    .split('\n')
    .map((line) => line.replace(/[#*`]/g, '').replace(/^\d+\.\s+/, '').trim())
    .filter(Boolean);

  const firstParagraph =
    plainLines.find(
      (line) =>
        !line.endsWith('TuWebAI') &&
        line.length > 30 &&
        !line.endsWith('sin complicarte') &&
        !line.endsWith('qué esperar') &&
        !line.endsWith('Mi Proyecto') &&
        !line.endsWith('Configuración'),
    ) || plainLines[0] || '';

  return firstParagraph.length > maxLength
    ? `${firstParagraph.substring(0, maxLength).trim()}...`
    : firstParagraph;
}

export function getCategoryIcon(category: string): ReactNode {
  switch (category) {
    case 'onboarding':
      return <Target className="h-4 w-4" />;
    case 'pulse':
      return <TrendingUp className="h-4 w-4" />;
    case 'project':
      return <FolderKanban className="h-4 w-4" />;
    case 'payments':
      return <CreditCard className="h-4 w-4" />;
    case 'support':
      return <LifeBuoy className="h-4 w-4" />;
    case 'settings':
      return <Settings className="h-4 w-4" />;
    default:
      return <BookOpen className="h-4 w-4" />;
  }
}

export function getCategoryColor(category: string) {
  switch (category) {
    case 'onboarding':
      return 'border-[var(--signal-border)] bg-[var(--signal-glow)]/80 text-[var(--signal)]';
    case 'pulse':
      return 'border-emerald-500/20 bg-emerald-500/12 text-emerald-300';
    case 'project':
      return 'border-amber-500/20 bg-amber-500/12 text-amber-300';
    case 'payments':
      return 'border-violet-500/20 bg-violet-500/12 text-violet-300';
    case 'support':
      return 'border-rose-500/20 bg-rose-500/12 text-rose-300';
    case 'settings':
      return 'border-sky-500/20 bg-sky-500/12 text-sky-300';
    default:
      return 'border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]';
  }
}

export function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'beginner':
      return 'border-emerald-500/20 bg-emerald-500/12 text-emerald-300';
    case 'intermediate':
      return 'border-amber-500/20 bg-amber-500/12 text-amber-300';
    case 'advanced':
      return 'border-rose-500/20 bg-rose-500/12 text-rose-300';
    default:
      return 'border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]';
  }
}

export function getHelpCategoryLabel(category: string) {
  switch (category) {
    case 'all':
      return 'Todas';
    case 'onboarding':
      return 'Primeros pasos';
    case 'pulse':
      return 'Pulse';
    case 'project':
      return 'Mi Proyecto';
    case 'payments':
      return 'Pagos';
    case 'support':
      return 'Soporte';
    case 'settings':
      return 'Configuración';
    default:
      return 'Ayuda';
  }
}

export function getFlowCategoryLabel(category: string) {
  switch (category) {
    case 'onboarding':
      return 'Primeros pasos';
    case 'pulse':
      return 'Pulse';
    case 'project':
      return 'Mi Proyecto';
    case 'payments':
      return 'Pagos';
    case 'support':
      return 'Soporte';
    case 'settings':
      return 'Configuración';
    default:
      return 'Ayuda';
  }
}
