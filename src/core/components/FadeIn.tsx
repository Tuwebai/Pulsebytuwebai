import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotionPreference } from '@/core/hooks/useReducedMotionPreference';

interface FadeInProps {
  children: ReactNode;
  className?: string;
}

export default function FadeIn({ children, className }: FadeInProps) {
  const prefersReducedMotion = useReducedMotionPreference();

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
