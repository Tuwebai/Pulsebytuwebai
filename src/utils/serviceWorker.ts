interface ServiceWorkerMessage {
  payload?: unknown;
  type: string;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private readonly isSupported = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;

  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported) {
      console.warn('Service Worker no soportado en este navegador');
      return null;
    }

    if (this.registration) {
      return this.registration;
    }

    try {
      const existingRegistration = await navigator.serviceWorker.getRegistration('/');

      if (existingRegistration) {
        this.registration = existingRegistration;
        return this.registration;
      }

      this.registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;

        if (!newWorker) {
          return;
        }

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller && !import.meta.env.DEV) {
            this.showUpdateNotification();
          }
        });
      });

      await navigator.serviceWorker.ready;
      return this.registration;
    } catch (error) {
      console.error('Error registrando Service Worker:', error);
      return null;
    }
  }

  async unregisterInDevelopment(): Promise<void> {
    if (!this.isSupported || !import.meta.env.DEV) {
      return;
    }

    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));

    const cacheKeys = await caches.keys();
    await Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)));

    this.registration = null;
  }

  async checkForUpdates(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      await this.registration.update();
      return true;
    } catch (error) {
      console.error('Error verificando actualizaciones:', error);
      return false;
    }
  }

  async clearCache(): Promise<void> {
    if (!this.registration) {
      return;
    }

    try {
      await this.sendMessage({ type: 'CLEAR_CACHE' });
    } catch (error) {
      console.error('Error limpiando cache:', error);
    }
  }

  async getCacheSize(): Promise<number> {
    if (!this.registration) {
      return 0;
    }

    try {
      return await new Promise((resolve) => {
        const messageChannel = new MessageChannel();

        messageChannel.port1.onmessage = (event) => {
          if (event.data.type === 'CACHE_SIZE') {
            resolve(event.data.size);
          }
        };

        void this.sendMessage({ type: 'GET_CACHE_SIZE' }, [messageChannel.port2]);
      });
    } catch (error) {
      console.error('Error obteniendo tamano del cache:', error);
      return 0;
    }
  }

  private async sendMessage(message: ServiceWorkerMessage, transfer?: Transferable[]) {
    if (!this.registration?.active) {
      throw new Error('Service Worker no esta activo');
    }

    if (transfer && transfer.length > 0) {
      this.registration.active.postMessage(message, transfer);
      return;
    }

    this.registration.active.postMessage(message);
  }

  private showUpdateNotification() {
    if (confirm('Nueva version disponible. Quieres actualizar ahora?')) {
      this.updateServiceWorker();
    }
  }

  private updateServiceWorker() {
    if (!this.registration) {
      return;
    }

    void this.sendMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }

  getStatus() {
    return {
      isSupported: this.isSupported,
      isRegistered: Boolean(this.registration),
      isActive: Boolean(this.registration?.active),
      scope: this.registration?.scope || null,
    };
  }
}

export const serviceWorkerManager = new ServiceWorkerManager();

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isOffline = (): boolean => !navigator.onLine;
export const isOnline = (): boolean => navigator.onLine;
