import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
import { setupGlobalErrorHandling } from './app/setupGlobalErrorHandling';
import './lib/config/i18n';
import { I18nextProvider } from 'react-i18next';
import i18n from './lib/config/i18n';
import { setupAutoCacheCleanup } from './lib/utils/cacheManager';

// Configurar cliente de React Query con opciones recomendadas
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Configurar manejador de errores personalizado
setupGlobalErrorHandling();

// Configurar limpieza automática de cache en desarrollo
setupAutoCacheCleanup();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
