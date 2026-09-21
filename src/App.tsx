import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/layout/Navbar';
import { FileTree } from './components/sidebar/FileTree';
import { MathSnippetsPanel } from './components/tools/MathSnippetsPanel';
import { LatexEditor } from './components/editor/LatexEditor';
import { PdfViewer } from './components/preview/PdfViewer';
import { LogPanel } from './components/logs/LogPanel';
import { TemplateModal } from './components/modals/TemplateModal';
import { CollabModal } from './components/modals/CollabModal';
import { GitModal } from './components/modals/GitModal';
import { ReviewPanel } from './components/review/ReviewPanel';
import { AiAssistantPanel } from './components/tools/AiAssistantPanel';
import { DashboardView } from './components/dashboard/DashboardView';
import { AccountModal } from './components/dashboard/AccountModal';
import { NewProjectModal } from './components/dashboard/NewProjectModal';
import { LockScreen } from './components/auth/LockScreen';
import { FirstLoginScreen } from './components/auth/FirstLoginScreen';
import { TableEditorModal } from './components/modals/TableEditorModal';
import { PlotGeneratorModal } from './components/modals/PlotGeneratorModal';
import { CitationModal } from './components/modals/CitationModal';
import { EncryptionModal } from './components/modals/EncryptionModal';
import { LinterStatsModal } from './components/modals/LinterStatsModal';
import { SnapshotModal } from './components/modals/SnapshotModal';
import { BeamerModal } from './components/modals/BeamerModal';
import { CloudSyncModal } from './components/modals/CloudSyncModal';
import { exportArxivPackage } from './services/exportService';
import type { 
  ProjectFile, 
  CompilerLogEntry, 
  Collaborator, 
  LaTeXTemplate,
  GitConfig,
  GitCommit,
  DocumentComment,
  TrackChangeSuggestion,
  UserProfile,
  ProjectSummary
} from './types';
import { IEEE_TEMPLATE } from './templates/latexTemplates';
import { compileLatexProject, exportProjectAsPdf } from './services/compiler';
import { analyzeLatexCode } from './services/latexParser';
import {
  loadProjects,
  saveProjects,
  loadUserProfile,
  saveUserProfile,
  getActiveProjectId,
  setActiveProjectId,
  createProjectFromTemplate,
  createEmptyProject,
  duplicateProject,
  deleteProject,
  toggleStarProject,
  cleanupDuplicateProjects
} from './services/projectStorage';
import { isVaultLocked, setVaultLocked } from './services/passkeyService';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export const App: React.FC = () => {
  // 0. Dashboard & Project Management State
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor'>('dashboard');
  const [projects, setProjects] = useState<ProjectSummary[]>(() => loadProjects());
  const [userProfile, setUserProfile] = useState<UserProfile>(() => loadUserProfile());
  const [activeProjectId, setActiveProjectIdState] = useState<string>(() => getActiveProjectId());
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isLocked, setIsLocked] = useState<boolean>(() => isVaultLocked());

  const handleLockSession = () => {
    setVaultLocked(true);
    setIsLocked(true);
  };

  const handleUnlockSession = () => {
    setVaultLocked(false);
    setIsLocked(false);
  };

  const initialProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  // 1. Project & File Management State
  const [projectName, setProjectName] = useState(initialProject ? initialProject.name : 'AxiomTeX Hybrid Paper');
  const [files, setFiles] = useState<ProjectFile[]>(initialProject ? initialProject.files : IEEE_TEMPLATE.files);
  const [activeFileId, setActiveFileId] = useState<string>(initialProject?.files[0]?.id || IEEE_TEMPLATE.files[0].id);
  const [currentTemplate, setCurrentTemplate] = useState<LaTeXTemplate>(IEEE_TEMPLATE);

  // 2. Compilation State
  const [isCompiling, setIsCompiling] = useState(false);
  const [autoCompile, setAutoCompile] = useState(true);
  const [engine, setEngine] = useState<'wasm-browser' | 'cloud-texlive'>('wasm-browser');
  const [logs, setLogs] = useState<CompilerLogEntry[]>([]);
  const [lastCompileSuccess, setLastCompileSuccess] = useState<boolean | undefined>(undefined);
  const [compileDuration, setCompileDuration] = useState<number | undefined>(undefined);
  const [isLogOpen, setIsLogOpen] = useState(false);

  // 3. UI Panels & Modals
  const [isMathOpen, setIsMathOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
  const [isGitModalOpen, setIsGitModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Mega Features Phase 1
  const [isTableEditorOpen, setIsTableEditorOpen] = useState(false);
  const [isPlotGeneratorOpen, setIsPlotGeneratorOpen] = useState(false);
  const [isCitationModalOpen, setIsCitationModalOpen] = useState(false);
  const [isEncryptionModalOpen, setIsEncryptionModalOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isDoubleBlind, setIsDoubleBlind] = useState(false);

  // Mega Features Phase 2
  const [isLinterStatsOpen, setIsLinterStatsOpen] = useState(false);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [isBeamerModalOpen, setIsBeamerModalOpen] = useState(false);
  const [isCloudSyncModalOpen, setIsCloudSyncModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZenMode) {
        setIsZenMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode]);

  // 4. Editor References & Line tracking
  const editorRef = useRef<any>(null);
  const [activeLine, setActiveLine] = useState(1);

  // 5. Active Collaborators State (Yjs CRDT Presence Simulation)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: 'collab-1',
      name: 'Dr. Elena Schmidt',
      color: '#38bdf8',
      avatar: 'ES',
      role: 'editor',
      currentFileId: 'file-1',
      cursorLine: 34,
      status: 'online',
    },
    {
      id: 'collab-2',
      name: 'Alex Weber',
      color: '#a855f7',
      avatar: 'AW',
      role: 'editor',
      currentFileId: 'file-1',
      cursorLine: 58,
      status: 'online',
    },
  ]);

  // 6. Generic Git Integration State
  const [gitConfig, setGitConfig] = useState<GitConfig>({
    remoteUrl: '',
    branch: 'main',
    authorName: '',
    authorEmail: '',
    isConnected: false,
    lastSync: 'Nicht verknüpft',
    unpushedCommits: 0,
  });

  const [commits, setCommits] = useState<GitCommit[]>([]);

  // 7. Review & Track Changes State
  const [comments, setComments] = useState<DocumentComment[]>([
    {
      id: 'comm-1',
      fileId: 'file-1',
      line: 25,
      author: 'Dr. Elena Schmidt',
      avatar: 'ES',
      color: '#38bdf8',
      content: 'Sollten wir hier noch die IEEE Transactions Citation Guideline zitieren?',
      timestamp: 'Vor 15 Minuten',
      resolved: false,
      replies: [
        {
          id: 'rep-1',
          author: 'Alex Weber',
          content: 'Guter Punkt, habe Lamport (1984) schon in references.bib ergänzt.',
          timestamp: 'Vor 8 Minuten',
        },
      ],
    },
    {
      id: 'comm-2',
      fileId: 'file-1',
      line: 42,
      author: 'Alex Weber',
      avatar: 'AW',
      color: '#a855f7',
      content: 'Formel 2 geprüft: Matrixdimensionen stimmen mit R^{k x k} überein.',
      timestamp: 'Vor 45 Minuten',
      resolved: true,
    },
  ]);

  const [suggestions, setSuggestions] = useState<TrackChangeSuggestion[]>([
    {
      id: 'sug-1',
      fileId: 'file-1',
      line: 29,
      author: 'Dr. Elena Schmidt',
      color: '#38bdf8',
      originalText: 'existing cloud-based suites impose costs',
      suggestedText: 'existing proprietary cloud platforms incur excessive infrastructure overhead',
      status: 'pending',
      timestamp: 'Vor 20 Minuten',
    },
  ]);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];
  const activeContent = activeFile?.content || '';

  // Calculate live statistics
  const { logs: liveLogs, parsed: docStats } = analyzeLatexCode(activeContent);

  // Dashboard & Project Switch Handlers
  const handleOpenProjectFromDashboard = (projectId: string) => {
    const target = projects.find((p) => p.id === projectId);
    if (!target) return;
    setActiveProjectIdState(projectId);
    setActiveProjectId(projectId);
    setProjectName(target.name);
    setFiles(target.files);
    setActiveFileId(target.files[0]?.id || 'file-1');
    setCurrentView('editor');
  };

  const handleBackToDashboard = () => {
    // Persist current project files and name
    const updated = projects.map((p) => {
      if (p.id === activeProjectId) {
        return {
          ...p,
          name: projectName,
          files: files,
          lastModified: 'Gerade eben',
          updatedAt: Date.now(),
        };
      }
      return p;
    });
    setProjects(updated);
    saveProjects(updated);
    setCurrentView('dashboard');
  };

  const handleSaveUserProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    saveUserProfile(updated);
  };

  const handleToggleStar = (projId: string) => {
    const updated = toggleStarProject(projId);
    setProjects(updated);
  };

  const handleDuplicateProject = (projId: string) => {
    const cloned = duplicateProject(projId);
    if (cloned) {
      setProjects(loadProjects());
    }
  };

  const handleDeleteProject = (projId: string) => {
    const updated = deleteProject(projId);
    setProjects(updated);
  };

  const handleSelectTemplateDirect = (templateId: string) => {
    const newProj = createProjectFromTemplate(templateId);
    setProjects(loadProjects());
    handleOpenProjectFromDashboard(newProj.id);
  };

  const handleCleanupDuplicates = () => {
    const cleaned = cleanupDuplicateProjects();
    setProjects(cleaned);
  };

  const handleCreateEmptyProject = (name: string, description?: string) => {
    return createEmptyProject(name, description);
  };

  const handleCreateProjectFromTemplate = (templateId: string, customName?: string) => {
    return createProjectFromTemplate(templateId, customName);
  };

  const handleProjectCreated = (proj: ProjectSummary) => {
    setProjects(loadProjects());
    handleOpenProjectFromDashboard(proj.id);
  };

  // Compilation Handler
  const handleCompile = useCallback(async () => {
    setIsCompiling(true);
    const result = await compileLatexProject(files, activeFileId, engine);
    setLogs(result.logs);
    setLastCompileSuccess(result.success);
    setCompileDuration(result.durationMs);
    setIsCompiling(false);

    if (!result.success) {
      setIsLogOpen(true);
    }
  }, [files, activeFileId, engine]);

  // Initial Compile
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    handleCompile();
  }, [handleCompile]);

  // Debounced Auto-Compile
  useEffect(() => {
    if (!autoCompile) return;
    const timer = setTimeout(() => {
      handleCompile();
    }, 1200);
    return () => clearTimeout(timer);
  }, [activeContent, autoCompile, handleCompile]);

  // Global Keyboard Shortcuts (Ctrl/Cmd + Enter to Compile)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleCompile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCompile]);

  // File Operations
  const handleSelectFile = (fileId: string) => {
    setActiveFileId(fileId);
  };

  const handleUpdateContent = (newContent: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === activeFileId ? { ...f, content: newContent } : f))
    );
  };

  const handleCreateFile = (name: string, isFolder: boolean) => {
    const ext = name.split('.').pop() || 'tex';
    const newFile: ProjectFile = {
      id: `file-${Date.now()}`,
      name,
      path: `/${name}`,
      isFolder,
      type: isFolder ? 'folder' : (ext as any),
      content: isFolder
        ? ''
        : `% Neue LaTeX Datei: ${name}\n\\section{${name.replace('.tex', '')}}\n\n`,
    };
    setFiles((prev) => [...prev, newFile]);
    if (!isFolder) setActiveFileId(newFile.id);
  };

  const handleDeleteFile = (fileId: string) => {
    if (files.length <= 1) return;
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (activeFileId === fileId) {
      const remaining = files.filter((f) => f.id !== fileId);
      setActiveFileId(remaining[0].id);
    }
  };

  const handleRenameFile = (fileId: string, newName: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, name: newName } : f))
    );
  };

  // Math & AI Snippet Insertion into Monaco
  const handleInsertSnippet = (snippet: string) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const selection = editor.getSelection();
      editor.executeEdits('snippet-insert', [
        {
          range: selection,
          text: snippet,
          forceMoveMarkers: true,
        },
      ]);
      editor.focus();
    }
  };

  // Append new BibTeX entry to references.bib
  const handleAppendToBib = (bibEntry: string) => {
    setFiles((prev) => {
      const bibFile = prev.find((f) => f.name === 'references.bib');
      if (bibFile) {
        return prev.map((f) =>
          f.id === bibFile.id ? { ...f, content: f.content + bibEntry } : f
        );
      } else {
        const newBib: ProjectFile = {
          id: `file-${Date.now()}`,
          name: 'references.bib',
          path: '/references.bib',
          isFolder: false,
          type: 'bib',
          content: `% BibTeX Referenzen\n` + bibEntry,
        };
        return [...prev, newBib];
      }
    });
  };

  // Jump to Line in Editor (SyncTeX)
  const handleJumpToLine = (lineNumber: number) => {
    setActiveLine(lineNumber);
    if (editorRef.current) {
      const editor = editorRef.current;
      editor.revealLineInCenter(lineNumber);
      editor.setPosition({ lineNumber, column: 1 });
      editor.focus();
    }
  };

  // Comments & Review Handlers
  const handleAddComment = (content: string, line: number) => {
    const newComment: DocumentComment = {
      id: `comm-${Date.now()}`,
      fileId: activeFileId,
      line,
      author: gitConfig.authorName || 'Du',
      avatar: 'DU',
      color: '#10b981',
      content,
      timestamp: 'Gerade eben',
      resolved: false,
      replies: [],
    };
    setComments((prev) => [newComment, ...prev]);
  };

  const handleResolveComment = (id: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, resolved: !c.resolved } : c))
    );
  };

  const handleReplyComment = (commentId: string, replyText: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            replies: [
              ...(c.replies || []),
              {
                id: `rep-${Date.now()}`,
                author: gitConfig.authorName || 'Du',
                content: replyText,
                timestamp: 'Gerade eben',
              },
            ],
          };
        }
        return c;
      })
    );
  };

  const handleAcceptSuggestion = (id: string) => {
    const sug = suggestions.find((s) => s.id === id);
    if (sug && activeFile) {
      const updatedContent = activeContent.replace(sug.originalText, sug.suggestedText);
      handleUpdateContent(updatedContent);
      setSuggestions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'accepted' } : s))
      );
    }
  };

  const handleRejectSuggestion = (id: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'rejected' } : s))
    );
  };

  // Git Commit & Push simulation
  const handleCommitAndPush = async (message: string) => {
    await new Promise((r) => setTimeout(r, 600));
    const newCommit: GitCommit = {
      hash: Math.random().toString(16).substring(2, 9),
      message,
      author: gitConfig.authorName,
      timestamp: 'Gerade eben',
      filesChanged: 1,
    };
    setCommits((prev) => [newCommit, ...prev]);
    setGitConfig((prev) => ({ ...prev, unpushedCommits: 0, lastSync: 'Gerade eben' }));
  };

  const handlePullChanges = async () => {
    await new Promise((r) => setTimeout(r, 700));
    setGitConfig((prev) => ({ ...prev, lastSync: 'Gerade eben' }));
  };

  // Template Switching
  const handleSelectTemplate = (template: LaTeXTemplate) => {
    setCurrentTemplate(template);
    setFiles(template.files);
    setActiveFileId(template.files[0].id);
    setProjectName(template.title);
    setTimeout(() => handleCompile(), 100);
  };

  // Download PDF
  const handleDownloadPdf = () => {
    exportProjectAsPdf(docStats.title || projectName, activeContent);
  };

  // Export Project as ZIP
  const handleExportZip = async () => {
    const zip = new JSZip();
    files.forEach((file) => {
      if (!file.isFolder) {
        zip.file(file.name, file.content);
      }
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_source.zip`);
  };

  // Export clean arXiv Submission Package
  const handleExportArxiv = async () => {
    await exportArxivPackage(files, projectName);
  };

  // Import Decrypted Project Files
  const handleImportDecryptedFiles = (decryptedFiles: ProjectFile[], name: string) => {
    setFiles(decryptedFiles);
    setProjectName(name);
    if (decryptedFiles.length > 0) {
      setActiveFileId(decryptedFiles[0].id);
    }
  };

  // Add Simulated Collaborator
  const handleAddCollaborator = () => {
    const names = [
      'Prof. Dr. Michael Bauer',
      'Prof. Chen Wei',
      'Sarah Al-Mansoor',
      'Julian Franke',
      'Klara Novak',
    ];
    const colors = ['#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const initials = randomName
      .split(' ')
      .slice(-2)
      .map((n) => n[0])
      .join('');

    const newCollab: Collaborator = {
      id: `collab-${Date.now()}`,
      name: randomName,
      color: randomColor,
      avatar: initials,
      role: 'editor',
      currentFileId: activeFileId,
      cursorLine: Math.floor(Math.random() * 40) + 10,
      status: 'online',
    };

    setCollaborators((prev) => [...prev, newCollab]);
  };

  // If first-time setup is not completed, render the FirstLoginScreen
  if (!userProfile.isSetupComplete) {
    return (
      <FirstLoginScreen
        onComplete={(newProfile) => {
          saveUserProfile(newProfile);
          setUserProfile(newProfile);
        }}
      />
    );
  }

  // If session is locked, render the biometric LockScreen
  if (isLocked) {
    return <LockScreen userProfile={userProfile} onUnlock={handleUnlockSession} />;
  }

  // If on Dashboard view, render the Main Screen
  if (currentView === 'dashboard') {
    return (
      <div className={`w-full h-full min-h-screen ${isDarkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
        <DashboardView
          projects={projects}
          userProfile={userProfile}
          onOpenProject={handleOpenProjectFromDashboard}
          onNewProjectClick={() => setIsNewProjectModalOpen(true)}
          onOpenAccountClick={() => setIsAccountModalOpen(true)}
          onToggleStar={handleToggleStar}
          onDuplicateProject={handleDuplicateProject}
          onDeleteProject={handleDeleteProject}
          onSelectTemplateDirect={handleSelectTemplateDirect}
          onCleanupDuplicates={handleCleanupDuplicates}
          isDarkMode={isDarkMode}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onLockSession={handleLockSession}
        />

        <AccountModal
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
          profile={userProfile}
          onSaveProfile={handleSaveUserProfile}
          onLockSession={handleLockSession}
        />

        <NewProjectModal
          isOpen={isNewProjectModalOpen}
          onClose={() => setIsNewProjectModalOpen(false)}
          onCreateEmpty={handleCreateEmptyProject}
          onCreateFromTemplate={handleCreateProjectFromTemplate}
          onProjectCreated={handleProjectCreated}
        />
      </div>
    );
  }

  // Otherwise, render the LaTeX Workspace / Editor View
  return (
    <div className={`h-screen w-screen flex flex-col ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      {/* Top Navbar */}
      <Navbar
        projectName={projectName}
        setProjectName={setProjectName}
        isCompiling={isCompiling}
        onCompile={handleCompile}
        autoCompile={autoCompile}
        setAutoCompile={setAutoCompile}
        engine={engine}
        setEngine={setEngine}
        lastCompileSuccess={lastCompileSuccess}
        collaborators={collaborators}
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
        onOpenCollab={() => setIsCollabModalOpen(true)}
        onOpenMathPalette={() => {
          setIsMathOpen(!isMathOpen);
          setIsReviewOpen(false);
          setIsAiOpen(false);
        }}
        isMathOpen={isMathOpen}
        onExportZip={handleExportZip}
        onDownloadPdf={handleDownloadPdf}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        currentTemplate={currentTemplate}
        onOpenGit={() => setIsGitModalOpen(true)}
        gitConfig={gitConfig}
        onOpenReview={() => {
          setIsReviewOpen(!isReviewOpen);
          setIsMathOpen(false);
          setIsAiOpen(false);
        }}
        isReviewOpen={isReviewOpen}
        unresolvedCommentCount={comments.filter((c) => !c.resolved).length}
        onOpenAiAssistant={() => {
          setIsAiOpen(!isAiOpen);
          setIsMathOpen(false);
          setIsReviewOpen(false);
        }}
        isAiOpen={isAiOpen}
        onBackToDashboard={handleBackToDashboard}
        onOpenAccount={() => setIsAccountModalOpen(true)}
        userProfile={userProfile}
        onLockSession={handleLockSession}
        onOpenTableEditor={() => setIsTableEditorOpen(true)}
        onOpenPlotGenerator={() => setIsPlotGeneratorOpen(true)}
        onOpenCitationManager={() => setIsCitationModalOpen(true)}
        onOpenEncryption={() => setIsEncryptionModalOpen(true)}
        onExportArxiv={handleExportArxiv}
        isZenMode={isZenMode}
        onToggleZenMode={() => setIsZenMode(!isZenMode)}
        isDoubleBlind={isDoubleBlind}
        onToggleDoubleBlind={() => setIsDoubleBlind(!isDoubleBlind)}
        onOpenLinterStats={() => setIsLinterStatsOpen(true)}
        onOpenSnapshots={() => setIsSnapshotModalOpen(true)}
        onOpenBeamer={() => setIsBeamerModalOpen(true)}
        onOpenCloudSync={() => setIsCloudSyncModalOpen(true)}
      />

      {/* Main Workspace Split Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Floating Zen Mode Banner */}
        {isZenMode && (
          <div className="absolute top-3 right-4 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-200 text-xs font-medium backdrop-blur-md shadow-lg animate-fade-in">
            <span>Zen-Modus aktiv (ESC zum Beenden)</span>
            <button
              onClick={() => setIsZenMode(false)}
              className="ml-1 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Leftmost: File Explorer (hidden in Zen mode) */}
        {!isZenMode && (
          <FileTree
            files={files}
            activeFileId={activeFileId}
            onSelectFile={handleSelectFile}
            onCreateFile={handleCreateFile}
            onDeleteFile={handleDeleteFile}
            onRenameFile={handleRenameFile}
            wordCount={docStats.wordCount}
            charCount={docStats.charCount}
            equationCount={docStats.equationCount}
          />
        )}

        {/* Side Panel: Math Snippet Palette */}
        <MathSnippetsPanel
          isOpen={isMathOpen && !isZenMode}
          onClose={() => setIsMathOpen(false)}
          onInsertSnippet={handleInsertSnippet}
        />

        {/* Side Panel: Review & Track Changes */}
        <ReviewPanel
          isOpen={isReviewOpen && !isZenMode}
          onClose={() => setIsReviewOpen(false)}
          comments={comments}
          suggestions={suggestions}
          onAddComment={handleAddComment}
          onResolveComment={handleResolveComment}
          onReplyComment={handleReplyComment}
          onAcceptSuggestion={handleAcceptSuggestion}
          onRejectSuggestion={handleRejectSuggestion}
          onJumpToLine={handleJumpToLine}
          activeLine={activeLine}
        />

        {/* Side Panel: AI Assistant & DOI Fetcher */}
        <AiAssistantPanel
          isOpen={isAiOpen && !isZenMode}
          onClose={() => setIsAiOpen(false)}
          onInsertText={handleInsertSnippet}
          onAppendToBib={handleAppendToBib}
        />

        {/* Center: Monaco LaTeX Code Editor (with Visual Mode toggle) */}
        <div className={`flex-1 flex flex-col h-full border-r border-slate-800 relative ${isZenMode ? 'max-w-4xl mx-auto border-r-0 shadow-2xl' : ''}`}>
          <LatexEditor
            value={activeContent}
            onChange={handleUpdateContent}
            fileName={activeFile?.name || 'main.tex'}
            logs={logs.length > 0 ? logs : liveLogs}
            collaborators={collaborators.filter((c) => c.currentFileId === activeFileId)}
            onCursorChange={(line) => setActiveLine(line)}
            isDarkMode={isDarkMode}
            editorRef={editorRef}
            onAddCommentAtLine={(line) => {
              setActiveLine(line);
              setIsReviewOpen(true);
            }}
          />
        </div>

        {/* Right: PDF Live Document Preview (hidden in Zen mode) */}
        {!isZenMode && (
          <div className="flex-1 flex flex-col h-full relative">
            <PdfViewer
              code={activeContent}
              isCompiling={isCompiling}
              onDownloadPdf={handleDownloadPdf}
              onJumpToLine={handleJumpToLine}
              isDoubleBlind={isDoubleBlind}
            />
          </div>
        )}
      </div>

      {/* Bottom: Diagnostics & Compiler Logs Drawer (hidden in Zen mode) */}
      {!isZenMode && (
        <LogPanel
          logs={logs.length > 0 ? logs : liveLogs}
          isOpen={isLogOpen}
          onToggle={() => setIsLogOpen(!isLogOpen)}
          onJumpToLine={handleJumpToLine}
          durationMs={compileDuration}
          engineUsed={engine}
        />
      )}

      {/* Modals */}
      <TableEditorModal
        isOpen={isTableEditorOpen}
        onClose={() => setIsTableEditorOpen(false)}
        onInsert={handleInsertSnippet}
      />

      <PlotGeneratorModal
        isOpen={isPlotGeneratorOpen}
        onClose={() => setIsPlotGeneratorOpen(false)}
        onInsert={handleInsertSnippet}
      />

      <CitationModal
        isOpen={isCitationModalOpen}
        onClose={() => setIsCitationModalOpen(false)}
        activeTexContent={activeContent}
        bibContent={files.filter((f) => f.name.endsWith('.bib')).map((f) => f.content).join('\n')}
        onInsertBibtex={handleAppendToBib}
      />

      <EncryptionModal
        isOpen={isEncryptionModalOpen}
        onClose={() => setIsEncryptionModalOpen(false)}
        files={files}
        projectName={projectName}
        onImportDecryptedFiles={handleImportDecryptedFiles}
      />

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        profile={userProfile}
        onSaveProfile={handleSaveUserProfile}
        onLockSession={handleLockSession}
      />

      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        currentTemplateId={currentTemplate.id}
      />

      <CollabModal
        isOpen={isCollabModalOpen}
        onClose={() => setIsCollabModalOpen(false)}
        collaborators={collaborators}
        onAddSimulatedCollaborator={handleAddCollaborator}
      />

      <GitModal
        isOpen={isGitModalOpen}
        onClose={() => setIsGitModalOpen(false)}
        gitConfig={gitConfig}
        onUpdateGitConfig={setGitConfig}
        commits={commits}
        onCommitAndPush={handleCommitAndPush}
        onPullChanges={handlePullChanges}
      />

      <LinterStatsModal
        isOpen={isLinterStatsOpen}
        onClose={() => setIsLinterStatsOpen(false)}
        activeTexContent={activeContent}
        onUpdateContent={(newContent) => handleUpdateContent(newContent)}
        onJumpToLine={handleJumpToLine}
      />

      <SnapshotModal
        isOpen={isSnapshotModalOpen}
        onClose={() => setIsSnapshotModalOpen(false)}
        projectId={activeProjectId}
        currentFiles={files}
        activeFileId={activeFileId}
        onRestoreSnapshot={(restoredFiles) => {
          setFiles(restoredFiles);
        }}
      />

      <BeamerModal
        isOpen={isBeamerModalOpen}
        onClose={() => setIsBeamerModalOpen(false)}
        activeTexContent={activeContent}
      />

      <CloudSyncModal
        isOpen={isCloudSyncModalOpen}
        onClose={() => setIsCloudSyncModalOpen(false)}
        projectName={projectName}
        files={files}
        onImportProjectFiles={(importedFiles) => {
          setFiles(importedFiles);
          if (importedFiles.length > 0) {
            setActiveFileId(importedFiles[0].id);
          }
        }}
      />
    </div>
  );
};

export default App;
