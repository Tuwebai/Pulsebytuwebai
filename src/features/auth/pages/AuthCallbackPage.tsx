import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PulseLoaderScreen } from '@/core/components/PulseLoaderScreen';
import { config } from '@/config/environment';
import { authService } from '@/features/auth/services/auth.service';
import { userService } from '@/features/auth/services/user.service';
import { getPostLoginPath } from '@/features/auth/utils/getPostLoginPath';

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const session = await authService.processOAuthCallback();

        if (session?.user) {
          window.history.replaceState({}, document.title, new URL(config.getAuthRedirectUrl()).pathname);
          let appUser = await userService.getUserById(session.user.id);

          if (!appUser) {
            const metadata = session.user.user_metadata ?? {};
            const email = session.user.email ?? '';
            const fullName =
              metadata.full_name ??
              metadata.name ??
              (email ? email.split('@')[0] : 'Cliente Pulse');
            const avatar =
              metadata.avatar_url ??
              metadata.picture ??
              metadata.photoURL ??
              metadata.image ??
              undefined;

            await userService.upsertUser({
              id: session.user.id,
              email,
              full_name: fullName,
              role: 'user',
              pulse_access_status: 'pending',
              avatar_url: avatar,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

            appUser = await userService.getUserById(session.user.id);
          }

          navigate(getPostLoginPath(appUser), { replace: true });
          return;
        }

        navigate('/login', { replace: true });
      } catch (error) {
        console.error('Error procesando callback:', error);
        navigate('/login?error=callback_processing_failed', { replace: true });
      }
    };

    void handleAuthCallback();
  }, [navigate]);

  return <PulseLoaderScreen />;
}
