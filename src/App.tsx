import { BrowserRouter as Router } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';
import TouchGestureProvider from '@/components/TouchGestureProvider';
import { AppProviders } from '@/app/providers';
import { AppRouter } from '@/app/router';
import { serviceWorkerManager } from '@/utils/serviceWorker';
import { useEffect } from 'react';

const ServiceWorkerInitializer = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      void serviceWorkerManager.register();
    }
  }, []);

  return null;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <Router
          basename={import.meta.env.BASE_URL || '/'}
          future={{
            v7_startTransition: false,
            v7_relativeSplatPath: false
          }}
        >
          <TouchGestureProvider enableGlobalGestures={true} enableNavigationGestures={true}>
            <ServiceWorkerInitializer />
            <AppRouter />
          </TouchGestureProvider>
        </Router>
      </AppProviders>
    </ErrorBoundary>
  );
}
