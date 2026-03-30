export type HelpButtonVariant = 'default' | 'floating' | 'minimal';

export interface HelpButtonProps {
  variant?: HelpButtonVariant;
  showBadge?: boolean;
  className?: string;
}
