import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/core/hooks/usePrefersReducedMotion';

interface FadeInProps {
  children: ReactNode;
  className?: string;
}

export default function FadeIn({ children, className }: FadeInProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className={className}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.div>
  );
}
