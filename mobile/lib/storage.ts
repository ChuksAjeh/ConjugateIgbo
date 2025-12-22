// Lightweight storage wrapper with graceful fallbacks
// Tries AsyncStorage, then Expo FileSystem JSON file, else in-memory

let memoryStore: Record<string, string> = {};

// Dynamic requires to avoid hard dependency crashes
let AsyncStorage: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  // ignore
}

let FileSystem: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  FileSystem = require('expo-file-system');
} catch {
  // ignore
}

const FS_DIR = FileSystem ? FileSystem.documentDirectory : null;
const FS_FILE = FS_DIR ? FS_DIR + 'conjugate_igbo_store.json' : null;

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

async function fsWriteAll(obj: Record<string, string>): Promise<void> {
  if (!FileSystem || !FS_FILE) return;
  try {
    await FileSystem.writeAsStringAsync(FS_FILE, JSON.stringify(obj));
  } catch {
    // ignore
  }
}

export async function getItem(key: string): Promise<string | null> {
  if (AsyncStorage) {
    try {
      const v = await AsyncStorage.getItem(key);
      return v;
    } catch {
      // fall through
    }
  }
  if (FileSystem) {
    const obj = await fsReadAll();
    return key in obj ? obj[key] : null;
  }
  return key in memoryStore ? memoryStore[key] : null;
}

export async function setItem(key: string, value: string): Promise<void> {
  if (AsyncStorage) {
    try {
      await AsyncStorage.setItem(key, value);
      return;
    } catch {
      // fall through
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

export async function removeItem(key: string): Promise<void> {
  if (AsyncStorage) {
    try {
      await AsyncStorage.removeItem(key);
      return;
    } catch {
      // fall through
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
