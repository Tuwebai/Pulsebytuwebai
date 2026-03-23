import { useEffect, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { AppProvider } from '@/contexts/AppContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { TutorialProvider } from '@/contexts/TutorialContext';
import { useApp } from '@/contexts/AppContext';
import i18n from '@/lib/config/i18n';

interface AppProvidersProps {
  children: ReactNode;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

function PulseLoaderDismiss() {
  const { authReady } = useApp();

  useEffect(() => {
    if (!authReady || !window.__removePulseLoader) {
      return;
    }

    window.__removePulseLoader();
  }, [authReady]);

  return null;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <AppProvider>
              <PulseLoaderDismiss />
              <TutorialProvider>
                {children}
                <Toaster />
                <Sonner />
              </TutorialProvider>
            </AppProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
}
