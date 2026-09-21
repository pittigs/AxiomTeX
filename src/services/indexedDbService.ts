import type { ProjectSummary, StorageEstimateInfo, UserProfile } from '../types';

const DB_NAME = 'axiomtex_db';
const DB_VERSION = 1;
const PROJECTS_STORE = 'projects';
const KEYVAL_STORE = 'keyval';

const STORAGE_PROJECTS_KEY = 'axiomtex_projects_v1';
const LEGACY_STORAGE_PROJECTS_KEY = 'opentex_projects_v1';
const STORAGE_PROFILE_KEY = 'axiomtex_user_profile_v1';
const LEGACY_STORAGE_PROFILE_KEY = 'opentex_user_profile_v1';

/**
 * Checks whether IndexedDB is supported in the current environment.
 */
export function isIndexedDbSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'indexedDB' in window &&
    window.indexedDB !== null &&
    window.indexedDB !== undefined
  );
}

/**
 * Opens and returns the AxiomTeX IndexedDB database instance.
 */
export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDbSupported()) {
      return reject(new Error('IndexedDB is not supported in this environment.'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
        db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(KEYVAL_STORE)) {
        db.createObjectStore(KEYVAL_STORE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB database.'));
    };
  });
}

/**
 * Retrieves all projects stored in IndexedDB.
 */
export async function getAllProjectsFromDB(): Promise<ProjectSummary[]> {
  if (!isIndexedDbSupported()) return [];
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PROJECTS_STORE, 'readonly');
      const store = tx.objectStore(PROJECTS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => {
        reject(request.error || new Error('Failed to fetch projects from IndexedDB.'));
      };
    });
  } catch (err) {
    console.warn('getAllProjectsFromDB failed:', err);
    return [];
  }
}

/**
 * Persists a list of projects into IndexedDB (clears and re-inserts or batch puts).
 */
export async function saveProjectsToDB(projects: ProjectSummary[]): Promise<void> {
  if (!isIndexedDbSupported()) return;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PROJECTS_STORE, 'readwrite');
      const store = tx.objectStore(PROJECTS_STORE);

      // Clear existing to avoid orphaned projects
      store.clear();

      for (const project of projects) {
        store.put(project);
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('Failed to save projects to IndexedDB.'));
      tx.onabort = () => reject(tx.error || new Error('Transaction aborted while saving projects.'));
    });
  } catch (err) {
    console.warn('saveProjectsToDB failed:', err);
  }
}

/**
 * Saves or updates a single project in IndexedDB.
 */
export async function saveProjectToDB(project: ProjectSummary): Promise<void> {
  if (!isIndexedDbSupported()) return;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PROJECTS_STORE, 'readwrite');
      const store = tx.objectStore(PROJECTS_STORE);
      store.put(project);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error(`Failed to save project ${project.id} to IndexedDB.`));
    });
  } catch (err) {
    console.warn('saveProjectToDB failed:', err);
  }
}

/**
 * Deletes a project from IndexedDB by ID.
 */
export async function deleteProjectFromDB(projectId: string): Promise<void> {
  if (!isIndexedDbSupported()) return;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PROJECTS_STORE, 'readwrite');
      const store = tx.objectStore(PROJECTS_STORE);
      store.delete(projectId);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error(`Failed to delete project ${projectId} from IndexedDB.`));
    });
  } catch (err) {
    console.warn('deleteProjectFromDB failed:', err);
  }
}

/**
 * Retrieves a key-value item from the keyval store.
 */
export async function getValFromDB<T>(key: string): Promise<T | null> {
  if (!isIndexedDbSupported()) return null;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(KEYVAL_STORE, 'readonly');
      const store = tx.objectStore(KEYVAL_STORE);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result ? (request.result.value as T) : null);
      };
      request.onerror = () => {
        reject(request.error || new Error(`Failed to get key "${key}" from IndexedDB.`));
      };
    });
  } catch (err) {
    console.warn(`getValFromDB("${key}") failed:`, err);
    return null;
  }
}

/**
 * Sets a key-value item in the keyval store.
 */
export async function setValInDB<T>(key: string, value: T): Promise<void> {
  if (!isIndexedDbSupported()) return;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(KEYVAL_STORE, 'readwrite');
      const store = tx.objectStore(KEYVAL_STORE);
      store.put({ key, value });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error(`Failed to set key "${key}" in IndexedDB.`));
    });
  } catch (err) {
    console.warn(`setValInDB("${key}") failed:`, err);
  }
}

/**
 * Migrates existing data from localStorage into IndexedDB seamlessly without data loss.
 */
export async function migrateLocalStorageToIndexedDB(): Promise<{ migrated: boolean; count: number }> {
  if (!isIndexedDbSupported()) {
    return { migrated: false, count: 0 };
  }

  try {
    const existingInDb = await getAllProjectsFromDB();

    // Check if localStorage has projects
    let rawProjects = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_PROJECTS_KEY) : null;
    if (!rawProjects && typeof localStorage !== 'undefined') {
      rawProjects = localStorage.getItem(LEGACY_STORAGE_PROJECTS_KEY);
    }

    let localProjects: ProjectSummary[] = [];
    if (rawProjects) {
      try {
        const parsed = JSON.parse(rawProjects);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localProjects = parsed;
        }
      } catch (err) {
        console.warn('Failed to parse localStorage projects for IndexedDB migration:', err);
      }
    }

    // If IndexedDB is empty and localStorage has projects, migrate them!
    if (existingInDb.length === 0 && localProjects.length > 0) {
      await saveProjectsToDB(localProjects);

      // Also migrate user profile if available
      let rawProfile = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_PROFILE_KEY) : null;
      if (!rawProfile && typeof localStorage !== 'undefined') {
        rawProfile = localStorage.getItem(LEGACY_STORAGE_PROFILE_KEY);
      }
      if (rawProfile) {
        try {
          const profile = JSON.parse(rawProfile) as UserProfile;
          await setValInDB('user_profile', profile);
        } catch {
          // ignore
        }
      }

      return { migrated: true, count: localProjects.length };
    }

    return { migrated: false, count: existingInDb.length };
  } catch (err) {
    console.warn('IndexedDB migration failed:', err);
    return { migrated: false, count: 0 };
  }
}

/**
 * Formats a byte size into human-readable format (B, KB, MB, GB).
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes <= 0 || isNaN(bytes)) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = bytes / Math.pow(k, i);
  return `${parseFloat(val.toFixed(dm))} ${sizes[i]}`;
}

/**
 * Queries the real storage usage and quota from navigator.storage.estimate().
 * Falls back to calculating localStorage footprint if unavailable.
 */
export async function getStorageEstimate(): Promise<StorageEstimateInfo> {
  const isSupported = isIndexedDbSupported();

  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const usageBytes = estimate.usage ?? 0;
      // Default quota fallback to 5 GB if undefined
      const quotaBytes = estimate.quota ?? 5 * 1024 * 1024 * 1024;
      const percentUsed = quotaBytes > 0 ? Math.min(100, Math.round((usageBytes / quotaBytes) * 100)) : 0;

      return {
        usageBytes,
        quotaBytes,
        usageFormatted: formatBytes(usageBytes),
        quotaFormatted: formatBytes(quotaBytes),
        percentUsed,
        isIndexedDbSupported: isSupported,
      };
    } catch (err) {
      console.warn('navigator.storage.estimate() failed:', err);
    }
  }

  // Fallback: estimate based on localStorage or memory size
  let approxBytes = 0;
  try {
    if (typeof localStorage !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          approxBytes += (key.length + (localStorage.getItem(key)?.length || 0)) * 2; // UTF-16 approximation
        }
      }
    }
  } catch {
    approxBytes = 14.2 * 1024 * 1024;
  }

  const quotaBytes = 5 * 1024 * 1024 * 1024; // 5 GB
  const percentUsed = quotaBytes > 0 ? Math.min(100, Math.round((approxBytes / quotaBytes) * 100)) : 0;

  return {
    usageBytes: approxBytes,
    quotaBytes,
    usageFormatted: formatBytes(approxBytes),
    quotaFormatted: formatBytes(quotaBytes),
    percentUsed,
    isIndexedDbSupported: isSupported,
  };
}
