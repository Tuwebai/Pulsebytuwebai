// =====================================================
// SERVICIO SIMPLIFICADO PARA OBTENER AVATARES REALES
// =====================================================

import { supabase } from '../supabase/supabase';

export interface AvatarResult {
  url: string | null;
  provider: string;
  isReal: boolean;
}

// =====================================================
// SERVICIO PRINCIPAL DE AVATARES
// =====================================================

export class RealAvatarService {
  getAuthMetadataAvatar(user: { user_metadata?: Record<string, unknown> } | null | undefined): string | null {
    if (!user?.user_metadata) {
      return null;
    }

    const avatarUrl =
      user.user_metadata.avatar_url ||
      user.user_metadata.picture ||
      user.user_metadata.photoURL ||
      user.user_metadata.image;

    if (typeof avatarUrl !== 'string' || !avatarUrl.trim()) {
      return null;
    }

    return this.isRealAvatarUrl(avatarUrl) ? avatarUrl : null;
  }

  isPulseStorageAvatar(url: string | null | undefined): boolean {
    if (!url) {
      return false;
    }

    return (
      url.includes('/storage/v1/object/public/avatars/') ||
      url.includes('/storage/v1/object/public/project-files/avatars/')
    );
  }

  shouldKeepStoredAvatar(url: string | null | undefined): boolean {
    if (!url) {
      return false;
    }

    return this.isPulseStorageAvatar(url) || this.isRealAvatarUrl(url);
  }
  
  // =====================================================
  // OBTENER AVATAR REAL DEL CORREO REGISTRADO
  // =====================================================

  async getRealAvatar(email: string): Promise<AvatarResult> {
    try {
      
      // 1. Intentar obtener avatar guardado en la base de datos
      const savedAvatar = await this.getSavedAvatar(email);
      if (savedAvatar && this.shouldKeepStoredAvatar(savedAvatar)) {
        return {
          url: savedAvatar,
          provider: 'Database',
          isReal: true
        };
      }

      // 2. Intentar obtener avatar del usuario autenticado actual
      const authAvatar = await this.getAuthUserAvatar(email);
      if (authAvatar) {
        return {
          url: authAvatar,
          provider: 'Supabase Auth',
          isReal: true
        };
      }

      // 3. Generar avatar temporal como Ãºltimo recurso (ui-avatars.com)
      return {
        url: null,
        provider: 'Pulse initials fallback',
        isReal: false
      };

    } catch (error) {
      return {
        url: null,
        provider: 'Pulse initials fallback',
        isReal: false
      };
    }
  }

  // =====================================================
  // MÃ‰TODOS PRIVADOS DE AYUDA
  // =====================================================

  private async getSavedAvatar(email: string): Promise<string | null> {
    try {
      
      const { data, error } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('email', email)
        .single();

      if (error) {
        return null;
      }

      if (!data?.avatar_url) {
        return null;
      }

      return data.avatar_url;
    } catch (error) {
      return null;
    }
  }

  private async getAuthUserAvatar(email: string): Promise<string | null> {
    try {
      
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        return null;
      }

      if (!user) {
        return null;
      }

      if (user.email !== email) {
        return null;
      }

      const avatarUrl = this.getAuthMetadataAvatar(user);

      if (avatarUrl) {
        return avatarUrl;
      } else {
        return null;
      }

    } catch (error) {
      return null;
    }
  }

  isRealAvatarUrl(url: string): boolean {
    
    // Verificar si la URL es de un avatar real (no generado)
    const realProviders = [
      'googleusercontent.com',
      'githubusercontent.com',
      'gravatar.com',
      'yahoo.com',
      'outlook.com',
      'hotmail.com',
      'live.com'
    ];
    
    const generatedProviders = [
      'dicebear.com',
      'ui-avatars.com'
    ];

    const isReal = realProviders.some(provider => url.includes(provider));
    const isGenerated = generatedProviders.some(provider => url.includes(provider));

    return isReal && !isGenerated;
  }

  // =====================================================
  // MÃ‰TODOS PÃšBLICOS PARA SINCRONIZACIÃ“N
  // =====================================================

  /**
   * Sincroniza el avatar de un usuario especÃ­fico
   */
  async syncUserAvatar(email: string): Promise<void> {
    try {
      const avatarResult = await this.getRealAvatar(email);
      
      if (!avatarResult.url) {
        return;
      }

      await this.saveAvatarToDatabase(email, avatarResult.url);
      
    } catch (error) {
      console.error(`âŒ Error sincronizando avatar para ${email}:`, error);
    }
  }

  /**
   * Sincroniza todos los avatares de usuarios
   */
  async syncAllUserAvatars(): Promise<void> {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('email');

      if (error || !users) {
        console.error('âŒ Error obteniendo usuarios:', error);
        return;
      }

      for (const user of users) {
        await this.syncUserAvatar(user.email);
      }

    } catch (error) {
      console.error('âŒ Error sincronizando avatares:', error);
    }
  }

  // =====================================================
  // GUARDAR AVATAR EN LA BASE DE DATOS
  // =====================================================

  private async saveAvatarToDatabase(email: string, avatarUrl: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('email', email);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(`âŒ Error guardando avatar en DB para ${email}:`, error);
    }
  }
}

export const realAvatarService = new RealAvatarService();
export const { getRealAvatar, syncUserAvatar, syncAllUserAvatars } = realAvatarService;

