import { describe, it, expect, beforeEach } from 'vitest';
import {
  getCloudStorageConfig,
  saveCloudStorageConfig,
  createProjectCloudPayload,
  DEFAULT_CLOUD_CONFIG
} from '../cloudSyncService';
import type { ProjectFile } from '../../types';

describe('cloudSyncService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should load default cloud configuration if none is stored', () => {
    const config = getCloudStorageConfig();
    expect(config.provider).toBe(DEFAULT_CLOUD_CONFIG.provider);
    expect(config.enabled).toBe(false);
  });

  it('should save and retrieve updated cloud configuration', () => {
    saveCloudStorageConfig({
      provider: 'google-drive',
      enabled: true,
      autoSync: true,
      googleFolderName: 'MyUniResearch'
    });

    const updated = getCloudStorageConfig();
    expect(updated.enabled).toBe(true);
    expect(updated.autoSync).toBe(true);
    expect(updated.googleFolderName).toBe('MyUniResearch');
  });

  it('should generate valid JSON backup payload for project', () => {
    const files: ProjectFile[] = [
      {
        id: '1',
        name: 'paper.tex',
        path: '/paper.tex',
        content: '\\documentclass{article}',
        isFolder: false,
        type: 'tex'
      }
    ];

    const payload = createProjectCloudPayload('Quantum Paper', files);
    const parsed = JSON.parse(payload);
    expect(parsed.appName).toBe('AxiomTeX');
    expect(parsed.projectName).toBe('Quantum Paper');
    expect(parsed.files.length).toBe(1);
  });
});
