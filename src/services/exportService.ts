import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { ProjectFile } from '../types';
import { encryptProjectFiles } from './encryptionService';

/**
 * Normal ZIP export of all files.
 */
export async function exportProjectAsZip(files: ProjectFile[], projectName: string): Promise<void> {
  const zip = new JSZip();
  files.forEach((file) => {
    if (!file.isFolder) {
      zip.file(file.name, file.content);
    }
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const safeName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'axiomtex_project';
  saveAs(blob, `${safeName}_source.zip`);
}

/**
 * arXiv submission package export.
 * Strips comments from .tex files, includes .bib and figures, and adds a 00README.XXX instruction.
 */
export async function exportArxivPackage(files: ProjectFile[], projectName: string): Promise<void> {
  const zip = new JSZip();

  files.forEach((file) => {
    if (file.isFolder) return;

    if (file.name.endsWith('.tex')) {
      // Strip comments while preserving escaped percentage signs \%
      const cleanedTex = file.content
        .split('\n')
        .map((line) => {
          // Replace comment only if not preceded by backslash
          return line.replace(/(?<!\\)%.*$/, '').trimEnd();
        })
        .filter((line) => line.length > 0)
        .join('\n');

      zip.file(file.name, cleanedTex);
    } else {
      zip.file(file.name, file.content);
    }
  });

  // Add 00README.XXX for arXiv automated build system
  zip.file('00README.XXX', 'nostamp\ntoplevel main.tex\n');

  const blob = await zip.generateAsync({ type: 'blob' });
  const safeName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'arxiv_submission';
  saveAs(blob, `${safeName}_arxiv.zip`);
}

/**
 * End-to-End Encrypted project export (.otex.enc).
 */
export async function exportEncryptedProject(files: ProjectFile[], projectName: string, password: string): Promise<void> {
  const encryptedPayload = await encryptProjectFiles(files, password);
  const blob = new Blob([encryptedPayload], { type: 'application/json' });
  const safeName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'encrypted_project';
  saveAs(blob, `${safeName}.otex.enc`);
}
