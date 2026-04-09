/**
 * @fileoverview Lightweight cross-platform key-value storage abstraction.
 *
 * Provides `getItem`, `setItem`, and `removeItem` with automatic fallback
 * across three storage backends in priority order:
 *
 * 1. **AsyncStorage** (`@react-native-async-storage/async-storage`) — the
 *    standard React Native persistent store; available on iOS and Android.
 * 2. **Expo FileSystem** — stores a single JSON file in the app's document
 *    directory; used on platforms where AsyncStorage is unavailable (e.g.
 *    Expo Go on some configurations).
 * 3. **In-memory map** — last resort; data is lost when the app restarts but
 *    prevents crashes in test environments or on web.
 *
 * Consumers import these three functions directly and never need to know
 * which backend is active.
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

/** In-memory fallback store; only used when both AsyncStorage and FileSystem are unavailable. */
let memoryStore: Record<string, string> = {};

// Dynamic requires prevent hard crashes when a native module is unavailable.
let AsyncStorage: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  // Unavailable — will fall through to FileSystem or memory.
}

let FileSystem: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  FileSystem = require('expo-file-system');
} catch {
  // Unavailable — will fall through to memory.
}

/** Absolute path to the single JSON file used as the FileSystem store. */
const FS_DIR = FileSystem ? FileSystem.documentDirectory : null;
const FS_FILE = FS_DIR ? `${FS_DIR}conjugate_igbo_store.json` : null;

// ---------------------------------------------------------------------------
// FileSystem helpers (internal)
// ---------------------------------------------------------------------------

/**
 * Reads the entire FileSystem JSON store into a plain object.
 * Returns an empty object on any error (file not found, parse failure, etc.).
 */
async function fsReadAll(): Promise<Record<string, string>> {
  if (!FileSystem || !FS_FILE) return {};
  try {
    const info = await FileSystem.getInfoAsync(FS_FILE);
    if (!info.exists) return {};
    const content = await FileSystem.readAsStringAsync(FS_FILE);
    return JSON.parse(content || '{}');
  } catch {
    return {};
  }
}

/**
 * Serialises `obj` and writes it to the FileSystem JSON store.
 * Silently no-ops on error to prevent crashing on storage write failures.
 *
 * @param obj - The full key-value map to persist.
 */
async function fsWriteAll(obj: Record<string, string>): Promise<void> {
  if (!FileSystem || !FS_FILE) return;
  try {
    await FileSystem.writeAsStringAsync(FS_FILE, JSON.stringify(obj));
  } catch {
    // Ignore write failures — callers get stale data but won't crash.
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Retrieves the stored string value for `key`.
 *
 * Tries AsyncStorage first, then FileSystem, then the in-memory map.
 *
 * @param key - The storage key.
 * @returns The stored string, or `null` if the key does not exist.
 */
export async function getItem(key: string): Promise<string | null> {
  if (AsyncStorage) {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      // Fall through to next backend.
    }
  }
  if (FileSystem) {
    const obj = await fsReadAll();
    return key in obj ? obj[key] : null;
  }
  return key in memoryStore ? memoryStore[key] : null;
}

/**
 * Stores a string value under `key`.
 *
 * Tries AsyncStorage first, then FileSystem, then the in-memory map.
 *
 * @param key   - The storage key.
 * @param value - The string value to store (typically a JSON-serialised object).
 */
export async function setItem(key: string, value: string): Promise<void> {
  if (AsyncStorage) {
    try {
      await AsyncStorage.setItem(key, value);
      return;
    } catch {
      // Fall through to next backend.
    }
  }
  if (FileSystem) {
    const obj = await fsReadAll();
    obj[key] = value;
    await fsWriteAll(obj);
    return;
  }
  memoryStore[key] = value;
}

/**
 * Removes the entry for `key` from storage.
 *
 * Tries AsyncStorage first, then FileSystem, then the in-memory map.
 *
 * @param key - The storage key to remove.
 */
export async function removeItem(key: string): Promise<void> {
  if (AsyncStorage) {
    try {
      await AsyncStorage.removeItem(key);
      return;
    } catch {
      // Fall through to next backend.
    }
  }
  if (FileSystem) {
    const obj = await fsReadAll();
    delete obj[key];
    await fsWriteAll(obj);
    return;
  }
  delete memoryStore[key];
}
