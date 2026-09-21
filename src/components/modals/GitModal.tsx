import React, { useState } from 'react';
import { 
  X, 
  GitBranch, 
  GitCommit as GitCommitIcon, 
  UploadCloud, 
  DownloadCloud, 
  CheckCircle2, 
  Globe, 
  Clock 
} from 'lucide-react';
import type { GitConfig, GitCommit } from '../../types';

interface GitModalProps {
  isOpen: boolean;
  onClose: () => void;
  gitConfig: GitConfig;
  onUpdateGitConfig: (config: GitConfig) => void;
  commits: GitCommit[];
  onCommitAndPush: (message: string) => Promise<void>;
  onPullChanges: () => Promise<void>;
}

export const GitModal: React.FC<GitModalProps> = ({
  isOpen,
  onClose,
  gitConfig,
  onUpdateGitConfig,
  commits,
  onCommitAndPush,
  onPullChanges
}) => {
  const [remoteUrl, setRemoteUrl] = useState(gitConfig.remoteUrl || 'https://gitlab.tu-berlin.de/research/axiomtex-paper.git');
  const [branch, setBranch] = useState(gitConfig.branch || 'main');
  const [token, setToken] = useState(gitConfig.token || '');
  const [authorName] = useState(gitConfig.authorName || 'Alexander Musterstudent');
  const [authorEmail] = useState(gitConfig.authorEmail || 'alex@tum.de');
  const [commitMessage, setCommitMessage] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    onUpdateGitConfig({
      ...gitConfig,
      remoteUrl,
      branch,
      token,
      authorName,
      authorEmail,
      isConnected: Boolean(remoteUrl.trim())
    });
    setStatusMessage('Git-Remote erfolgreich konfiguriert.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) return;
    setIsBusy(true);
    await onCommitAndPush(commitMessage.trim());
    setCommitMessage('');
    setIsBusy(false);
    setStatusMessage('Änderungen erfolgreich committet und gepusht!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handlePull = async () => {
    setIsBusy(true);
    await onPullChanges();
    setIsBusy(false);
    setStatusMessage('Neueste Änderungen erfolgreich vom Git-Server abgerufen.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">Freie Git-Synchronisation</h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-semibold">
                  Jeder Anbieter
                </span>
              </div>
              <p className="text-xs text-slate-400">Synchronisiere mit beliebigem GitLab, GitHub, Gitea, Codeberg oder privatem Server</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status notification */}
        {statusMessage && (
          <div className="bg-emerald-950/40 border-b border-emerald-900/50 px-5 py-2 text-xs text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Remote Setup */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="font-semibold text-slate-200 flex items-center space-x-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>Git Remote Repository</span>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-slate-400 block mb-1">Remote URL (HTTPS / SSH):</label>
                <input
                  type="text"
                  value={remoteUrl}
                  onChange={(e) => setRemoteUrl(e.target.value)}
                  placeholder="https://gitlab.tu-berlin.de/user/latex-thesis.git oder https://github.com/..."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-white font-mono outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Branch:</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="main"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-white font-mono outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Token / Passwort (optional):</label>
                  <input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="glpat-... / ghp_... / Token"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-white font-mono outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleSaveConfig}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition"
                >
                  Remote-Konfiguration speichern
                </button>
              </div>
            </div>
          </div>

          {/* Commit & Push Section */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="font-semibold text-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GitCommitIcon className="w-4 h-4 text-emerald-400" />
                <span>Änderungen committen & pushen</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Branch: {branch}</span>
            </div>

            <div className="space-y-2">
              <textarea
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Commit-Nachricht eingeben (z. B. 'Add discussion section and IEEE citations')"
                rows={2}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-white outline-none focus:border-emerald-500"
              />

              <div className="flex items-center justify-between">
                <button
                  onClick={handlePull}
                  disabled={isBusy}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg flex items-center space-x-1.5 border border-slate-700 transition"
                >
                  <DownloadCloud className="w-3.5 h-3.5 text-blue-400" />
                  <span>Pull (Vom Server abrufen)</span>
                </button>

                <button
                  onClick={handleCommit}
                  disabled={isBusy || !commitMessage.trim()}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-medium rounded-lg flex items-center space-x-1.5 transition shadow"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Commit & Push</span>
                </button>
              </div>
            </div>
          </div>

          {/* Commit History Log */}
          <div>
            <div className="font-semibold text-slate-300 mb-2 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Letzte Git-Commits ({commits.length})</span>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {commits.map((commit) => (
                <div
                  key={commit.hash}
                  className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-indigo-400 bg-slate-900 px-1.5 py-0.5 rounded text-[10px]">
                      {commit.hash}
                    </span>
                    <span className="text-slate-200 font-medium">{commit.message}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                    <span>{commit.author}</span>
                    <span>•</span>
                    <span>{commit.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
