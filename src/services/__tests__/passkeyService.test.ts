import { describe, it, expect, beforeEach } from 'vitest';
import {
  isPasskeySupported,
  getStoredPasskeys,
  deletePasskey,
  isVaultLocked,
  setVaultLocked,
  verifyPin,
  setPin,
} from '../passkeyService';

describe('passkeyService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('PIN verification and management', () => {
    it('uses default PIN 1234 when none is set', () => {
      expect(verifyPin('1234')).toBe(true);
      expect(verifyPin('0000')).toBe(false);
    });

    it('allows updating and verifying new custom PIN', () => {
      setPin('9876');
      expect(verifyPin('9876')).toBe(true);
      expect(verifyPin('1234')).toBe(false);
    });
  });

  describe('Vault lock state management', () => {
    it('is unlocked by default', () => {
      expect(isVaultLocked()).toBe(false);
    });

    it('toggles lock state accurately', () => {
      setVaultLocked(true);
      expect(isVaultLocked()).toBe(true);
      setVaultLocked(false);
      expect(isVaultLocked()).toBe(false);
    });
  });

  describe('Stored passkeys management', () => {
    it('returns empty array when no passkeys are stored', () => {
      expect(getStoredPasskeys()).toEqual([]);
    });

    it('can delete a passkey by ID', () => {
      const mockKeys = [
        { id: 'key-1', rawId: 'raw1', name: 'Device 1', createdAt: '01.01.2026' },
        { id: 'key-2', rawId: 'raw2', name: 'Device 2', createdAt: '02.01.2026' },
      ];
      localStorage.setItem('axiomtex_passkeys_v1', JSON.stringify(mockKeys));

      const updated = deletePasskey('key-1');
      expect(updated).toHaveLength(1);
      expect(updated[0].id).toBe('key-2');
      expect(getStoredPasskeys()).toHaveLength(1);
    });
  });

  describe('isPasskeySupported', () => {
    it('returns boolean based on browser support', () => {
      const supported = isPasskeySupported();
      expect(typeof supported).toBe('boolean');
    });
  });
});
