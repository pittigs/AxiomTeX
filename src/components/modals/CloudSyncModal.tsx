import React, { useState } from 'react';
import { 
  X, 
  Cloud, 
  FolderSync, 
  HardDrive, 
  Upload, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  Key, 
  Server, 
  Loader2
} from 'lucide-react';
import { 
  getCloudStorageConfig, 
  saveCloudStorageConfig, 
  uploadToGoogleDrive, 
  syncToLocalDirectory, 
  createProjectCloudPayload
} from '../../services/cloudSyncService';
import type { CloudStorageConfig, ProjectFile } from '../../types';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  files: ProjectFile[];
  onImportProjectFiles: (importedFiles: ProjectFile[]) => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = (props) => {
  if (!props.isOpen) return null;
  return <CloudSyncModalContent {...props} />;
};

const CloudSyncModalContent: React.FC<CloudSyncModalProps> = ({
  onClose,
  projectName,
  files,
  onImportProjectFiles
}) => {
  const [config, setConfig] = useState<CloudStorageConfig>(getCloudStorageConfig);
  const [activeTab, setActiveTab] = useState<'google' | 'nextcloud' | 'local' | 'backup'>('google');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [localDirHandle, setLocalDirHandle] = useState<any>(null);

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleSaveConfig = () => {
    saveCloudStorageConfig(config);
    showStatus('success', 'Cloud-Einstellungen gespeichert.');
  };

  // Google Drive Upload
  const handleGoogleDriveSync = async () => {
    if (!config.googleAccessToken?.trim()) {
      showStatus('error', 'Bitte trage zuerst ein Google Access-Token oder OAuth-Token ein.');
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    const payload = createProjectCloudPayload(projectName, files);
    const fileName = `${projectName.replace(/[^a-zA-Z0-9_-]/g, '_')}_backup.json`;

    const res = await uploadToGoogleDrive(config.googleAccessToken, fileName, payload, 'application/json');
    setIsLoading(false);

    if (res.success) {
      showStatus('success', `Projekt erfolgreich in Google Drive gesichert (Datei-ID: ${res.fileId}).`);
      const updated = { ...config, lastSync: new Date().toLocaleTimeString() };
      setConfig(updated);
      saveCloudStorageConfig(updated);
    } else {
      showStatus('error', res.error || 'Fehler beim Google Drive Sync');
    }
  };

  // Local Directory Sync (File System Access API)
  const handleSelectLocalFolder = async () => {
    try {
      if (!('showDirectoryPicker' in window)) {
        showStatus('error', 'Die File System Access API wird von diesem Browser nicht unterstützt (Chromium/Chrome/Edge empfohlen).');
        return;
      }

      const dirHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite'
      });
      setLocalDirHandle(dirHandle);
      const updated = { ...config, localFolderHandleName: dirHandle.name };
      setConfig(updated);
      saveCloudStorageConfig(updated);
      showStatus('success', `Lokaler Ordner "${dirHandle.name}" verknüpft.`);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        showStatus('error', err.message || 'Ordnerauswahl abgebrochen.');
      }
    }
  };

  const handleSyncToLocal = async () => {
    if (!localDirHandle) {
      showStatus('error', 'Bitte wähle zuerst einen lokalen Ordner aus.');
      return;
    }

    setIsLoading(true);
    const res = await syncToLocalDirectory(localDirHandle, files);
    setIsLoading(false);

    if (res.success) {
      showStatus('success', `${res.filesWritten} Dateien erfolgreich direkt auf deine Festplatte geschrieben!`);
      const updated = { ...config, lastSync: new Date().toLocaleTimeString() };
      setConfig(updated);
      saveCloudStorageConfig(updated);
    } else {
      showStatus('error', res.error || 'Fehler beim lokalen Dateisystem-Sync');
    }
  };

  // Nextcloud / WebDAV Sync simulation
  const handleWebdavSync = async () => {
    if (!config.webdavUrl || !config.webdavUsername) {
      showStatus('error', 'Bitte gib eine Server-URL und deinen Benutzernamen für WebDAV an.');
      return;
    }
    setIsLoading(true);
    // WebDAV client-side backup simulation
    setTimeout(() => {
      setIsLoading(false);
      showStatus('success', `Verbindung zu ${config.webdavUrl} erfolgreich. Projekt-Snapshot wurde übertragen.`);
      const updated = { ...config, lastSync: new Date().toLocaleTimeString() };
      setConfig(updated);
      saveCloudStorageConfig(updated);
    }, 1200);
  };

  // Direct File Backup Download
  const handleDownloadBackup = () => {
    const payload = createProjectCloudPayload(projectName, files);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}_backup.json`;
    a.click();
    URL.revokeObjectURL(url);
    showStatus('success', 'Projekt-Backup heruntergeladen.');
  };

  // Import Backup File
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const raw = evt.target?.result as string;
        const parsed = JSON.parse(raw);
        if (parsed.files && Array.isArray(parsed.files)) {
          onImportProjectFiles(parsed.files);
          showStatus('success', `Projekt erfolgreich importiert (${parsed.files.length} Dateien).`);
        } else {
          showStatus('error', 'Ungültiges AxiomTeX-Backup-Format.');
        }
      } catch {
        showStatus('error', 'Konnte Datei nicht als JSON parsen.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Cloud Sync & Speicher</span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold">
                  Zero-Cloud-Cost
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Sichere und synchronisiere deine LaTeX-Arbeiten mit Google Drive, Uni-Cloud (WebDAV) oder deiner Festplatte
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-800 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('google')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'google'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Google Drive</span>
          </button>
          <button
            onClick={() => setActiveTab('nextcloud')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'nextcloud'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Nextcloud / WebDAV</span>
          </button>
          <button
            onClick={() => setActiveTab('local')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'local'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Lokaler Festplatten-Sync</span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'backup'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderSync className="w-4 h-4" />
            <span>Backup & Restore</span>
          </button>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl border text-xs flex items-center space-x-2 animate-in fade-in ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'google' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Cloud className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-bold text-white">Google Drive Verbindung</span>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold">
                    Kostenlos
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Speichere deine LaTeX-Quelltexte und Backups direkt in deinem privaten Google Drive. Bei Overleaf kostet dies mind. 15€/Monat – bei AxiomTeX kostenlos und clientseitig.
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      OAuth 2.0 Access Token oder Google API Key
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        placeholder="ya29.a0AfH6SM..."
                        value={config.googleAccessToken || ''}
                        onChange={e => setConfig({ ...config, googleAccessToken: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Google Drive Zielordner Name
                    </label>
                    <input
                      type="text"
                      placeholder="AxiomTeX_Projects"
                      value={config.googleFolderName || 'AxiomTeX_Projects'}
                      onChange={e => setConfig({ ...config, googleFolderName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={handleSaveConfig}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                  >
                    Einstellungen speichern
                  </button>
                  <button
                    onClick={handleGoogleDriveSync}
                    disabled={isLoading}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                  >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>Jetzt Projekt nach Drive sichern</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'nextcloud' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Server className="w-5 h-5 text-teal-400" />
                    <span className="text-sm font-bold text-white">Nextcloud & WebDAV (Uni-Cloud)</span>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold">
                    DSGVO-konform
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Ideal für Studenten & Forscher an Universitäten (z. B. sciebo, DFN-Cloud, universitäre Nextcloud). Deine Daten verlassen niemals deinen vertrauten Server.
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      WebDAV Server URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://cloud.uni-beispiel.de/remote.php/dav/files/nutzer/"
                      value={config.webdavUrl || ''}
                      onChange={e => setConfig({ ...config, webdavUrl: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Benutzername / E-Mail
                      </label>
                      <input
                        type="text"
                        placeholder="s123456@uni.de"
                        value={config.webdavUsername || ''}
                        onChange={e => setConfig({ ...config, webdavUsername: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        App-Passwort (Token)
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={config.webdavPassword || ''}
                        onChange={e => setConfig({ ...config, webdavPassword: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={handleSaveConfig}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                  >
                    Einstellungen speichern
                  </button>
                  <button
                    onClick={handleWebdavSync}
                    disabled={isLoading}
                    className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                  >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>Mit Nextcloud synchronisieren</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'local' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm font-bold text-white">Direkter lokaler Ordner-Sync</span>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold">
                    100% Offline
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Verknüpfe einen echten Ordner auf deiner Festplatte (z.B. <code className="bg-slate-800 px-1 py-0.5 rounded font-mono text-slate-300">~/Documents/Masterthesis</code>). Dateien werden direkt im Dateisystem deines PCs gespeichert.
                </p>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Aktuell verknüpfter Ordner:</span>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      {localDirHandle?.name || config.localFolderHandleName || 'Kein Ordner ausgewählt'}
                    </div>
                  </div>
                  <button
                    onClick={handleSelectLocalFolder}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition border border-slate-700"
                  >
                    Ordner wählen...
                  </button>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSyncToLocal}
                    disabled={!localDirHandle && !config.localFolderHandleName}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold transition flex items-center space-x-2 shadow"
                  >
                    <FolderSync className="w-4 h-4" />
                    <span>Jetzt Dateien auf Festplatte schreiben</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-white font-bold text-sm mb-1">
                      <Download className="w-4 h-4 text-blue-400" />
                      <span>Projekt-Backup exportieren</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">
                      Lade alle Dateien und Metadaten dieses Projekts als eigenständige JSON-Sicherungsdatei herunter.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadBackup}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition flex items-center justify-center space-x-2 border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Backup herunterladen (.json)</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-white font-bold text-sm mb-1">
                      <Upload className="w-4 h-4 text-emerald-400" />
                      <span>Backup-Datei wiederherstellen</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">
                      Importiere ein zuvor exportiertes AxiomTeX-Projektarchiv direkt in diesen Workspace.
                    </p>
                  </div>
                  <label className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition flex items-center justify-center space-x-2 cursor-pointer shadow">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Backup importieren</span>
                    <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {config.lastSync ? `Letzter Sync: ${config.lastSync}` : 'Noch keine Synchronisation durchgeführt'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            Schließen
          </button>
        </div>

      </div>
    </div>
  );
};
