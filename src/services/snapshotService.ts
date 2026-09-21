import type { DiffLine, ProjectFile, ProjectSnapshot } from '../types';

const SNAPSHOTS_STORAGE_KEY_PREFIX = 'axiomtex_snapshots_';
const LEGACY_SNAPSHOTS_STORAGE_KEY_PREFIX = 'opentex_snapshots_';

/**
 * Gets all saved snapshots for a given project ID
 */
export function getProjectSnapshots(projectId: string): ProjectSnapshot[] {
  try {
    const raw = localStorage.getItem(`${SNAPSHOTS_STORAGE_KEY_PREFIX}${projectId}`) ||
                localStorage.getItem(`${LEGACY_SNAPSHOTS_STORAGE_KEY_PREFIX}${projectId}`);
    if (!raw) return [];
    return JSON.parse(raw) as ProjectSnapshot[];
  } catch (err) {
    console.error('Failed to load snapshots:', err);
    return [];
  }
}

/**
 * Saves a new snapshot for a project
 */
export function createProjectSnapshot(
  projectId: string,
  name: string,
  files: ProjectFile[],
  description?: string,
  tags?: string[]
): ProjectSnapshot {
  const snapshots = getProjectSnapshots(projectId);

  const newSnapshot: ProjectSnapshot = {
    id: `snap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    projectId,
    name: name.trim() || `Snapshot ${snapshots.length + 1}`,
    description: description?.trim(),
    timestamp: new Date().toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    createdAt: Date.now(),
    files: JSON.parse(JSON.stringify(files)),
    tags: tags || []
  };

  const updated = [newSnapshot, ...snapshots];
  try {
    localStorage.setItem(`${SNAPSHOTS_STORAGE_KEY_PREFIX}${projectId}`, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save snapshot:', err);
  }

  return newSnapshot;
}

/**
 * Deletes a snapshot by ID
 */
export function deleteProjectSnapshot(projectId: string, snapshotId: string): ProjectSnapshot[] {
  const snapshots = getProjectSnapshots(projectId).filter(s => s.id !== snapshotId);
  try {
    localStorage.setItem(`${SNAPSHOTS_STORAGE_KEY_PREFIX}${projectId}`, JSON.stringify(snapshots));
  } catch (err) {
    console.error('Failed to delete snapshot:', err);
  }
  return snapshots;
}

/**
 * Computes a line-by-line diff between two strings using Longest Common Subsequence (LCS)
 */
export function computeLineDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');

  const n = oldLines.length;
  const m = newLines.length;

  // Build DP table for LCS
  // Note: Cap size if documents are very large (> 2000 lines) to avoid O(N*M) memory spikes
  if (n > 2000 || m > 2000) {
    // Simple line comparison for huge files
    const result: DiffLine[] = [];
    let i = 0;
    while (i < Math.max(n, m)) {
      if (i < n && i < m) {
        if (oldLines[i] === newLines[i]) {
          result.push({ type: 'unchanged', text: oldLines[i], oldLineNumber: i + 1, newLineNumber: i + 1 });
        } else {
          result.push({ type: 'removed', text: oldLines[i], oldLineNumber: i + 1 });
          result.push({ type: 'added', text: newLines[i], newLineNumber: i + 1 });
        }
      } else if (i < n) {
        result.push({ type: 'removed', text: oldLines[i], oldLineNumber: i + 1 });
      } else {
        result.push({ type: 'added', text: newLines[i], newLineNumber: i + 1 });
      }
      i++;
    }
    return result;
  }

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1) as unknown as number[]);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (oldLines[i] === newLines[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  // Backtrack to build diff
  const diff: DiffLine[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      diff.unshift({
        type: 'unchanged',
        text: oldLines[i - 1],
        oldLineNumber: i,
        newLineNumber: j
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.unshift({
        type: 'added',
        text: newLines[j - 1],
        newLineNumber: j
      });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      diff.unshift({
        type: 'removed',
        text: oldLines[i - 1],
        oldLineNumber: i
      });
      i--;
    }
  }

  return diff;
}
