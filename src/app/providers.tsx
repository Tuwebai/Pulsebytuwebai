import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { TooltipProvider } from '@/core/ui/tooltip';
import { AppProvider } from '@/contexts/AppContext';
import { PulseToaster } from '@/core/notifications/components/PulseToaster';
import { PushSubscriptionBootstrap } from '@/core/notifications/components/PushSubscriptionBootstrap';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { TutorialProvider } from '@/contexts/TutorialContext';
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

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <AppProvider>
              <TutorialProvider>
                <PushSubscriptionBootstrap />
                {children}
                <PulseToaster />
              </TutorialProvider>
            </AppProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
}
