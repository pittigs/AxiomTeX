import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Folder, 
  FileText, 
  Star, 
  Clock, 
  Users, 
  MoreVertical, 
  Trash2, 
  Copy, 
  Download, 
  LayoutGrid, 
  List as ListIcon, 
  BookOpen, 
  GraduationCap, 
  Sparkles, 
  GitBranch, 
  ChevronRight,
  HardDrive,
  Lock
} from 'lucide-react';
import type { ProjectSummary, StorageEstimateInfo, UserProfile } from '../../types';
import { exportProjectAsZip } from '../../services/exportService';

interface DashboardViewProps {
  projects: ProjectSummary[];
  userProfile: UserProfile;
  storageInfo?: StorageEstimateInfo | null;
  onOpenProject: (projectId: string) => void;
  onNewProjectClick: () => void;
  onOpenAccountClick: () => void;
  onToggleStar: (projectId: string) => void;
  onDuplicateProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onSelectTemplateDirect: (templateId: string) => void;
  onCleanupDuplicates?: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onLockSession?: () => void;
}

type FilterCategory = 'all' | 'mine' | 'shared' | 'starred' | 'archive';

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  userProfile,
  storageInfo,
  onOpenProject,
  onNewProjectClick,
  onOpenAccountClick,
  onToggleStar,
  onDuplicateProject,
  onDeleteProject,
  onSelectTemplateDirect,
  onCleanupDuplicates,
  onLockSession,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | 'Paper' | 'Exam' | 'Thesis'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [menuOpenProjectId, setMenuOpenProjectId] = useState<string | null>(null);

  // Detect duplicate projects
  const duplicateCount = useMemo(() => {
    const names = new Set<string>();
    let dups = 0;
    for (const p of projects) {
      const key = `${p.name.trim()}_${p.category}`;
      if (names.has(key)) dups++;
      else names.add(key);
    }
    return dups;
  }, [projects]);

  // Filtered and searched projects
  const filteredProjects = useMemo(() => {
    return projects.filter((proj) => {
      // Search query
      const matchesSearch = 
        proj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Category template filter
      if (selectedCategoryFilter !== 'all' && proj.category !== selectedCategoryFilter) {
        return false;
      }

      // Sidebar Category filter
      if (selectedFilter === 'all') return !proj.isArchived;
      if (selectedFilter === 'mine') return proj.ownerId === userProfile.id && !proj.isArchived;
      if (selectedFilter === 'shared') return proj.isShared && !proj.isArchived;
      if (selectedFilter === 'starred') return proj.isStarred && !proj.isArchived;
      if (selectedFilter === 'archive') return proj.isArchived;
      return true;
    });
  }, [projects, searchQuery, selectedFilter, selectedCategoryFilter, userProfile.id]);

  const handleExportZip = (e: React.MouseEvent, proj: ProjectSummary) => {
    e.stopPropagation();
    exportProjectAsZip(proj.files, proj.name);
    setMenuOpenProjectId(null);
  };

  const handleDuplicate = (e: React.MouseEvent, projId: string) => {
    e.stopPropagation();
    onDuplicateProject(projId);
    setMenuOpenProjectId(null);
  };

  const handleDelete = (e: React.MouseEvent, projId: string) => {
    e.stopPropagation();
    if (window.confirm('Möchtest du dieses Projekt wirklich löschen?')) {
      onDeleteProject(projId);
    }
    setMenuOpenProjectId(null);
  };

  const percentageUsed = storageInfo
    ? storageInfo.percentUsed
    : Math.min(100, Math.round((userProfile.storageUsedMb / userProfile.storageLimitMb) * 100));

  const storageDisplay = storageInfo
    ? `${storageInfo.usageFormatted} / ${storageInfo.quotaFormatted}`
    : `${userProfile.storageUsedMb} MB / 5 GB`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-400 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="font-black text-sm text-white tracking-tight">AX</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-white">AxiomTeX</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  STUDIO
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-lg mx-8">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Dokumente, Kapitel, Vorlagen durchsuchen..."
              className="w-full bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:bg-slate-950 transition"
            />
          </div>
        </div>

        {/* User Profile & Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onNewProjectClick}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Neues Projekt</span>
          </button>

          <div className="h-5 w-px bg-slate-800" />

          {/* User Account Trigger Button */}
          <button
            onClick={onOpenAccountClick}
            className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-850 transition text-left cursor-pointer group"
            title="Einstellungen, Profil & On-Premises Server konfigurieren"
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow ${
              userProfile.deploymentMode === 'on-premise'
                ? 'bg-gradient-to-tr from-cyan-600 to-teal-400'
                : 'bg-gradient-to-tr from-blue-500 to-indigo-600'
            }`}>
              {userProfile.avatar || (userProfile.deploymentMode === 'on-premise' ? 'OP' : 'OD')}
            </div>
            <div className="hidden sm:block">
              <span className="block text-xs font-semibold text-slate-200 group-hover:text-white transition leading-tight">
                {userProfile.name}
              </span>
              <span className="block text-[10px] text-slate-400 truncate max-w-[120px]">
                {userProfile.deploymentMode === 'on-premise' ? '🏢 On-Premises' : '⚡ On-Demand'}
              </span>
            </div>
          </button>

          {/* Session Lock Button */}
          {onLockSession && (
            <button
              onClick={onLockSession}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-amber-400 text-slate-400 transition cursor-pointer"
              title="Sitzung jetzt sperren (Passkey / PIN)"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Body Layout: Sidebar + Main Workspace */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-6 gap-6">
        {/* Left Navigation Sidebar */}
        <aside className="w-64 shrink-0 flex flex-col space-y-6">
          {/* Main Navigation Links */}
          <div className="space-y-1">
            <span className="px-3 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              Navigation
            </span>
            <button
              onClick={() => setSelectedFilter('all')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-blue-600/15 text-blue-300 font-semibold border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Folder className="w-4 h-4" />
                <span>Alle Dokumente</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                {projects.filter((p) => !p.isArchived).length}
              </span>
            </button>

            <button
              onClick={() => setSelectedFilter('mine')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                selectedFilter === 'mine'
                  ? 'bg-blue-600/15 text-blue-300 font-semibold border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <FileText className="w-4 h-4" />
                <span>Meine Dokumente</span>
              </div>
            </button>

            <button
              onClick={() => setSelectedFilter('shared')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                selectedFilter === 'shared'
                  ? 'bg-blue-600/15 text-blue-300 font-semibold border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Users className="w-4 h-4" />
                <span>Mit mir geteilt</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                {projects.filter((p) => p.isShared && !p.isArchived).length}
              </span>
            </button>

            <button
              onClick={() => setSelectedFilter('starred')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                selectedFilter === 'starred'
                  ? 'bg-blue-600/15 text-blue-300 font-semibold border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Star className="w-4 h-4 text-amber-400" />
                <span>Favoriten</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                {projects.filter((p) => p.isStarred && !p.isArchived).length}
              </span>
            </button>
          </div>

          {/* Account & Profile Quick Card */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                {userProfile.isAdmin ? (
                  <span className="text-amber-400 flex items-center gap-1">👑 Administrator</span>
                ) : userProfile.deploymentMode === 'on-premise' ? (
                  '🏢 Server-Modus'
                ) : (
                  '⚡ On-Demand'
                )}
              </span>
              <button
                onClick={onOpenAccountClick}
                className="text-[11px] text-blue-400 hover:text-blue-300 transition cursor-pointer flex items-center gap-0.5"
              >
                Konfigurieren <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow ${
                userProfile.isAdmin
                  ? 'bg-gradient-to-tr from-amber-500 to-indigo-600'
                  : userProfile.deploymentMode === 'on-premise'
                  ? 'bg-gradient-to-tr from-cyan-600 to-teal-400'
                  : 'bg-gradient-to-tr from-blue-500 to-indigo-600'
              }`}>
                {userProfile.avatar || (userProfile.isAdmin ? 'AD' : userProfile.deploymentMode === 'on-premise' ? 'OP' : 'OD')}
              </div>
              <div className="truncate">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-white truncate">{userProfile.name}</span>
                  {userProfile.isAdmin && (
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                      Admin
                    </span>
                  )}
                </div>
                <span className="block text-[11px] text-slate-400 truncate">
                  {userProfile.username ? `@${userProfile.username}` : (userProfile.deploymentMode === 'on-premise' ? (userProfile.onPremConfig?.serverUrl || 'On-Premises Server') : '100% lokal im Browser')}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-slate-500" /> Browser-Speicher (IndexedDB)
                </span>
                <span className="text-slate-300 font-medium">{storageDisplay}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all"
                  style={{ width: `${percentageUsed}%` }}
                />
              </div>
            </div>
          </div>

          {/* Open Source / GitHub Footer */}
          <div className="mt-auto pt-4 border-t border-slate-900 flex items-center justify-between text-slate-400 text-xs">
            <a
              href="https://github.com/pittigs/AxiomTeX"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 hover:text-white transition"
            >
              <GitBranch className="w-4 h-4" />
              <span>AxiomTeX GitHub</span>
            </a>
            <span className="text-[10px] text-slate-500 font-mono">v1.2</span>
          </div>
        </aside>

        {/* Center Main Content */}
        <main className="flex-1 min-w-0 space-y-6">
          {/* Quick Start Academic Templates Banner (Dynamic Category Filter) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Schnellstart & Kategorien-Filter
                </h3>
                <span className="text-[10px] text-slate-500">
                  (Klicke zum Filtern der Liste)
                </span>
              </div>
              {selectedCategoryFilter !== 'all' && (
                <button
                  onClick={() => setSelectedCategoryFilter('all')}
                  className="text-xs text-blue-400 hover:text-blue-300 transition font-medium"
                >
                  Filter aufheben (Alle anzeigen)
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Card 1: IEEE Journal / Paper */}
              <div
                onClick={() => setSelectedCategoryFilter((prev) => (prev === 'Paper' ? 'all' : 'Paper'))}
                className={`p-4 rounded-2xl border transition cursor-pointer group shadow-sm flex flex-col justify-between ${
                  selectedCategoryFilter === 'Paper'
                    ? 'ring-2 ring-blue-500 bg-blue-950/50 border-blue-500 shadow-blue-500/20'
                    : 'bg-gradient-to-br from-blue-950/30 via-slate-900 to-slate-900 border-blue-500/20 hover:border-blue-500/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    {selectedCategoryFilter === 'Paper' ? (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500 text-white animate-pulse">
                        Aktiv gefiltert
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase text-blue-400">Paper (Filter)</span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-blue-200 transition">
                    IEEE Journal / Paper
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    Zweispaltiges Layout mit Formeln, Tabellen und BibTeX für wissenschaftliche Konferenzen.
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTemplateDirect('ieee-journal');
                  }}
                  className="mt-3.5 w-full py-1.5 px-3 rounded-xl bg-blue-600/70 hover:bg-blue-600 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition shadow-sm"
                  title="Erstellt ein neues Projekt aus der IEEE-Vorlage"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Als neues Projekt anlegen</span>
                </button>
              </div>

              {/* Card 2: Exam */}
              <div
                onClick={() => setSelectedCategoryFilter((prev) => (prev === 'Exam' ? 'all' : 'Exam'))}
                className={`p-4 rounded-2xl border transition cursor-pointer group shadow-sm flex flex-col justify-between ${
                  selectedCategoryFilter === 'Exam'
                    ? 'ring-2 ring-cyan-500 bg-cyan-950/50 border-cyan-500 shadow-cyan-500/20'
                    : 'bg-gradient-to-br from-cyan-950/30 via-slate-900 to-slate-900 border-cyan-500/20 hover:border-cyan-500/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                      <GraduationCap className="w-4 h-4" />
                    </span>
                    {selectedCategoryFilter === 'Exam' ? (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-cyan-500 text-white animate-pulse">
                        Aktiv gefiltert
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase text-cyan-400">Klausur (Filter)</span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-200 transition">
                    Prüfungs- & Klausurvorlage
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    Universitäre Vorlage mit Aufgabenboxen, Punktetabellen und Musterlösungen.
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTemplateDirect('exam-mock');
                  }}
                  className="mt-3.5 w-full py-1.5 px-3 rounded-xl bg-cyan-600/70 hover:bg-cyan-600 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition shadow-sm"
                  title="Erstellt ein neues Projekt aus der Klausurvorlage"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Als neues Projekt anlegen</span>
                </button>
              </div>

              {/* Card 3: Thesis */}
              <div
                onClick={() => setSelectedCategoryFilter((prev) => (prev === 'Thesis' ? 'all' : 'Thesis'))}
                className={`p-4 rounded-2xl border transition cursor-pointer group shadow-sm flex flex-col justify-between ${
                  selectedCategoryFilter === 'Thesis'
                    ? 'ring-2 ring-amber-500 bg-amber-950/50 border-amber-500 shadow-amber-500/20'
                    : 'bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 border-amber-500/20 hover:border-amber-500/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <BookOpen className="w-4 h-4" />
                    </span>
                    {selectedCategoryFilter === 'Thesis' ? (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">
                        Aktiv gefiltert
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase text-amber-400">Thesis (Filter)</span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-200 transition">
                    Master- & Bachelorarbeit
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    Komplette Buch-/Kapitelstruktur mit Inhaltsverzeichnis, Abstract und Eidesstattlicher Erklärung.
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTemplateDirect('thesis-template');
                  }}
                  className="mt-3.5 w-full py-1.5 px-3 rounded-xl bg-amber-600/70 hover:bg-amber-600 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition shadow-sm"
                  title="Erstellt ein neues Projekt aus der Thesis-Vorlage"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Als neues Projekt anlegen</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section Header: Filter title & View Switcher */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {selectedFilter === 'all' && 'Alle Dokumente'}
                {selectedFilter === 'mine' && 'Meine Dokumente'}
                {selectedFilter === 'shared' && 'Mit mir geteilte Projekte'}
                {selectedFilter === 'starred' && 'Favorisierte Dokumente'}
                <span className="text-xs font-normal text-slate-400">
                  ({filteredProjects.length} {filteredProjects.length === 1 ? 'Projekt' : 'Projekte'})
                </span>
              </h2>

              {selectedCategoryFilter !== 'all' && (
                <button
                  onClick={() => setSelectedCategoryFilter('all')}
                  className="px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center gap-1 hover:bg-blue-500/30 transition"
                  title="Kategorie-Filter aufheben"
                >
                  <span>Kategorie: {selectedCategoryFilter}</span>
                  <span className="text-xs">✕</span>
                </button>
              )}

              {duplicateCount > 0 && onCleanupDuplicates && (
                <button
                  onClick={onCleanupDuplicates}
                  className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
                  title={`${duplicateCount} Duplikate gefunden. Klicke, um sie aufzuräumen.`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{duplicateCount} Duplikate bereinigen</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === 'grid' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Rasteransicht"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === 'list' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Listenansicht"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Projects Display: Grid or List */}
          {filteredProjects.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
              <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-300">Keine Dokumente gefunden</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `Es wurden keine Treffer für "${searchQuery}" gefunden.`
                  : 'Starte dein erstes LaTeX-Dokument mit einer akademischen Vorlage oder einem leeren Dokument.'}
              </p>
              <button
                onClick={onNewProjectClick}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition inline-flex items-center space-x-1.5 cursor-pointer shadow-md shadow-indigo-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Neues Dokument erstellen</span>
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => onOpenProject(proj.id)}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition-all cursor-pointer group flex flex-col justify-between relative shadow-sm"
                >
                  <div>
                    {/* Header with category and star */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                        {proj.category}
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleStar(proj.id);
                          }}
                          className={`p-1 rounded-md transition cursor-pointer ${
                            proj.isStarred ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                          }`}
                          title="Favorit"
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>

                        {/* More Menu */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenProjectId(menuOpenProjectId === proj.id ? null : proj.id);
                            }}
                            className="p-1 rounded-md text-slate-500 hover:text-white transition cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {menuOpenProjectId === proj.id && (
                            <div 
                              className="absolute right-0 top-6 w-44 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-40 animate-in fade-in zoom-in-95 duration-150"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={(e) => handleDuplicate(e, proj.id)}
                                className="w-full px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-2 transition text-left cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5 text-blue-400" />
                                <span>Duplizieren</span>
                              </button>
                              <button
                                onClick={(e) => handleExportZip(e, proj)}
                                className="w-full px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center space-x-2 transition text-left cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5 text-amber-400" />
                                <span>Als ZIP herunterladen</span>
                              </button>
                              <div className="my-1 border-t border-slate-800" />
                              <button
                                onClick={(e) => handleDelete(e, proj.id)}
                                className="w-full px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/15 flex items-center space-x-2 transition text-left cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Löschen</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition line-clamp-1">
                      {proj.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {proj.description || 'Keine Beschreibung vorhanden.'}
                    </p>
                  </div>

                  {/* Footer with Collaborators & Timestamp */}
                  <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-[11px]">{proj.lastModified}</span>
                    </div>

                    {proj.collaborators && proj.collaborators.length > 0 && (
                      <div className="flex -space-x-1">
                        {proj.collaborators.map((c) => (
                          <div
                            key={c.id}
                            className="w-5 h-5 rounded-full border border-slate-900 text-[9px] flex items-center justify-center font-bold text-white shadow"
                            style={{ backgroundColor: c.color }}
                            title={c.name}
                          >
                            {c.avatar}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Table / List View */
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 border-b border-slate-800 text-[11px] uppercase font-semibold text-slate-400 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Dokumentenname</th>
                    <th className="py-3 px-4">Kategorie</th>
                    <th className="py-3 px-4">Letzte Änderung</th>
                    <th className="py-3 px-4">Mitautoren</th>
                    <th className="py-3 px-4 text-right">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredProjects.map((proj) => (
                    <tr
                      key={proj.id}
                      onClick={() => onOpenProject(proj.id)}
                      className="hover:bg-slate-850/60 transition cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-bold text-white group-hover:text-indigo-300 transition flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleStar(proj.id);
                          }}
                          className={`cursor-pointer ${
                            proj.isStarred ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <span>{proj.name}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                          {proj.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{proj.lastModified}</td>
                      <td className="py-3.5 px-4">
                        {proj.collaborators && proj.collaborators.length > 0 ? (
                          <div className="flex -space-x-1">
                            {proj.collaborators.map((c) => (
                              <div
                                key={c.id}
                                className="w-4 h-4 rounded-full border border-slate-900 text-[8px] flex items-center justify-center font-bold text-white"
                                style={{ backgroundColor: c.color }}
                                title={c.name}
                              >
                                {c.avatar}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-600 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={(e) => handleExportZip(e, proj)}
                            className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer"
                            title="ZIP exportieren"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, proj.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 transition cursor-pointer"
                            title="Löschen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
