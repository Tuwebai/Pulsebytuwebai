import { Navigate } from 'react-router-dom';
import { PulseLoaderScreen } from '@/components/PulseLoaderScreen';
import { useApp } from '@/contexts/AppContext';
import { getPostLoginPath } from '@/features/auth/utils/getPostLoginPath';

const Index = () => {
  const { isAuthenticated, authReady, user } = useApp();

  if (!authReady) {
    return <PulseLoaderScreen />;
  }

  return <Navigate replace to={isAuthenticated ? getPostLoginPath(user) : '/login'} />;
};

export default Index;
