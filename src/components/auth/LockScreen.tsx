import React, { useState } from 'react';
import { 
  Fingerprint, 
  Lock, 
  KeyRound, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import type { UserProfile } from '../../types';
import { 
  authenticateWithPasskey, 
  verifyPin, 
  getStoredPasskeys, 
  isPasskeySupported 
} from '../../services/passkeyService';

interface LockScreenProps {
  userProfile: UserProfile;
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({
  userProfile,
  onUnlock,
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showPinInput, setShowPinInput] = useState(false);

  const passkeys = getStoredPasskeys();
  const supported = isPasskeySupported();

  const handlePasskeyAuth = async () => {
    setErrorMsg(null);
    setIsAuthenticating(true);
    try {
      const success = await authenticateWithPasskey();
      if (success) {
        onUnlock();
      } else {
        setErrorMsg('Authentifizierung fehlgeschlagen.');
      }
    } catch (err: any) {
      console.warn('Passkey authentication error:', err);
      setErrorMsg(err.message || 'Passkey-Abfrage wurde abgebrochen oder ist fehlgeschlagen.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (verifyPin(pin)) {
      onUnlock();
    } else {
      setErrorMsg('Falscher PIN-Code. (Standard: 1234)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-cyan-600/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/80 backdrop-blur-xl relative z-10 flex flex-col items-center text-center">
        {/* Brand Logo & Lock Indicator */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-400 flex items-center justify-center shadow-xl shadow-blue-500/25">
            <span className="font-black text-2xl text-white tracking-tight">AX</span>
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-950 border-2 border-slate-800 flex items-center justify-center text-amber-400 shadow">
            <Lock className="w-4 h-4" />
          </div>
        </div>

        {/* Title & User Identification */}
        <h1 className="text-xl font-black text-white tracking-tight">AxiomTeX Tresor gesperrt</h1>
        <p className="text-xs text-slate-400 mt-1">
          Geschützte wissenschaftliche Dokumentenumgebung
        </p>

        {/* User Card */}
        <div className="mt-5 mb-6 w-full p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center space-x-3 text-left">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-sm text-white shadow shrink-0 relative">
            {userProfile.avatar || 'AD'}
            {userProfile.isAdmin && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[9px] font-black" title="Administrator">
                ★
              </span>
            )}
          </div>
          <div className="truncate flex-1">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-white truncate">{userProfile.name}</span>
              {userProfile.isAdmin && (
                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                  Admin
                </span>
              )}
            </div>
            <span className="block text-[11px] text-slate-400 truncate">
              {userProfile.username ? `@${userProfile.username}` : (userProfile.affiliation || userProfile.email)}
            </span>
          </div>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="Verifiziert">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="w-full mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center space-x-2 text-left animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{errorMsg}</span>
          </div>
        )}

        {/* Primary Action: Passkey Trigger */}
        {!showPinInput ? (
          <div className="w-full space-y-4">
            <button
              onClick={handlePasskeyAuth}
              disabled={isAuthenticating || !supported}
              title={!supported ? 'WebAuthn / Passkeys werden nicht unterstützt' : undefined}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition cursor-pointer flex items-center justify-center space-x-2.5 group disabled:opacity-50"
            >
              <Fingerprint className="w-5 h-5 text-cyan-200 group-hover:scale-110 transition-transform" />
              <span>
                {!supported 
                  ? 'Passkey wird nicht unterstützt' 
                  : isAuthenticating 
                    ? 'Passkey wird abgefragt...' 
                    : 'Mit Passkey entsperren'}
              </span>
            </button>

            <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {supported 
                  ? (passkeys.length > 0 ? `${passkeys.length} Passkey(s) aktiv` : 'Touch ID / Windows Hello') 
                  : 'PIN-Zugang nutzen'}
              </span>

              <button
                type="button"
                onClick={() => setShowPinInput(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition cursor-pointer font-medium flex items-center gap-1"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>PIN-Eingabe</span>
              </button>
            </div>
          </div>
        ) : (
          /* Secondary Action: PIN Fallback */
          <form onSubmit={handlePinSubmit} className="w-full space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 text-left">
                Sicherheits-PIN eingeben
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="PIN eingeben (Standard: 1234)"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-center tracking-widest font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Entsperren</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setShowPinInput(false);
                setErrorMsg(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer pt-1"
            >
              Zurück zur Passkey-Anmeldung
            </button>
          </form>
        )}

        {/* Security badge footer */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 w-full flex items-center justify-center space-x-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>FIDO2 / WebAuthn & Client-Side Vault Security</span>
        </div>
      </div>
    </div>
  );
};
