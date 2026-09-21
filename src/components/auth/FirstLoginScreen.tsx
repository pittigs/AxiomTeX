import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ArrowRight, 
  Mail, 
  Crown,
  CheckCircle2,
  Lock
} from 'lucide-react';
import type { UserProfile } from '../../types';
import { DEFAULT_USER_PROFILE } from '../../services/projectStorage';
import { setStoredPin } from '../../services/passkeyService';

interface FirstLoginScreenProps {
  onComplete: (userProfile: UserProfile) => void;
}

export const FirstLoginScreen: React.FC<FirstLoginScreenProps> = ({ onComplete }) => {
  const [username, setUsername] = useState('admin');
  const [displayName, setDisplayName] = useState('System Administrator');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('1234');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Bitte gib einen gültigen Benutzernamen ein.');
      return;
    }

    // Save customized PIN if entered
    if (pin.trim()) {
      setStoredPin(pin.trim());
    }

    const cleanUsername = username.trim();
    const cleanDisplayName = displayName.trim() || cleanUsername;
    const initials = cleanDisplayName
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'AD';

    const adminProfile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      id: `usr-admin-${Date.now()}`,
      username: cleanUsername,
      name: cleanDisplayName,
      email: email.trim(),
      avatar: initials,
      role: 'Administrator',
      isAdmin: true,
      isSetupComplete: true,
      plan: 'AxiomTeX Academic Pro',
      affiliation: 'AxiomTeX Instanz-Inhaber',
      bio: 'Hauptverwalter dieser AxiomTeX-Instanz mit uneingeschränkten Rechten.',
      deploymentMode: 'on-demand',
    };

    onComplete(adminProfile);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-indigo-600/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/90 backdrop-blur-2xl relative z-10">
        {/* Header with Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-400 flex items-center justify-center shadow-xl shadow-indigo-500/25">
              <span className="font-black text-3xl text-white tracking-tight">AX</span>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg font-black" title="Erster Administrator">
              <Crown className="w-4 h-4" />
            </div>
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight">Willkommen bei AxiomTeX</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Ersteinrichtung & Administrator-Initialisierung
          </p>
        </div>

        {/* Informational Banner */}
        <div className="mb-6 p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-amber-300 block mb-0.5">Erster Benutzer (Admin-Setup)</span>
            Da dies der erste Start auf dieser Instanz ist, wird dieser Account automatisch als 
            <strong className="text-white"> Haupt-Administrator</strong> mit vollen Verwaltungsrechten eingerichtet.
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-left">
              Admin-Benutzername <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="z. B. admin"
              className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition font-medium"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-left">
              Anzeigename / Voller Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="z. B. Administrator oder dein Name"
              className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-left flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Sicherheits-PIN</span>
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Standard: 1234"
                className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-left flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>E-Mail (optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@secitnow.net"
                className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition font-medium"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 hover:from-blue-500 hover:to-amber-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition cursor-pointer flex items-center justify-center space-x-2 group"
            >
              <span>AxiomTeX initialisieren & als Admin starten</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>

        {/* Features Checklist */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400 text-left">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Volle Admin-Rechte</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Passkey / FIDO2 bereit</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Lokaler Datenspeicher</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Multi-Arch & ARM-optimiert</span>
          </div>
        </div>
      </div>
    </div>
  );
};
