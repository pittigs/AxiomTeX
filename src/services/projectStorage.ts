import type { ProjectSummary, UserProfile } from '../types';
import { ALL_TEMPLATES, IEEE_TEMPLATE, EXAM_TEMPLATE, THESIS_TEMPLATE } from '../templates/latexTemplates';

const STORAGE_PROJECTS_KEY = 'axiomtex_projects_v1';
const STORAGE_PROFILE_KEY = 'axiomtex_user_profile_v1';
const STORAGE_ACTIVE_PROJECT_KEY = 'axiomtex_active_project_id_v1';

const LEGACY_STORAGE_PROJECTS_KEY = 'opentex_projects_v1';
const LEGACY_STORAGE_PROFILE_KEY = 'opentex_user_profile_v1';
const LEGACY_STORAGE_ACTIVE_PROJECT_KEY = 'opentex_active_project_id_v1';

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'usr-admin',
  name: 'Administrator',
  username: 'admin',
  email: '',
  avatar: 'AD',
  role: 'Administrator',
  isAdmin: true,
  isSetupComplete: false,
  affiliation: 'AxiomTeX Studio',
  orcid: '',
  bio: 'Hauptverwalter dieser AxiomTeX-Instanz.',
  plan: 'AxiomTeX On-Demand',
  storageUsedMb: 14.2,
  storageLimitMb: 5120, // 5 GB
  deploymentMode: 'on-demand',
  onPremConfig: {
    serverUrl: 'http://localhost:8080',
    compilerEngine: 'client-katex',
    remoteCompilerUrl: 'http://localhost:8080/api/compile',
    authType: 'none',
    authToken: '',
    customHeaderName: '',
    customHeaderValue: '',
    syncBackend: 'local-browser',
  },
  gitUsername: '',
  gitEmail: '',
  gitToken: '',
  aiKeys: {
    openai: '',
    gemini: '',
    anthropic: '',
    ollamaEndpoint: 'http://localhost:11434',
  },
};

const INITIAL_PROJECTS: ProjectSummary[] = [
  {
    id: 'proj-crdt-ieee',
    name: 'AxiomTeX Publication (IEEE Template)',
    description: 'IEEE Transactions LaTeX Template mit 2-Spalten-Layout, Formeln, Tabellen und BibTeX.',
    category: 'Paper',
    lastModified: 'Gerade eben',
    updatedAt: Date.now() - 12 * 60 * 1000,
    isStarred: true,
    isArchived: false,
    isShared: false,
    ownerId: 'usr-admin',
    files: IEEE_TEMPLATE.files,
    collaborators: [],
  },
  {
    id: 'proj-academic-exam',
    name: 'Academic Probability Exam 2026',
    description: 'Universitäre Klausur- und Übungsvorlage mit Aufgabenboxen, Punktetabelle und Deckblatt.',
    category: 'Exam',
    lastModified: 'Vor 2 Stunden',
    updatedAt: Date.now() - 2 * 3600 * 1000,
    isStarred: true,
    isArchived: false,
    isShared: false,
    ownerId: 'usr-admin',
    files: EXAM_TEMPLATE.files,
    collaborators: [],
  },
  {
    id: 'proj-thesis-ai',
    name: 'Master Thesis: Decentralized Consensus',
    description: 'Masterarbeit an der Fakultät für Informatik, Abschlussarbeit mit TeX-Kapitelstruktur.',
    category: 'Thesis',
    lastModified: 'Gestern',
    updatedAt: Date.now() - 24 * 3600 * 1000,
    isStarred: false,
    isArchived: false,
    isShared: false,
    ownerId: 'usr-admin',
    files: THESIS_TEMPLATE.files,
    collaborators: [],
  },
];

/**
 * Loads all projects from localStorage, falling back to legacy keys or initial projects.
 */
export function loadProjects(): ProjectSummary[] {
  try {
    let raw = localStorage.getItem(STORAGE_PROJECTS_KEY);
    if (!raw) {
      raw = localStorage.getItem(LEGACY_STORAGE_PROJECTS_KEY);
    }
    if (!raw) {
      saveProjects(INITIAL_PROJECTS);
      return INITIAL_PROJECTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_PROJECTS;
  } catch (err) {
    console.warn('Failed to load projects from localStorage:', err);
    return INITIAL_PROJECTS;
  }
}

/**
 * Persists all projects to localStorage.
 */
export function saveProjects(projects: ProjectSummary[]): void {
  try {
    localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save projects to localStorage:', err);
  }
}

/**
 * Loads the user profile from localStorage with backwards compatibility.
 */
export function loadUserProfile(): UserProfile {
  try {
    let raw = localStorage.getItem(STORAGE_PROFILE_KEY);
    if (!raw) {
      raw = localStorage.getItem(LEGACY_STORAGE_PROFILE_KEY);
    }
    if (!raw) {
      return DEFAULT_USER_PROFILE;
    }
    const parsed = JSON.parse(raw);
    // Migration: If old mock profile (Maximilian Müller or usr-1 or missing deploymentMode), migrate to clean on-demand
    if (parsed.id === 'usr-1' || parsed.name === 'Maximilian Müller' || !parsed.deploymentMode) {
      const migrated: UserProfile = {
        ...DEFAULT_USER_PROFILE,
        ...parsed,
        id: parsed.id === 'usr-1' ? DEFAULT_USER_PROFILE.id : parsed.id,
        name: parsed.name === 'Maximilian Müller' ? 'On-Demand Gast' : (parsed.name || DEFAULT_USER_PROFILE.name),
        email: parsed.email === 'max.mueller@opentex.org' ? '' : (parsed.email || ''),
        avatar: parsed.avatar === 'MM' ? 'OD' : (parsed.avatar || DEFAULT_USER_PROFILE.avatar),
        role: parsed.role === 'Wissenschaftlicher Mitarbeiter / PhD Candidate' ? DEFAULT_USER_PROFILE.role : (parsed.role || DEFAULT_USER_PROFILE.role),
        affiliation: parsed.affiliation === 'Universität / Forschungsinstitut' ? DEFAULT_USER_PROFILE.affiliation : (parsed.affiliation || DEFAULT_USER_PROFILE.affiliation),
        plan: (parsed.plan?.replace('OpenTeX', 'AxiomTeX') as any) || 'AxiomTeX On-Demand',
        gitUsername: parsed.gitUsername === 'pittigs' ? '' : (parsed.gitUsername || ''),
        gitEmail: parsed.gitEmail === 'max.mueller@opentex.org' ? '' : (parsed.gitEmail || ''),
        deploymentMode: parsed.deploymentMode || 'on-demand',
        onPremConfig: { ...DEFAULT_USER_PROFILE.onPremConfig, ...(parsed.onPremConfig || {}) },
      };
      saveUserProfile(migrated);
      return migrated;
    }
    return {
      ...DEFAULT_USER_PROFILE,
      ...parsed,
      plan: (parsed.plan?.replace('OpenTeX', 'AxiomTeX') as any) || 'AxiomTeX On-Demand',
      onPremConfig: { ...DEFAULT_USER_PROFILE.onPremConfig, ...(parsed.onPremConfig || {}) }
    };
  } catch {
    return DEFAULT_USER_PROFILE;
  }
}


/**
 * Saves user profile to localStorage.
 */
export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save user profile:', err);
  }
}

/**
 * Returns the currently active project ID.
 */
export function getActiveProjectId(): string {
  try {
    return localStorage.getItem(STORAGE_ACTIVE_PROJECT_KEY) || 
           localStorage.getItem(LEGACY_STORAGE_ACTIVE_PROJECT_KEY) || 
           INITIAL_PROJECTS[0].id;
  } catch {
    return INITIAL_PROJECTS[0].id;
  }
}

/**
 * Sets the active project ID.
 */
export function setActiveProjectId(id: string): void {
  localStorage.setItem(STORAGE_ACTIVE_PROJECT_KEY, id);
}

/**
 * Creates a new project from a predefined template.
 */
export function createProjectFromTemplate(templateId: string, customName?: string): ProjectSummary {
  const template = ALL_TEMPLATES.find((t) => t.id === templateId) || IEEE_TEMPLATE;
  const newProject: ProjectSummary = {
    id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: customName || template.title,
    description: template.description,
    category: (template.category as any) || 'General',
    lastModified: 'Gerade eben',
    updatedAt: Date.now(),
    isStarred: false,
    isArchived: false,
    isShared: false,
    ownerId: 'usr-admin',
    files: JSON.parse(JSON.stringify(template.files)),
    collaborators: [],
  };

  const projects = loadProjects();
  const updated = [newProject, ...projects];
  saveProjects(updated);
  setActiveProjectId(newProject.id);
  return newProject;
}

/**
 * Creates an empty LaTeX project.
 */
export function createEmptyProject(name: string, description?: string): ProjectSummary {
  const newProject: ProjectSummary = {
    id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: name || 'Neues Projekt',
    description: description || 'Leeres LaTeX-Dokument.',
    category: 'General',
    lastModified: 'Gerade eben',
    updatedAt: Date.now(),
    isStarred: false,
    isArchived: false,
    isShared: false,
    ownerId: 'usr-admin',
    files: [
      {
        id: `file-${Date.now()}`,
        name: 'main.tex',
        path: '/main.tex',
        isFolder: false,
        type: 'tex',
        content: `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{amsmath,amssymb}
\\usepackage{geometry}
\\geometry{margin=2.5cm}

\\title{${name || 'Neues LaTeX Dokument'}}
\\author{Autor}
\\date{\\today}

\\begin{document}
\\maketitle

\\section{Einleitung}
Willkommen in deinem neuen LaTeX-Dokument mit AxiomTeX!

\\end{document}
`,
      },
    ],
    collaborators: [],
  };

  const projects = loadProjects();
  const updated = [newProject, ...projects];
  saveProjects(updated);
  setActiveProjectId(newProject.id);
  return newProject;
}

/**
 * Duplicates an existing project.
 */
export function duplicateProject(projectId: string): ProjectSummary | null {
  const projects = loadProjects();
  const target = projects.find((p) => p.id === projectId);
  if (!target) return null;

  const clone: ProjectSummary = {
    ...JSON.parse(JSON.stringify(target)),
    id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: `${target.name} (Kopie)`,
    lastModified: 'Gerade eben',
    updatedAt: Date.now(),
    isStarred: false,
  };

  const updated = [clone, ...projects];
  saveProjects(updated);
  return clone;
}

/**
 * Deletes a project.
 */
export function deleteProject(projectId: string): ProjectSummary[] {
  const projects = loadProjects();
  const updated = projects.filter((p) => p.id !== projectId);
  saveProjects(updated);
  return updated;
}

/**
 * Toggles the starred status of a project.
 */
export function toggleStarProject(projectId: string): ProjectSummary[] {
  const projects = loadProjects();
  const updated = projects.map((p) => (p.id === projectId ? { ...p, isStarred: !p.isStarred } : p));
  saveProjects(updated);
  return updated;
}

/**
 * Removes duplicate projects with identical names and categories, keeping only the most recent one.
 */
export function cleanupDuplicateProjects(): ProjectSummary[] {
  const projects = loadProjects();
  const seenNames = new Set<string>();
  const uniqueProjects: ProjectSummary[] = [];

  for (const p of projects) {
    const key = `${p.name.trim()}_${p.category}`;
    if (!seenNames.has(key)) {
      seenNames.add(key);
      uniqueProjects.push(p);
    }
  }

  saveProjects(uniqueProjects);
  return uniqueProjects;
}

