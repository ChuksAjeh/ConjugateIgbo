/**
 * @fileoverview Lightweight cross-platform key-value storage abstraction.
 *
 * Backs onto AsyncStorage (`@react-native-async-storage/async-storage`), which
 * ships native, web (localStorage), and Jest implementations. If the native
 * module is ever unavailable, calls fall back to an in-memory map so the app
 * degrades to "settings don't persist this session" rather than crashing.
 *
 * Consumers import these three functions directly and never need to know which
 * backend is active.
 *
 * @example
 * ```ts
 * import { getItem, setItem, removeItem } from '@/lib/storage';
 *
 * await setItem('my_key', JSON.stringify({ foo: 'bar' }));
 * const raw = await getItem('my_key'); // '{"foo":"bar"}'
 * await removeItem('my_key');
 * ```
 */

/** In-memory fallback; only used if AsyncStorage cannot be loaded. */
const memoryStore: Record<string, string> = {};

// Dynamic require prevents a hard crash if the native module is unavailable
// (e.g. certain test or SSR contexts).
let AsyncStorage: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  // Fall through to the in-memory store.
}

/**
 * Retrieves the stored string value for `key`.
 *
 * @param key - The storage key.
 * @returns The stored string, or `null` if the key does not exist.
 */
export async function getItem(key: string): Promise<string | null> {
  if (AsyncStorage) {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      // Fall through to the in-memory store.
    }
  }
  return key in memoryStore ? memoryStore[key] : null;
}

/**
 * Stores a string value under `key`.
 *
 * @param key   - The storage key.
 * @param value - The string value to store (typically JSON-serialised).
 */
export async function setItem(key: string, value: string): Promise<void> {
  if (AsyncStorage) {
    try {
      await AsyncStorage.setItem(key, value);
      return;
    } catch {
      // Fall through to the in-memory store.
    }
  }
  memoryStore[key] = value;
}

/**
 * Removes the entry for `key` from storage.
 *
 * @param key - The storage key to remove.
 */
export async function removeItem(key: string): Promise<void> {
  if (AsyncStorage) {
    try {
      await AsyncStorage.removeItem(key);
      return;
    } catch {
      // Fall through to the in-memory store.
    }
  }
  delete memoryStore[key];
}
