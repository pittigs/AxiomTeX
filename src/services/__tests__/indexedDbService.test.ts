import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  formatBytes,
  isIndexedDbSupported,
  getStorageEstimate,
  migrateLocalStorageToIndexedDB,
} from '../indexedDbService';

describe('indexedDbService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('formatBytes', () => {
    it('formats 0 bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 B');
      expect(formatBytes(-5)).toBe('0 B');
      expect(formatBytes(NaN)).toBe('0 B');
    });

    it('formats bytes, kilobytes, megabytes, and gigabytes', () => {
      expect(formatBytes(512)).toBe('512 B');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1024 * 1024)).toBe('1 MB');
      expect(formatBytes(14.2 * 1024 * 1024)).toBe('14.2 MB');
      expect(formatBytes(5 * 1024 * 1024 * 1024)).toBe('5 GB');
    });

    it('respects decimal precision parameter', () => {
      expect(formatBytes(1536, 2)).toBe('1.5 KB');
      expect(formatBytes(14.256 * 1024 * 1024, 2)).toBe('14.26 MB');
      expect(formatBytes(14.256 * 1024 * 1024, 0)).toBe('14 MB');
    });
  });

  describe('isIndexedDbSupported', () => {
    it('returns a boolean value indicating environment support', () => {
      const supported = isIndexedDbSupported();
      expect(typeof supported).toBe('boolean');
    });
  });

  describe('getStorageEstimate', () => {
    it('returns valid StorageEstimateInfo structure using navigator.storage.estimate', async () => {
      // Mock navigator.storage.estimate
      const mockEstimate = vi.fn().mockResolvedValue({
        usage: 25 * 1024 * 1024, // 25 MB
        quota: 10 * 1024 * 1024 * 1024, // 10 GB
      });

      Object.defineProperty(globalThis.navigator, 'storage', {
        value: {
          estimate: mockEstimate,
        },
        configurable: true,
        writable: true,
      });

      const result = await getStorageEstimate();
      expect(result.usageBytes).toBe(25 * 1024 * 1024);
      expect(result.quotaBytes).toBe(10 * 1024 * 1024 * 1024);
      expect(result.usageFormatted).toBe('25 MB');
      expect(result.quotaFormatted).toBe('10 GB');
      expect(result.percentUsed).toBe(0); // 25MB / 10GB is < 1% -> 0%
    });

    it('falls back to calculating localStorage footprint if navigator.storage is unavailable', async () => {
      Object.defineProperty(globalThis.navigator, 'storage', {
        value: undefined,
        configurable: true,
        writable: true,
      });

      localStorage.setItem('axiomtex_test_key', 'some content');

      const result = await getStorageEstimate();
      expect(result.usageBytes).toBeGreaterThan(0);
      expect(result.quotaBytes).toBe(5 * 1024 * 1024 * 1024);
      expect(result.quotaFormatted).toBe('5 GB');
      expect(typeof result.percentUsed).toBe('number');
      expect(typeof result.isIndexedDbSupported).toBe('boolean');
    });
  });

  describe('migrateLocalStorageToIndexedDB', () => {
    it('gracefully handles migration check when indexedDB is unsupported or empty', async () => {
      const res = await migrateLocalStorageToIndexedDB();
      expect(res).toHaveProperty('migrated');
      expect(res).toHaveProperty('count');
      expect(typeof res.migrated).toBe('boolean');
      expect(typeof res.count).toBe('number');
    });
  });
});
