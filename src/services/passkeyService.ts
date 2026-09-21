/**
 * WebAuthn (FIDO2) / Passkey Service for AxiomTeX
 * Provides biometric passwordless registration, authentication, session locking, and PIN fallback.
 */

export interface StoredPasskey {
  id: string;
  rawId: string;
  name: string;
  createdAt: string;
}

const STORAGE_PASSKEYS_KEY = 'axiomtex_passkeys_v1';
const STORAGE_LOCK_KEY = 'axiomtex_vault_locked_v1';
const STORAGE_PIN_KEY = 'axiomtex_pin_code_v1';

const LEGACY_STORAGE_PASSKEYS_KEY = 'opentex_passkeys_v1';
const LEGACY_STORAGE_LOCK_KEY = 'opentex_vault_locked_v1';
const LEGACY_STORAGE_PIN_KEY = 'opentex_pin_code_v1';

// Helper: Convert Uint8Array to Base64URL string
function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (let i = 0; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Helper: Convert Base64URL string to Uint8Array
function base64urlToBuffer(base64url: string): ArrayBuffer {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Checks if the current browser environment supports WebAuthn / Passkeys.
 */
export function isPasskeySupported(): boolean {
  return typeof window !== 'undefined' && 
         Boolean(window.PublicKeyCredential) && 
         typeof navigator.credentials?.create === 'function';
}

/**
 * Loads all registered passkeys from local storage.
 */
export function getStoredPasskeys(): StoredPasskey[] {
  try {
    const raw = localStorage.getItem(STORAGE_PASSKEYS_KEY) || localStorage.getItem(LEGACY_STORAGE_PASSKEYS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Registers a new passkey (Touch ID, Face ID, Windows Hello, YubiKey) using WebAuthn.
 */
export async function registerPasskey(userName: string, userDisplayName: string, customDeviceName?: string): Promise<StoredPasskey> {
  if (!isPasskeySupported()) {
    throw new Error('WebAuthn / Passkeys werden von diesem Browser nicht unterstützt.');
  }

  // 32-byte cryptographically secure challenge
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);

  // User identifier
  const userId = new Uint8Array(16);
  crypto.getRandomValues(userId);

  const hostname = window.location.hostname || 'localhost';

  const creationOptions: PublicKeyCredentialCreationOptions = {
    challenge,
    rp: {
      name: 'AxiomTeX Workspace',
      id: hostname === '127.0.0.1' ? 'localhost' : hostname,
    },
    user: {
      id: userId,
      name: userName || 'user@axiomtex.org',
      displayName: userDisplayName || 'AxiomTeX Researcher',
    },
    pubKeyCredParams: [
      { type: 'public-key', alg: -7 },   // ES256
      { type: 'public-key', alg: -257 }, // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform', // TouchID, FaceID, Windows Hello
      residentKey: 'preferred',
      userVerification: 'preferred',
    },
    timeout: 60000,
  };

  const credential = await navigator.credentials.create({
    publicKey: creationOptions,
  }) as PublicKeyCredential;

  if (!credential) {
    throw new Error('Registrierung wurde vom Benutzer abgebrochen.');
  }

  const rawIdBase64 = bufferToBase64url(credential.rawId);
  const deviceName = customDeviceName || detectDeviceName();

  const newPasskey: StoredPasskey = {
    id: credential.id,
    rawId: rawIdBase64,
    name: deviceName,
    createdAt: new Date().toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  const existing = getStoredPasskeys();
  const updated = [...existing, newPasskey];
  localStorage.setItem(STORAGE_PASSKEYS_KEY, JSON.stringify(updated));

  return newPasskey;
}

/**
 * Authenticates the user with their registered Passkey.
 */
export async function authenticateWithPasskey(): Promise<boolean> {
  if (!isPasskeySupported()) {
    throw new Error('WebAuthn / Passkeys werden von diesem Browser nicht unterstützt.');
  }

  const passkeys = getStoredPasskeys();
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);

  const hostname = window.location.hostname || 'localhost';

  const requestOptions: PublicKeyCredentialRequestOptions = {
    challenge,
    rpId: hostname === '127.0.0.1' ? 'localhost' : hostname,
    userVerification: 'preferred',
    timeout: 60000,
  };

  if (passkeys.length > 0) {
    requestOptions.allowCredentials = passkeys.map((p) => ({
      id: base64urlToBuffer(p.rawId),
      type: 'public-key',
    }));
  }

  const assertion = await navigator.credentials.get({
    publicKey: requestOptions,
  });

  return Boolean(assertion);
}

/**
 * Deletes a registered passkey.
 */
export function deletePasskey(id: string): StoredPasskey[] {
  const current = getStoredPasskeys();
  const updated = current.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_PASSKEYS_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Checks if the vault is currently locked.
 */
export function isVaultLocked(): boolean {
  return (localStorage.getItem(STORAGE_LOCK_KEY) || localStorage.getItem(LEGACY_STORAGE_LOCK_KEY)) === 'true';
}

/**
 * Sets the vault lock status.
 */
export function setVaultLocked(locked: boolean): void {
  localStorage.setItem(STORAGE_LOCK_KEY, locked ? 'true' : 'false');
}

/**
 * Validates fallback security PIN.
 * Default PIN is '1234' if none has been configured.
 */
export function verifyPin(enteredPin: string): boolean {
  const stored = localStorage.getItem(STORAGE_PIN_KEY) || localStorage.getItem(LEGACY_STORAGE_PIN_KEY) || '1234';
  return enteredPin === stored;
}

/**
 * Updates security PIN.
 */
export function setPin(newPin: string): void {
  localStorage.setItem(STORAGE_PIN_KEY, newPin);
}

export const setStoredPin = setPin;

function detectDeviceName(): string {
  const ua = navigator.userAgent;
  if (/Macintosh|Mac OS X/i.test(ua)) return 'Mac Touch ID / Apple Passkey';
  if (/iPhone|iPad/i.test(ua)) return 'Apple Face ID / Touch ID';
  if (/Windows/i.test(ua)) return 'Windows Hello Passkey';
  if (/Android/i.test(ua)) return 'Android Biometrics';
  if (/Linux/i.test(ua)) return 'FIDO2 Security Key';
  return 'Biometrischer Passkey';
}
