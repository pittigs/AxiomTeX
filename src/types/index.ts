export type FileType = 'tex' | 'bib' | 'cls' | 'sty' | 'image' | 'folder' | 'other';

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  content: string;
  isFolder: boolean;
  parentId?: string | null;
  type: FileType;
  isOpen?: boolean;
  size?: number;
}

export interface CompilerLogEntry {
  type: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  file?: string;
  raw?: string;
}

export interface CompilationResult {
  success: boolean;
  pdfUrl?: string;
  timestamp: string;
  durationMs: number;
  logs: CompilerLogEntry[];
  engineUsed: 'wasm-browser' | 'cloud-texlive';
  pageCount: number;
}

export interface Collaborator {
  id: string;
  name: string;
  color: string;
  avatar: string;
  role: 'owner' | 'editor' | 'viewer';
  currentFileId: string;
  cursorLine?: number;
  status: 'online' | 'idle';
}

export interface LaTeXTemplate {
  id: string;
  title: string;
  description: string;
  category: 'Paper' | 'Thesis' | 'Slides' | 'Resume' | 'CheatSheet';
  author: string;
  icon: string;
  files: ProjectFile[];
}

// Git Integration Types (Generic for any provider)
export interface GitConfig {
  remoteUrl: string;
  branch: string;
  authorName: string;
  authorEmail: string;
  token?: string;
  isConnected: boolean;
  lastSync?: string;
  unpushedCommits: number;
}

export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  timestamp: string;
  filesChanged: number;
}

// Review & Track Changes Types
export interface DocumentComment {
  id: string;
  fileId: string;
  line: number;
  author: string;
  avatar: string;
  color: string;
  content: string;
  timestamp: string;
  resolved: boolean;
  replies?: {
    id: string;
    author: string;
    content: string;
    timestamp: string;
  }[];
}

export interface TrackChangeSuggestion {
  id: string;
  fileId: string;
  line: number;
  author: string;
  color: string;
  originalText: string;
  suggestedText: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
}

// AI & DOI Fetcher Types
export interface AiProviderConfig {
  provider: 'openai' | 'anthropic' | 'gemini' | 'ollama-local';
  apiKey?: string;
  model: string;
  endpoint?: string;
}

// On-Premises & Server Configuration Types
export interface OnPremConfig {
  serverUrl: string;
  compilerEngine: 'client-katex' | 'remote-texlive';
  remoteCompilerUrl: string;
  authType: 'none' | 'bearer' | 'basic';
  authToken: string;
  customHeaderName?: string;
  customHeaderValue?: string;
  syncBackend: 'local-browser' | 'onprem-server' | 'webdav-nextcloud';
}

// User Profile & Account Types
export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  email: string;
  avatar: string;
  role: string;
  isAdmin?: boolean;
  isSetupComplete?: boolean;
  affiliation: string;
  orcid?: string;
  bio?: string;
  plan: 'AxiomTeX Community' | 'AxiomTeX Academic Pro' | 'Campus License' | 'AxiomTeX On-Demand' | 'OpenTeX Community' | 'OpenTeX Academic Pro' | 'OpenTeX On-Demand';
  storageUsedMb: number;
  storageLimitMb: number;
  deploymentMode: 'on-demand' | 'on-premise';
  onPremConfig?: OnPremConfig;
  gitUsername?: string;
  gitEmail?: string;
  gitToken?: string;
  aiKeys?: {
    openai?: string;
    gemini?: string;
    anthropic?: string;
    ollamaEndpoint?: string;
  };
}

// Project Management & Dashboard Types
export interface ProjectSummary {
  id: string;
  name: string;
  description: string;
  category: 'Paper' | 'Thesis' | 'Exam' | 'Slides' | 'General';
  lastModified: string;
  updatedAt: number;
  isStarred: boolean;
  isArchived: boolean;
  isShared: boolean;
  ownerId: string;
  files: ProjectFile[];
  collaborators: Collaborator[];
}

// Academic Linter & Statistics Types
export interface LinterIssue {
  id: string;
  line: number;
  column?: number;
  severity: 'error' | 'warning' | 'info';
  category: 'citation' | 'style' | 'grammar' | 'latex' | 'readability';
  message: string;
  excerpt?: string;
  fixSuggestion?: {
    label: string;
    replacementText: string;
    targetText: string;
  };
}

export interface DocumentStats {
  wordCount: number;
  characterCount: number;
  characterCountNoSpaces: number;
  paragraphCount: number;
  sentenceCount: number;
  equationCount: number;
  citationCount: number;
  readingTimeMinutes: number;
  readabilityScore: number; // Flesch Reading Ease (0 - 100)
  gradeLevel: string;
}

// Project Snapshot & Version History Types
export interface ProjectSnapshot {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  timestamp: string;
  createdAt: number;
  files: ProjectFile[];
  tags?: string[];
}

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

// Beamer / Presentation Slide Types
export interface BeamerSlide {
  id: string;
  index: number;
  title: string;
  subtitle?: string;
  content: string;
  bulletPoints: string[];
  equations: string[];
  rawLatex: string;
}

// Cloud Storage & Sync Types
export type CloudProvider = 'google-drive' | 'nextcloud' | 'local-folder';

export interface CloudStorageConfig {
  provider: CloudProvider;
  enabled: boolean;
  autoSync: boolean;
  lastSync?: string;
  // Google Drive
  googleClientId?: string;
  googleFolderId?: string;
  googleFolderName?: string;
  googleAccessToken?: string;
  // WebDAV / Nextcloud
  webdavUrl?: string;
  webdavUsername?: string;
  webdavPassword?: string;
  webdavRemotePath?: string;
  // Local Folder
  localFolderHandleName?: string;
}

