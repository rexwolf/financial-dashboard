// Client-side caching utilities for improved performance
import React from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private static instance: MemoryCache;
  private cache: Map<string, CacheItem<any>> = new Map();
  private maxSize: number = 100;

  static getInstance(): MemoryCache {
    if (!MemoryCache.instance) {
      MemoryCache.instance = new MemoryCache();
    }
    return MemoryCache.instance;
  }

  set<T>(key: string, data: T, ttl: number = 300000): void { // Default 5 minutes
    // Evict expired items before adding new one
    this.evictExpired();

    // If at max size, remove oldest item
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private evictExpired(): void {
    const now = Date.now();
    this.cache.forEach((item, key) => {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    });
  }

  size(): number {
    this.evictExpired();
    return this.cache.size;
  }
}

// Session storage with TTL
class SessionStorageCache {
  set<T>(key: string, data: T, ttl: number = 1800000): void { // Default 30 minutes
    const item = {
      data,
      timestamp: Date.now(),
      ttl
    };

    try {
      sessionStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to save to sessionStorage:', error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const itemStr = sessionStorage.getItem(key);
      if (!itemStr) return null;

      const item = JSON.parse(itemStr);
      
      // Check if expired
      if (Date.now() - item.timestamp > item.ttl) {
        sessionStorage.removeItem(key);
        return null;
      }

      return item.data as T;
    } catch (error) {
      console.warn('Failed to read from sessionStorage:', error);
      return null;
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from sessionStorage:', error);
    }
  }

  clear(): void {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.warn('Failed to clear sessionStorage:', error);
    }
  }
}

// Local storage with TTL
class LocalStorageCache {
  set<T>(key: string, data: T, ttl: number = 86400000): void { // Default 24 hours
    const item = {
      data,
      timestamp: Date.now(),
      ttl
    };

    try {
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return null;

      const item = JSON.parse(itemStr);
      
      // Check if expired
      if (Date.now() - item.timestamp > item.ttl) {
        localStorage.removeItem(key);
        return null;
      }

      return item.data as T;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }

  cleanup(): void {
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        this.get(key); // This will remove expired items
      }
    } catch (error) {
      console.warn('Failed to cleanup localStorage:', error);
    }
  }
}

// Cache factory
export const memoryCache = MemoryCache.getInstance();
export const sessionCache = new SessionStorageCache();
export const persistentCache = new LocalStorageCache();

// Multi-level cache strategy
export class MultiLevelCache {
  constructor(
    private level1: MemoryCache = memoryCache,
    private level2: SessionStorageCache = sessionCache,
    private level3: LocalStorageCache = persistentCache
  ) {}

  async get<T>(key: string): Promise<T | null> {
    // Try memory cache first (fastest)
    let data = this.level1.get<T>(key);
    if (data !== null) {
      return data;
    }

    // Try session storage
    data = this.level2.get<T>(key);
    if (data !== null) {
      // Populate memory cache
      this.level1.set(key, data, 300000); // 5 minutes in memory
      return data;
    }

    // Try local storage
    data = this.level3.get<T>(key);
    if (data !== null) {
      // Populate higher level caches
      this.level1.set(key, data, 300000); // 5 minutes in memory
      this.level2.set(key, data, 1800000); // 30 minutes in session
      return data;
    }

    return null;
  }

  async set<T>(key: string, data: T, options?: {
    memoryTtl?: number;
    sessionTtl?: number;
    persistentTtl?: number;
  }): Promise<void> {
    const {
      memoryTtl = 300000,      // 5 minutes
      sessionTtl = 1800000,    // 30 minutes
      persistentTtl = 86400000 // 24 hours
    } = options || {};

    // Set in all levels
    this.level1.set(key, data, memoryTtl);
    this.level2.set(key, data, sessionTtl);
    this.level3.set(key, data, persistentTtl);
  }

  delete(key: string): void {
    this.level1.delete(key);
    this.level2.delete(key);
    this.level3.delete(key);
  }

  clear(): void {
    this.level1.clear();
    this.level2.clear();
    this.level3.clear();
  }
}

export const multiLevelCache = new MultiLevelCache();

// React hook for cached data fetching
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: {
    ttl?: number;
    staleWhileRevalidate?: boolean;
  }
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        // Try cache first
        const cachedData = await multiLevelCache.get<T>(key);
        
        if (cachedData && !options?.staleWhileRevalidate) {
          setData(cachedData);
          setLoading(false);
          return;
        }

        if (cachedData && options?.staleWhileRevalidate) {
          setData(cachedData);
          setLoading(false);
        }

        // Fetch fresh data
        const freshData = await fetcher();
        
        if (mounted) {
          setData(freshData);
          setLoading(false);
          setError(null);
          
          // Cache the fresh data
          await multiLevelCache.set(key, freshData, {
            memoryTtl: options?.ttl || 300000,
            sessionTtl: options?.ttl || 1800000,
            persistentTtl: options?.ttl || 86400000
          });
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [key, fetcher, options?.ttl, options?.staleWhileRevalidate]);

  return { data, loading, error };
}

export default {
  memoryCache,
  sessionCache,
  persistentCache,
  multiLevelCache
};
