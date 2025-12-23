/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

const DB_NAME = 'davinci_app_db';
const STORE_NAME = 'creations';
const DB_VERSION = 1;

interface Creation {
  id: string;
  name: string;
  html: string;
  originalImage?: string;
  timestamp: Date;
}

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", request.error);
      reject(request.error);
    };

    request.onsuccess = (event) => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // Create object store with 'id' as key path
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const saveCreation = async (creation: Creation): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(creation);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to save creation to DB:", error);
    throw error;
  }
};

export const getHistory = async (): Promise<Creation[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result as Creation[];
        // Sort by timestamp descending (newest first)
        // Ensure timestamp is a Date object
        const sorted = results.map(item => ({
            ...item,
            timestamp: new Date(item.timestamp)
        })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        
        resolve(sorted);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to get history from DB:", error);
    return [];
  }
};

export const deleteCreation = async (id: string): Promise<void> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};
