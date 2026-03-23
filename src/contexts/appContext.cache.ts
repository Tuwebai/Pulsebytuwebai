const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data as T;
  }
  return null;
}

export function setCachedData(key: string, data: any, ttl = 5 * 60 * 1000) {
  cache.set(key, { data, timestamp: Date.now(), ttl });
}

export function clearCache() {
  cache.clear();
}

export function deleteCachedData(key: string) {
  cache.delete(key);
}
