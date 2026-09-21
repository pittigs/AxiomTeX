/**
 * End-to-End Encryption Service for AxiomTeX
 * Uses Web Crypto API (AES-256-GCM + PBKDF2) for client-side encryption of project files.
 */

import type { ProjectFile } from '../types';

export interface EncryptedPackage {
  version: number;
  cipher: 'AES-256-GCM';
  salt: string; // Base64
  iv: string;   // Base64
  data: string; // Base64 encrypted payload
}

// Convert Buffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Derive AES-GCM 256-bit key using PBKDF2 (100,000 iterations, SHA-256)
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts an array of ProjectFiles with a user passphrase.
 */
export async function encryptProjectFiles(files: ProjectFile[], passphrase: string): Promise<string> {
  if (!passphrase || passphrase.length < 4) {
    throw new Error('Das Passwort muss mindestens 4 Zeichen lang sein.');
  }

  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);

  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);

  const key = await deriveKey(passphrase, salt);
  const jsonPayload = JSON.stringify(files);
  const enc = new TextEncoder();
  const encodedData = enc.encode(jsonPayload);

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource,
    },
    key,
    encodedData
  );

  const packageObj: EncryptedPackage = {
    version: 1,
    cipher: 'AES-256-GCM',
    salt: arrayBufferToBase64(salt),
    iv: arrayBufferToBase64(iv),
    data: arrayBufferToBase64(encryptedBuffer),
  };

  return JSON.stringify(packageObj, null, 2);
}

/**
 * Decrypts an encrypted package string using the passphrase.
 */
export async function decryptProjectFiles(encryptedJson: string, passphrase: string): Promise<ProjectFile[]> {
  let pkg: EncryptedPackage;
  try {
    pkg = JSON.parse(encryptedJson);
  } catch {
    throw new Error('Ungültiges Dateiformat für das verschlüsselte Projekt.');
  }

  if (pkg.cipher !== 'AES-256-GCM') {
    throw new Error(`Nicht unterstützte Verschlüsselung: ${pkg.cipher}`);
  }

  const salt = base64ToUint8Array(pkg.salt);
  const iv = base64ToUint8Array(pkg.iv);
  const encryptedBytes = base64ToUint8Array(pkg.data);

  const key = await deriveKey(passphrase, salt);

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource,
      },
      key,
      encryptedBytes as unknown as BufferSource
    );

    const dec = new TextDecoder();
    const jsonStr = dec.decode(decryptedBuffer);
    return JSON.parse(jsonStr) as ProjectFile[];
  } catch {
    throw new Error('Entschlüsselung fehlgeschlagen. Falsches Passwort oder beschädigte Datei.');
  }
}
