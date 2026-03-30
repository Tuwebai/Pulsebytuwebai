export interface ContextualHelpProps {
  context: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'always';
  className?: string;
}

export interface ContextualHintProps {
  message: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}
