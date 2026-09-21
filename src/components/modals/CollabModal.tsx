import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Copy, 
  Check, 
  UserPlus, 
  Zap 
} from 'lucide-react';
import type { Collaborator } from '../../types';

interface CollabModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaborators: Collaborator[];
  onAddSimulatedCollaborator: () => void;
}

export const CollabModal: React.FC<CollabModalProps> = ({
  isOpen,
  onClose,
  collaborators,
  onAddSimulatedCollaborator
}) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/#room-science-2026` : 'https://axiomtex.org/room-science-2026';

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Echtzeit-Kollaboration</h2>
              <p className="text-xs text-slate-400">Yjs CRDT-Synchronisation ohne Datenkonflikte</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Link Input */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Einladungs-Link zum Projekt
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-lg text-slate-300 font-mono outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg flex items-center space-x-1.5 transition active:scale-95"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Kopiert' : 'Kopieren'}</span>
              </button>
            </div>
          </div>

          {/* Active Collaborators */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">
                Aktive Teammitglieder ({collaborators.length})
              </label>
              <button
                onClick={onAddSimulatedCollaborator}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1"
                title="Simuliere einen weiteren kollaborativen Schreiber"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Teammitglied simulieren</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {collaborators.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/40 border border-slate-800"
                >
                  <div className="flex items-center space-x-2.5">
                    <div
                      className="w-7 h-7 rounded-full text-xs font-bold text-white flex items-center justify-center shadow"
                      style={{ backgroundColor: c.color }}
                    >
                      {c.avatar}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white flex items-center space-x-1.5">
                        <span>{c.name}</span>
                        {c.role === 'owner' && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 rounded font-semibold border border-amber-500/30">
                            Host
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {c.status === 'online' ? 'Online • Tippt gerade...' : 'Inaktiv'}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 capitalize bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {c.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Feature Highlight */}
          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-[11px] text-indigo-200 space-y-1">
            <div className="font-semibold flex items-center space-x-1.5 text-indigo-300">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dezentrale CRDT Architektur</span>
            </div>
            <p className="text-slate-400 text-[10px] leading-relaxed">
              AxiomTeX nutzt Yjs Conflict-free Replicated Data Types (CRDTs). Selbst bei Netzwerkabbrüchen gehen keine Zeichen verloren und Änderungen werden nahtlos gemergt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
