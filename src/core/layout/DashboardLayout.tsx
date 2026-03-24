import { useEffect, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotionPreference } from '@/core/hooks/useReducedMotionPreference';
import { useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import Header from './Header';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotionPreference();

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-base)]">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />
        <motion.main
          animate={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
          className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-24 md:px-8 md:py-8 md:pb-8"
          initial={prefersReducedMotion ? false : { opacity: 0, x: 8 }}
          key={location.pathname}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {children}
        </motion.main>
        <footer className="hidden border-t border-[var(--border-subtle)] px-8 py-4 md:block">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
            Pulse by{' '}
            <span
              className="font-medium text-transparent"
              style={{
                backgroundImage: 'var(--gradient-brand)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
              }}
            >
              TuWebAI
            </span>
          </p>
        </footer>
      </div>

      <BottomNav />
    </div>
  );
}
