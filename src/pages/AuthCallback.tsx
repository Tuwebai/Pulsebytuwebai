import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getPostLoginPath } from '@/features/auth/utils/getPostLoginPath';
import { supabase } from '@/lib/supabase';
import { userService } from '@/lib/supabaseService';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Error en callback de autenticación:', error);
          navigate('/login?error=auth_callback_failed');
          return;
        }

        if (session?.user) {
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
              updated_at: new Date().toISOString(),
            });

            appUser = await userService.getUserById(session.user.id);
          }

          navigate(getPostLoginPath(appUser));
          return;
        }

        navigate('/login');
      } catch (error) {
        console.error('Error procesando callback:', error);
        navigate('/login?error=callback_processing_failed');
      }
    };

    void handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-white">Procesando autenticación...</p>
      </div>
    </div>
  );
}
