import { supabase } from '@/data/supabase/client';

export interface AvatarResult {
  url: string | null;
  provider: string;
  isReal: boolean;
}

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

  async getRealAvatar(email: string): Promise<AvatarResult> {
    try {
      const savedAvatar = await this.getSavedAvatar(email);
      if (savedAvatar && this.shouldKeepStoredAvatar(savedAvatar)) {
        return {
          url: savedAvatar,
          provider: 'Database',
          isReal: true,
        };
      }

      const authAvatar = await this.getAuthUserAvatar(email);
      if (authAvatar) {
        return {
          url: authAvatar,
          provider: 'Supabase Auth',
          isReal: true,
        };
      }

      return {
        url: null,
        provider: 'Pulse initials fallback',
        isReal: false,
      };
    } catch {
      return {
        url: null,
        provider: 'Pulse initials fallback',
        isReal: false,
      };
    }
  }

  private async getSavedAvatar(email: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('email', email)
        .single();

      if (error || !data?.avatar_url) {
        return null;
      }

      return data.avatar_url;
    } catch {
      return null;
    }
  }

  private async getAuthUserAvatar(email: string): Promise<string | null> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user || user.email !== email) {
        return null;
      }

      return this.getAuthMetadataAvatar(user);
    } catch {
      return null;
    }
  }

  isRealAvatarUrl(url: string): boolean {
    const realProviders = [
      'googleusercontent.com',
      'githubusercontent.com',
      'gravatar.com',
      'yahoo.com',
      'outlook.com',
      'hotmail.com',
      'live.com',
    ];

    const generatedProviders = ['dicebear.com', 'ui-avatars.com'];

    const isReal = realProviders.some((provider) => url.includes(provider));
    const isGenerated = generatedProviders.some((provider) => url.includes(provider));

    return isReal && !isGenerated;
  }

  async syncUserAvatar(email: string): Promise<void> {
    try {
      const avatarResult = await this.getRealAvatar(email);

      if (!avatarResult.url) {
        return;
      }

      await this.saveAvatarToDatabase(email, avatarResult.url);
    } catch (error) {
      console.error(`Error sincronizando avatar para ${email}:`, error);
    }
  }

  async syncAllUserAvatars(): Promise<void> {
    try {
      const { data: users, error } = await supabase.from('users').select('email');

      if (error || !users) {
        console.error('Error obteniendo usuarios:', error);
        return;
      }

      for (const user of users) {
        await this.syncUserAvatar(user.email);
      }
    } catch (error) {
      console.error('Error sincronizando avatares:', error);
    }
  }

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
      console.error(`Error guardando avatar en DB para ${email}:`, error);
    }
  }
}

export const realAvatarService = new RealAvatarService();
export const { getRealAvatar, syncUserAvatar, syncAllUserAvatars } = realAvatarService;
