import { Navigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useEffect, useState } from 'react';
import { getPostLoginPath } from '@/features/auth/utils/getPostLoginPath';

const Index = () => {
  const { isAuthenticated, authReady, user } = useApp();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Pequeño delay para asegurar que el contexto esté listo
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!authReady || !isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si está autenticado, ir al dashboard, si no, ir al login
  return <Navigate to={isAuthenticated ? getPostLoginPath(user) : "/login"} replace />;
};

export default Index;
