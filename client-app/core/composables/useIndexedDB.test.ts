import { get, set, del, clear, keys, createStore } from "idb-keyval";
import { ref } from "vue";

interface UseIndexedDBOptions {
  storeName?: string;
  dbName?: string;
}

export function useIndexedDB(options: UseIndexedDBOptions = {}) {
  const { storeName = "keyval-store", dbName = "keyval-db" } = options;

  // Create a custom store if custom names are provided
  const customStore = createStore(dbName, storeName);

  // Status indicators
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  /**
   * Get a value from IndexedDB
   */
  async function getValue<T>(key: IDBValidKey): Promise<T | undefined> {
    isLoading.value = true;
    error.value = null;

    try {
      return await get<T>(key, customStore);
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      console.error("Error getting value from IndexedDB:", err);
      return undefined;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Set a value in IndexedDB
   */
  async function setValue<T>(key: IDBValidKey, value: T): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      await set(key, value, customStore);
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      console.error("Error setting value in IndexedDB:", err);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Delete a value from IndexedDB
   */
  async function deleteValue(key: IDBValidKey): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      await del(key, customStore);
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      console.error("Error deleting value from IndexedDB:", err);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Clear all values from the store
   */
  async function clearStore(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      await clear(customStore);
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      console.error("Error clearing IndexedDB store:", err);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get all keys from the store
   */
  async function getAllKeys(): Promise<IDBValidKey[]> {
    isLoading.value = true;
    error.value = null;

    try {
      return await keys(customStore);
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      console.error("Error getting keys from IndexedDB:", err);
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Check if a key exists in the store
   */
  async function hasKey(key: IDBValidKey): Promise<boolean> {
    const allKeys = await getAllKeys();
    return allKeys.includes(key);
  }

  /**
   * Get multiple values at once
   */
  async function getMultipleValues<T>(keyList: IDBValidKey[]): Promise<(T | undefined)[]> {
    const results: (T | undefined)[] = [];

    for (const key of keyList) {
      results.push(await getValue<T>(key));
    }

    return results;
  }

  /**
   * Set multiple key-value pairs at once
   */
  async function setMultipleValues<T>(entries: [IDBValidKey, T][]): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      for (const [key, value] of entries) {
        await setValue(key, value);
      }
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      console.error("Error setting multiple values in IndexedDB:", err);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    getValue,
    setValue,
    deleteValue,
    clearStore,
    getAllKeys,
    hasKey,
    getMultipleValues,
    setMultipleValues,
    isLoading,
    error,
  };
}
