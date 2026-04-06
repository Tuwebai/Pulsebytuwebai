import { useEffect, useState } from 'react';

interface CacheItem<T = unknown> {
  key: string;
  value: T;
  timestamp: number;
  expiresAt?: number;
  tags?: string[];
  size?: number;
}

interface CacheOptions {
  ttl?: number;
  tags?: string[];
  maxSize?: number;
  strategy?: 'lru' | 'fifo' | 'lfu';
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  items: number;
  hitRate: number;
}

class CacheManager {
  private db: IDBDatabase | null = null;
  private readonly dbName = 'TuWebAICache';
  private readonly dbVersion = 1;
  private readonly storeName = 'cache';
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    items: 0,
    hitRate: 0,
  };
  private readonly memoryCache = new Map<string, CacheItem>();
  private readonly maxMemoryItems = 100;
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Error opening IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        void this.loadStats();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('expiresAt', 'expiresAt', { unique: false });
          store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
        }
      };
    });
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    await this.init();

    const now = Date.now();
    const expiresAt = options.ttl ? now + options.ttl : undefined;
    const size = this.calculateSize(value);

    const item: CacheItem<T> = {
      key,
      value,
      timestamp: now,
      expiresAt,
      tags: options.tags,
      size,
    };

    this.memoryCache.set(key, item);
    this.cleanupMemoryCache();

    if (this.db) {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      await store.put(item);
    }

    this.updateStats();
  }

  async get<T>(key: string): Promise<T | null> {
    await this.init();

    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && !this.isExpired(memoryItem)) {
      this.stats.hits++;
      this.updateStats();
      return memoryItem.value as T;
    }

    if (this.db) {
      try {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);

        return new Promise((resolve) => {
          request.onsuccess = () => {
            const item = request.result as CacheItem<T>;
            if (item && !this.isExpired(item)) {
              this.memoryCache.set(key, item);
              this.cleanupMemoryCache();
              this.stats.hits++;
              this.updateStats();
              resolve(item.value);
              return;
            }

            this.stats.misses++;
            this.updateStats();
            resolve(null);
          };

          request.onerror = () => {
            this.stats.misses++;
            this.updateStats();
            resolve(null);
          };
        });
      } catch (error) {
        console.error('Error getting from cache:', error);
        this.stats.misses++;
        this.updateStats();
        return null;
      }
    }

    this.stats.misses++;
    this.updateStats();
    return null;
  }

  async delete(key: string): Promise<void> {
    await this.init();

    this.memoryCache.delete(key);

    if (this.db) {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      await store.delete(key);
    }

    this.updateStats();
  }

  async clearByTags(tags: string[]): Promise<void> {
    await this.init();

    if (!this.db) {
      return;
    }

    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    const index = store.index('tags');

    for (const tag of tags) {
      const request = index.getAll(tag);
      request.onsuccess = () => {
        const items = request.result;
        items.forEach((item) => {
          this.memoryCache.delete(item.key);
          store.delete(item.key);
        });
      };
    }

    this.updateStats();
  }

  async clearExpired(): Promise<void> {
    await this.init();

    if (!this.db) {
      return;
    }

    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    const index = store.index('expiresAt');
    const now = Date.now();

    const request = index.getAll();
    request.onsuccess = () => {
      const items = request.result;
      items.forEach((item) => {
        if (item.expiresAt && item.expiresAt < now) {
          this.memoryCache.delete(item.key);
          store.delete(item.key);
        }
      });
    };

    this.updateStats();
  }

  async clear(): Promise<void> {
    await this.init();

    this.memoryCache.clear();

    if (this.db) {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      await store.clear();
    }

    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      items: 0,
      hitRate: 0,
    };
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  private isExpired(item: CacheItem): boolean {
    if (!item.expiresAt) {
      return false;
    }

    return Date.now() > item.expiresAt;
  }

  private calculateSize(value: unknown): number {
    try {
      return new Blob([JSON.stringify(value)]).size;
    } catch {
      return 0;
    }
  }

  private cleanupMemoryCache(): void {
    if (this.memoryCache.size <= this.maxMemoryItems) {
      return;
    }

    const items = Array.from(this.memoryCache.entries())
      .map(([key, item]) => ({ key, item }))
      .sort((a, b) => a.item.timestamp - b.item.timestamp);

    const toDelete = items.slice(0, items.length - this.maxMemoryItems);
    toDelete.forEach(({ key }) => {
      this.memoryCache.delete(key);
    });
  }

  private updateStats(): void {
    this.stats.items = this.memoryCache.size;
    this.stats.size = Array.from(this.memoryCache.values()).reduce((total, item) => total + (item.size || 0), 0);

    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  private async loadStats(): Promise<void> {
    if (!this.db) {
      return;
    }

    try {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.count();

      request.onsuccess = () => {
        this.stats.items = request.result;
        this.updateStats();
      };
    } catch (error) {
      console.error('Error loading cache stats:', error);
    }
  }

  startAutoCleanup(): void {
    setInterval(() => {
      void this.clearExpired();
    }, 5 * 60 * 1000);
  }

  stopAutoCleanup(): void {
    console.log('Auto cleanup stopped');
  }
}

export const cacheManager = new CacheManager();

export const useCache = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    cacheManager.init().then(() => {
      setIsReady(true);
    });
  }, []);

  return {
    isReady,
    set: cacheManager.set.bind(cacheManager),
    get: cacheManager.get.bind(cacheManager),
    delete: cacheManager.delete.bind(cacheManager),
    clear: cacheManager.clear.bind(cacheManager),
    clearByTags: cacheManager.clearByTags.bind(cacheManager),
    clearExpired: cacheManager.clearExpired.bind(cacheManager),
    getStats: cacheManager.getStats.bind(cacheManager),
  };
};

export const cacheUtils = {
  generateKey: (prefix: string, ...parts: string[]): string => `${prefix}:${parts.join(':')}`,
  withTTL: (ttl: number) => ({ ttl }),
  withTags: (tags: string[]) => ({ tags }),
  withMaxSize: (maxSize: number) => ({ maxSize }),
  withStrategy: (strategy: 'lru' | 'fifo' | 'lfu') => ({ strategy }),
};

export function setupAutoCacheCleanup() {
  cacheManager.startAutoCleanup();
}

export function stopAutoCacheCleanup() {
  cacheManager.stopAutoCleanup();
}

export default cacheManager;
