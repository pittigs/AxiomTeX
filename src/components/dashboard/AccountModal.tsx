import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  GitBranch, 
  Cpu, 
  HardDrive, 
  Check, 
  Key, 
  GraduationCap, 
  ShieldCheck, 
  Sparkles, 
  Save, 
  Globe, 
  Fingerprint, 
  Lock, 
  Trash2, 
  Plus, 
  AlertCircle,
  Server,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import type { StorageEstimateInfo, UserProfile } from '../../types';
import { 
  getStoredPasskeys, 
  registerPasskey, 
  deletePasskey, 
  setPin,
  type StoredPasskey
} from '../../services/passkeyService';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  storageInfo?: StorageEstimateInfo | null;
  onSaveProfile: (updated: UserProfile) => void;
  onLockSession?: () => void;
}

type TabType = 'deployment' | 'profile' | 'security' | 'git' | 'ai' | 'storage';

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  profile,
  storageInfo,
  onSaveProfile,
  onLockSession,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('deployment');
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Security & Passkey State
  const [passkeys, setPasskeys] = useState<StoredPasskey[]>(() => getStoredPasskeys());
  const [newPin, setNewPinInput] = useState('');
  const [pinSaved, setPinSaved] = useState(false);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  // On-Premise Connection Test State
  const [testServerStatus, setTestServerStatus] = useState<{ testing: boolean; message: string; ok: boolean } | null>(null);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    setPasskeys(getStoredPasskeys());
    setFormData({ ...profile });
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleRegisterNewPasskey = async () => {
    setPasskeyError(null);
    setPasskeyLoading(true);
    try {
      await registerPasskey(formData.email || 'admin@axiomtex.local', formData.name || 'AxiomTeX Nutzer');
      setPasskeys(getStoredPasskeys());
    } catch (err: any) {
      setPasskeyError(err.message || 'Passkey-Registrierung fehlgeschlagen.');
    } finally {
      setPasskeyLoading(false);
    }
  };

  const handleDeletePasskey = (id: string) => {
    const updated = deletePasskey(id);
    setPasskeys(updated);
  };

  const handleSavePin = () => {
    if (newPin.length >= 4) {
      setPin(newPin);
      setPinSaved(true);
      setTimeout(() => setPinSaved(false), 1500);
      setNewPinInput('');
    }
  };

  const handleTestServerConnection = async () => {
    const url = formData.onPremConfig?.serverUrl;
    if (!url) {
      setTestServerStatus({ testing: false, message: 'Bitte gib eine Server-URL ein.', ok: false });
      return;
    }
    setTestServerStatus({ testing: true, message: 'Verbindung zum Server wird geprüft...', ok: false });
    try {
      // Test request to server URL
      await fetch(url, { method: 'HEAD', mode: 'no-cors' });
      setTestServerStatus({ testing: false, message: `Server unter ${url} ist erreichbar!`, ok: true });
    } catch (err: any) {
      setTestServerStatus({ testing: false, message: `Verbindung fehlgeschlagen: ${err.message || 'Netzwerkfehler'}`, ok: false });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 700);
  };

  const percentageUsed = storageInfo
    ? storageInfo.percentUsed
    : Math.min(100, Math.round((formData.storageUsedMb / formData.storageLimitMb) * 100));

  const storageDisplay = storageInfo
    ? `${storageInfo.usageFormatted} von ${storageInfo.quotaFormatted} (${storageInfo.percentUsed}%)`
    : `${formData.storageUsedMb} MB von ${formData.storageLimitMb} MB (${percentageUsed}%)`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md ${
              formData.deploymentMode === 'on-premise'
                ? 'bg-gradient-to-tr from-cyan-600 to-teal-400 shadow-cyan-500/20'
                : 'bg-gradient-to-tr from-indigo-500 to-cyan-400 shadow-indigo-500/20'
            }`}>
              {formData.avatar || (formData.deploymentMode === 'on-premise' ? 'OP' : 'OD')}
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {formData.name || 'AxiomTeX Einstellungen'}
                {formData.isAdmin ? (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border bg-amber-500/20 text-amber-300 border-amber-500/30 flex items-center gap-1">
                    👑 Administrator
                  </span>
                ) : (
                  <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${
                    formData.deploymentMode === 'on-premise'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                  }`}>
                    {formData.deploymentMode === 'on-premise' ? '🏢 On-Premises' : '⚡ On-Demand'}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                {formData.username ? `@${formData.username} • ` : ''}
                {formData.email || (formData.isAdmin ? 'Hauptverwalter dieser AxiomTeX-Instanz' : formData.deploymentMode === 'on-premise' ? 'Self-Hosted Server Konfiguration' : 'Kein Account erforderlich • Lokale Browser-Sitzung')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/40 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('deployment')}
            className={`flex items-center space-x-2 py-3 px-3 text-xs font-medium border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'deployment'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Server & On-Premises</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-2 py-3 px-3 text-xs font-medium border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'profile'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profil & Autor</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('git')}
            className={`flex items-center space-x-2 py-3 px-3 text-xs font-medium border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'git'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>Git & Repositories</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`flex items-center space-x-2 py-3 px-3 text-xs font-medium border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'ai'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>KI-Dienste & Keys</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center space-x-2 py-3 px-3 text-xs font-medium border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'security'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            <span>Sicherheit</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('storage')}
            className={`flex items-center space-x-2 py-3 px-3 text-xs font-medium border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'storage'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Speicher</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: DEPLOYMENT & ON-PREMISES */}
          {activeTab === 'deployment' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-indigo-400" />
                    Betriebs- & Deployment-Modus
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Wähle, ob AxiomTeX im On-Demand Web-Modus oder mit einem eigenen On-Premises Server verbunden betrieben werden soll.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        deploymentMode: 'on-demand',
                        plan: 'AxiomTeX On-Demand',
                      });
                    }}
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      formData.deploymentMode === 'on-demand'
                        ? 'border-indigo-500 bg-indigo-950/30 ring-1 ring-indigo-500/50'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        ⚡ On-Demand (GitHub / Web)
                      </span>
                      {formData.deploymentMode === 'on-demand' && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      100% lokal im Browser. Kein Account oder Login erforderlich. Sofort einsatzbereit für Dokumente und Exporte.
                    </p>
                    <span className="mt-2 text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
                      Standard für GitHub Pages
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        deploymentMode: 'on-premise',
                        plan: 'AxiomTeX Academic Pro',
                      });
                    }}
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      formData.deploymentMode === 'on-premise'
                        ? 'border-cyan-500 bg-cyan-950/30 ring-1 ring-cyan-500/50'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        🏢 On-Premises Server (Self-Hosted)
                      </span>
                      {formData.deploymentMode === 'on-premise' && (
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Verbinde eigene Docker-Container, TeXLive-Backend-Dienste, firmeninterne Netzwerke und Self-Hosted Speicher.
                    </p>
                    <span className="mt-2 text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">
                      Voll konfigurierbar
                    </span>
                  </button>
                </div>
              </div>

              {/* On-Premises Configuration Inputs */}
              <div className={`space-y-4 transition ${formData.deploymentMode === 'on-premise' ? 'opacity-100' : 'opacity-70'}`}>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {formData.deploymentMode === 'on-premise' ? 'On-Premises Server-Einstellungen' : 'Optionale Server-Parameter'}
                  </h4>
                  {formData.deploymentMode === 'on-demand' && (
                    <span className="text-[10px] text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                      Inaktiv im On-Demand Modus
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      On-Premises Server Basis-URL
                    </label>
                    <input
                      type="text"
                      value={formData.onPremConfig?.serverUrl || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        onPremConfig: {
                          ...(formData.onPremConfig || {
                            serverUrl: 'http://localhost:8080',
                            compilerEngine: 'client-katex',
                            remoteCompilerUrl: 'http://localhost:8080/api/compile',
                            authType: 'none',
                            authToken: '',
                            syncBackend: 'local-browser',
                          }),
                          serverUrl: e.target.value,
                        }
                      })}
                      placeholder="http://localhost:8080"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-indigo-500 transition"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">z. B. Docker-Host, Intranet-URL oder lokale IP</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      LaTeX Kompilierungs-Engine
                    </label>
                    <select
                      value={formData.onPremConfig?.compilerEngine || 'client-katex'}
                      onChange={(e) => setFormData({
                        ...formData,
                        onPremConfig: {
                          ...(formData.onPremConfig || {
                            serverUrl: 'http://localhost:8080',
                            compilerEngine: 'client-katex',
                            remoteCompilerUrl: 'http://localhost:8080/api/compile',
                            authType: 'none',
                            authToken: '',
                            syncBackend: 'local-browser',
                          }),
                          compilerEngine: e.target.value as 'client-katex' | 'remote-texlive',
                        }
                      })}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                    >
                      <option value="client-katex">⚡ Client-seitig (KaTeX + AST Simulator, 0 Serverlast)</option>
                      <option value="remote-texlive">🐳 On-Premises Native TeXLive Server (pdflatex / xelatex)</option>
                    </select>
                    <p className="text-[10px] text-slate-500 mt-1">Wähle zwischen latenzfreier Browser-Vorschau oder vollem TeXLive</p>
                  </div>
                </div>

                {formData.onPremConfig?.compilerEngine === 'remote-texlive' && (
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="block text-xs font-semibold text-slate-300">
                      Remote TeXLive Kompilierungs-Endpoint
                    </label>
                    <input
                      type="text"
                      value={formData.onPremConfig?.remoteCompilerUrl || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        onPremConfig: {
                          ...(formData.onPremConfig || {
                            serverUrl: 'http://localhost:8080',
                            compilerEngine: 'remote-texlive',
                            remoteCompilerUrl: 'http://localhost:8080/api/compile',
                            authType: 'none',
                            authToken: '',
                            syncBackend: 'local-browser',
                          }),
                          remoteCompilerUrl: e.target.value,
                        }
                      })}
                      placeholder="http://localhost:8080/api/compile"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Server-Authentifizierung
                    </label>
                    <select
                      value={formData.onPremConfig?.authType || 'none'}
                      onChange={(e) => setFormData({
                        ...formData,
                        onPremConfig: {
                          ...(formData.onPremConfig || {
                            serverUrl: 'http://localhost:8080',
                            compilerEngine: 'client-katex',
                            remoteCompilerUrl: 'http://localhost:8080/api/compile',
                            authType: 'none',
                            authToken: '',
                            syncBackend: 'local-browser',
                          }),
                          authType: e.target.value as 'none' | 'bearer' | 'basic',
                        }
                      })}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                    >
                      <option value="none">Keine Authentifizierung (Öffentlich)</option>
                      <option value="bearer">Bearer Token / API-Schlüssel</option>
                      <option value="basic">HTTP Basic Authentication</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Auth Token / Zugangsdaten
                    </label>
                    <input
                      type="password"
                      value={formData.onPremConfig?.authToken || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        onPremConfig: {
                          ...(formData.onPremConfig || {
                            serverUrl: 'http://localhost:8080',
                            compilerEngine: 'client-katex',
                            remoteCompilerUrl: 'http://localhost:8080/api/compile',
                            authType: 'none',
                            authToken: '',
                            syncBackend: 'local-browser',
                          }),
                          authToken: e.target.value,
                        }
                      })}
                      placeholder={formData.onPremConfig?.authType === 'basic' ? 'benutzer:passwort' : 'eyJhbGciOi...'}
                      disabled={formData.onPremConfig?.authType === 'none'}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-indigo-500 transition disabled:opacity-40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Speicher- & Sync-Backend
                    </label>
                    <select
                      value={formData.onPremConfig?.syncBackend || 'local-browser'}
                      onChange={(e) => setFormData({
                        ...formData,
                        onPremConfig: {
                          ...(formData.onPremConfig || {
                            serverUrl: 'http://localhost:8080',
                            compilerEngine: 'client-katex',
                            remoteCompilerUrl: 'http://localhost:8080/api/compile',
                            authType: 'none',
                            authToken: '',
                            syncBackend: 'local-browser',
                          }),
                          syncBackend: e.target.value as 'local-browser' | 'onprem-server' | 'webdav-nextcloud',
                        }
                      })}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                    >
                      <option value="local-browser">Lokaler Browser-Speicher (IndexedDB / LocalStorage)</option>
                      <option value="onprem-server">On-Premises Server-Sync (REST / WebSocket)</option>
                      <option value="webdav-nextcloud">Nextcloud / WebDAV Verknüpfung</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleTestServerConnection}
                      disabled={testServerStatus?.testing}
                      className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${testServerStatus?.testing ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} />
                      <span>{testServerStatus?.testing ? 'Prüfe Verbindung...' : 'Verbindung zum Server testen'}</span>
                    </button>
                  </div>
                </div>

                {testServerStatus && (
                  <div className={`p-2.5 rounded-lg text-xs flex items-center space-x-2 border ${
                    testServerStatus.ok
                      ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-800/40 text-rose-300'
                  }`}>
                    {testServerStatus.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{testServerStatus.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE & IDENTITY */}
          {activeTab === 'profile' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start space-x-3 ${
                formData.deploymentMode === 'on-demand'
                  ? 'bg-indigo-950/20 border-indigo-800/30 text-indigo-200'
                  : 'bg-cyan-950/20 border-cyan-800/30 text-cyan-200'
              }`}>
                {formData.deploymentMode === 'on-demand' ? (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-white">⚡ On-Demand Modus aktiv (Kein Login erforderlich)</span>
                      <span>Du nutzt AxiomTeX direkt im Browser. Angaben sind optional und dienen dazu, deinen Autorennamen und deine Affiliation in wissenschaftlichen Vorlagen und PDF-Exporten automatisch einzusetzen.</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Server className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-white">🏢 On-Premises Profil</span>
                      <span>Konfiguriere deinen Benutzer-Account für die interne Server-Instanz deiner Organisation oder Hochschule.</span>
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Name / Autorenbezeichnung</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      const initials = newName.trim().split(' ').map(s => s[0]).join('').substring(0, 2).toUpperCase() || 'OD';
                      setFormData({ ...formData, name: newName, avatar: initials });
                    }}
                    placeholder="z. B. Dr. Jane Doe oder Gast-Autor"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">E-Mail (Optional)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="autor@universitaet.de"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Institution / Universität</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.affiliation}
                      onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-8 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                      placeholder="z.B. TU München / ETH Zürich / Eigene Hochschule"
                    />
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Rolle / Position</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                    placeholder="z.B. Forscher / Student / Dozent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">ORCID ID (für wissenschaftliche Publikationen)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.orcid || ''}
                    onChange={(e) => setFormData({ ...formData, orcid: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-8 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition font-mono"
                    placeholder="0000-0002-xxxx-xxxx"
                  />
                  <Globe className="w-4 h-4 text-emerald-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Forschungsinteressen / Notizen</label>
                <textarea
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition resize-none"
                  placeholder="Optionale Notizen oder wissenschaftliche Schwerpunkte..."
                />
              </div>
            </div>
          )}

          {/* TAB 3: GIT INTEGRATION */}
          {activeTab === 'git' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200">Git & Self-Hosted Repositories</span>
                  <p className="mt-0.5 leading-relaxed">
                    Verbinde AxiomTeX mit GitHub, GitLab oder einem internen On-Premises Gitea/GitLab-Server, um Versionen zu synchronisieren und Commits zu signieren.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Git Username</label>
                  <input
                    type="text"
                    value={formData.gitUsername || ''}
                    onChange={(e) => setFormData({ ...formData, gitUsername: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                    placeholder="dein-nutzername"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Git Commit E-Mail</label>
                  <input
                    type="email"
                    value={formData.gitEmail || ''}
                    onChange={(e) => setFormData({ ...formData, gitEmail: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                    placeholder="git@mein-institut.de"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Personal Access Token (PAT)</label>
                <div className="relative">
                  <input
                    type="password"
                    value={formData.gitToken || ''}
                    onChange={(e) => setFormData({ ...formData, gitToken: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-8 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition font-mono"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx oder glpat-..."
                  />
                  <Key className="w-4 h-4 text-amber-400 absolute left-2.5 top-2.5" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Wird verschlüsselt im lokalen Browser-Speicher abgelegt.</p>
              </div>
            </div>
          )}

          {/* TAB 4: AI & LLM */}
          {activeTab === 'ai' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-300 flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-indigo-200">Wissenschaftlicher KI-Assistent & On-Premises LLM</span>
                  <p className="mt-0.5 text-slate-300 leading-relaxed">
                    Ermöglicht automatische LaTeX-Formelgenerierung, Korrekturlesen und DOI-BibTeX-Konvertierung. Unterstützt sowohl Cloud-Modelle als auch 100% lokale On-Premises Ollama/vLLM-Modelle.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Lokales On-Premises Ollama / vLLM Endpoint</label>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    100% Offline & Datenschutzkonform
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.aiKeys?.ollamaEndpoint || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    aiKeys: { ...formData.aiKeys, ollamaEndpoint: e.target.value }
                  })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition font-mono"
                  placeholder="http://localhost:11434"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Google Gemini API Key (Optional)</label>
                <input
                  type="password"
                  value={formData.aiKeys?.gemini || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    aiKeys: { ...formData.aiKeys, gemini: e.target.value }
                  })}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition font-mono"
                  placeholder="AIzaSy..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">OpenAI API Key (Optional)</label>
                <input
                  type="password"
                  value={formData.aiKeys?.openai || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    aiKeys: { ...formData.aiKeys, openai: e.target.value }
                  })}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition font-mono"
                  placeholder="sk-proj-..."
                />
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      <Fingerprint className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white">Biometrische Passkeys (WebAuthn / FIDO2)</h3>
                      <p className="text-[11px] text-slate-400">
                        Lokale Browser-Sitzung mit Touch ID, Face ID, Windows Hello oder YubiKey schützen.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRegisterNewPasskey}
                    disabled={passkeyLoading}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center space-x-1.5 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{passkeyLoading ? 'Wird registriert...' : 'Passkey hinzufügen'}</span>
                  </button>
                </div>

                {passkeyError && (
                  <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{passkeyError}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Registrierte Passkeys ({passkeys.length})
                  </span>

                  {passkeys.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-1">
                      Noch kein Passkey hinterlegt. Klicke auf &bdquo;Passkey hinzufügen&ldquo;, um diese Instanz zu sperren.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {passkeys.map((p) => (
                        <div
                          key={p.id}
                          className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2.5">
                            <Fingerprint className="w-4 h-4 text-cyan-400" />
                            <div>
                              <span className="text-xs font-bold text-slate-200 block">{p.name}</span>
                              <span className="text-[10px] text-slate-400 block">Registriert am {p.createdAt}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeletePasskey(p.id)}
                            className="p-1 rounded hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                            title="Passkey entfernen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Fallback PIN Configuration */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center space-x-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white">Sicherheits-PIN für Notfall-Zugang</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Wird verwendet, falls biometrische Hardware temporär nicht verfügbar ist (Standard-PIN: 1234).
                </p>
                <div className="flex items-center space-x-3">
                  <input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    placeholder="Neuen PIN festlegen (min. 4 Zeichen)"
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-mono flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleSavePin}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                  >
                    {pinSaved ? 'Gespeichert!' : 'PIN ändern'}
                  </button>
                </div>
              </div>

              {/* Session Lock Action */}
              {onLockSession && (
                <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-indigo-400" />
                      Sitzung jetzt sperren
                    </h3>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Sperrt den AxiomTeX-Workspace sofort. Entsperrung via Passkey oder PIN.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onLockSession();
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow cursor-pointer"
                  >
                    Jetzt sperren
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: STORAGE & STATUS */}
          {activeTab === 'storage' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-300">Lokaler Browser-Speicher (IndexedDB)</span>
                  <span className="text-slate-400">{storageDisplay}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentageUsed}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  {storageInfo?.isIndexedDbSupported
                    ? 'AxiomTeX nutzt IndexedDB für unbegrenzte, persistente Dokumentenspeicherung direkt in deinem Browser mit dynamischem Quota-Monitoring.'
                    : 'Im On-Demand Modus werden alle Dokumente und Einstellungen lokal im Browser gespeichert.'}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">Modus-Status</span>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      {formData.deploymentMode === 'on-premise' ? '🏢 On-Premises Server' : '⚡ On-Demand Workspace'}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      {formData.deploymentMode === 'on-premise'
                        ? 'Verknüpft mit eigener Server-Infrastruktur.'
                        : 'Kostenlos & Open-Source ohne Registrierung im Browser nutzbar.'}
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
                    Aktiv
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
            >
              Abbrechen
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition flex items-center space-x-2 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Gespeichert!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Konfiguration speichern</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
