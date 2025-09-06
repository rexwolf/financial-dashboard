interface StoredData {
  key: string;
  data: any;
  timestamp: number;
  expiresIn?: number; // milliseconds
}

export class StorageService {
  private static instance: StorageService;
  private dbName = 'FinancialDashboardDB';
  private version = 1;
  private db: IDBDatabase | null = null;
  
  private constructor() {
    this.initDB();
  }
  
  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }
  
  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('marketData')) {
          db.createObjectStore('marketData', { keyPath: 'key' });
        }
        
        if (!db.objectStoreNames.contains('userWatchlists')) {
          db.createObjectStore('userWatchlists', { keyPath: 'type' });
        }
      };
    });
  }
  
  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initDB();
    }
    return this.db!;
  }
  
  // Store market data with optional expiration
  async storeMarketData(key: string, data: any, expiresInMs?: number): Promise<void> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['marketData'], 'readwrite');
      const store = transaction.objectStore('marketData');
      
      const storedData: StoredData = {
        key,
        data,
        timestamp: Date.now(),
        expiresIn: expiresInMs
      };
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put(storedData);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to store market data:', error);
    }
  }
  
  // Retrieve market data
  async getMarketData(key: string): Promise<any | null> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['marketData'], 'readonly');
      const store = transaction.objectStore('marketData');
      
      const storedData: StoredData | null = await new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
      
      if (!storedData) return null;
      
      // Check if data has expired
      if (storedData.expiresIn) {
        const isExpired = Date.now() - storedData.timestamp > storedData.expiresIn;
        if (isExpired) {
          await this.deleteMarketData(key);
          return null;
        }
      }
      
      return storedData.data;
    } catch (error) {
      console.error('Failed to get market data:', error);
      return null;
    }
  }
  
  // Delete specific market data
  async deleteMarketData(key: string): Promise<void> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['marketData'], 'readwrite');
      const store = transaction.objectStore('marketData');
      
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to delete market data:', error);
    }
  }
  
  // Store user watchlists
  async storeUserWatchlist(type: 'stocks' | 'commodities' | 'forex' | 'crypto', watchlist: any[]): Promise<void> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['userWatchlists'], 'readwrite');
      const store = transaction.objectStore('userWatchlists');
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put({ type, watchlist, timestamp: Date.now() });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to store user watchlist:', error);
    }
  }
  
  // Retrieve user watchlist
  async getUserWatchlist(type: 'stocks' | 'commodities' | 'forex' | 'crypto'): Promise<any[] | null> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['userWatchlists'], 'readonly');
      const store = transaction.objectStore('userWatchlists');
      
      const result = await new Promise<any>((resolve, reject) => {
        const request = store.get(type);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
      
      return result ? result.watchlist : null;
    } catch (error) {
      console.error('Failed to get user watchlist:', error);
      return null;
    }
  }
  
  // Clear all expired data
  async clearExpiredData(): Promise<void> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['marketData'], 'readwrite');
      const store = transaction.objectStore('marketData');
      const now = Date.now();
      
      const request = store.openCursor();
      
      await new Promise<void>((resolve, reject) => {
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            const storedData: StoredData = cursor.value;
            if (storedData.expiresIn && now - storedData.timestamp > storedData.expiresIn) {
              cursor.delete();
            }
            cursor.continue();
          } else {
            resolve();
          }
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to clear expired data:', error);
    }
  }
  
  // Get all market data keys (for debugging)
  async getAllKeys(): Promise<string[]> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['marketData'], 'readonly');
      const store = transaction.objectStore('marketData');
      
      return await new Promise<string[]>((resolve, reject) => {
        const request = store.getAllKeys();
        request.onsuccess = () => resolve(request.result as string[]);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get all keys:', error);
      return [];
    }
  }
}

export const storageService = StorageService.getInstance();