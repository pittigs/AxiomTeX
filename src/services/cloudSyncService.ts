import type { CloudStorageConfig, ProjectFile } from '../types';

const CLOUD_CONFIG_KEY = 'axiomtex_cloud_storage_config';
const LEGACY_CLOUD_CONFIG_KEY = 'opentex_cloud_storage_config';

export const DEFAULT_CLOUD_CONFIG: CloudStorageConfig = {
  provider: 'google-drive',
  enabled: false,
  autoSync: false,
  googleFolderName: 'AxiomTeX_Projects',
  webdavRemotePath: '/AxiomTeX/'
};

/**
 * Gets saved cloud storage configuration
 */
export function getCloudStorageConfig(): CloudStorageConfig {
  try {
    const raw = localStorage.getItem(CLOUD_CONFIG_KEY) || localStorage.getItem(LEGACY_CLOUD_CONFIG_KEY);
    if (!raw) return DEFAULT_CLOUD_CONFIG;
    return { ...DEFAULT_CLOUD_CONFIG, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Failed to parse cloud storage config:', err);
    return DEFAULT_CLOUD_CONFIG;
  }
}

/**
 * Saves cloud storage configuration
 */
export function saveCloudStorageConfig(config: CloudStorageConfig): void {
  try {
    localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save cloud storage config:', err);
  }
}

/**
 * Initiates Google OAuth2 token flow in client
 */
export function openGoogleDriveAuth(clientId: string): void {
  const redirectUri = window.location.origin + window.location.pathname;
  const scope = encodeURIComponent('https://www.googleapis.com/auth/drive.file');
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=token&scope=${scope}&include_granted_scopes=true`;

  window.open(authUrl, '_blank', 'width=500,height=600');
}

/**
 * Uploads a file/project to Google Drive via Drive v3 REST API
 */
export async function uploadToGoogleDrive(
  accessToken: string,
  fileName: string,
  content: string,
  mimeType: string = 'text/plain'
): Promise<{ success: boolean; fileId?: string; error?: string }> {
  try {
    const metadata = {
      name: fileName,
      mimeType: mimeType
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([content], { type: mimeType }));

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: form
    });

    if (!response.ok) {
      const errData = await response.json();
      return { success: false, error: errData?.error?.message || 'Google Drive Upload fehlgeschlagen.' };
    }

    const data = await response.json();
    return { success: true, fileId: data.id };
  } catch (err: any) {
    return { success: false, error: err.message || 'Netzwerkfehler beim Google Drive Upload' };
  }
}

/**
 * Syncs project files directly to the user's local disk using the Chromium File System Access API
 */
export async function syncToLocalDirectory(
  dirHandle: any,
  files: ProjectFile[]
): Promise<{ success: boolean; filesWritten: number; error?: string }> {
  try {
    let count = 0;
    for (const file of files) {
      if (file.isFolder) continue;
      // Get or create file handle
      const fileHandle = await dirHandle.getFileHandle(file.name, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(file.content || '');
      await writable.close();
      count++;
    }
    return { success: true, filesWritten: count };
  } catch (err: any) {
    return { success: false, filesWritten: 0, error: err.message || 'Fehler beim Schreiben auf das lokale Dateisystem' };
  }
}

/**
 * Exports project as a JSON backup payload ready for Cloud or Local storage
 */
export function createProjectCloudPayload(projectName: string, files: ProjectFile[]): string {
  return JSON.stringify(
    {
      appName: 'AxiomTeX',
      version: '1.0.0',
      projectName,
      exportedAt: new Date().toISOString(),
      files
    },
    null,
    2
  );
}
