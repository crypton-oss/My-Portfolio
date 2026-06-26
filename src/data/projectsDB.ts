import { supabase } from '../lib/supabase';
import { siteConfig } from '../config/site';

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  descriptions?: Record<string, string>;
  image: string;
  languages: Array<{ id: string; name: string }>;
  hideCode: boolean;
  repoFullName: string;
  createdAt?: string;
  hidden?: boolean;
}

const API_BASE = siteConfig.apiUrl || '/api';

function apiHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const key = import.meta.env.VITE_ADMIN_API_KEY;
  if (key) headers['Authorization'] = `Bearer ${key}`;
  return headers;
}

/** Get all projects — Supabase direct (public), fallback IndexedDB */
export async function getAllProjects(): Promise<ProjectData[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('createdAt', { ascending: false });
    if (!error && data) return data;
  }
  // Fallback: try serverless API
  try {
    const res = await fetch(`${API_BASE}/projects`, { headers: apiHeaders() });
    if (res.ok) return await res.json();
  } catch { /* fall through */ }
  return getProjectsFromLocal();
}

/** Add a project — via API (service_role), fallback local */
export async function addProject(project: ProjectData): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: apiHeaders(),
      body: JSON.stringify(project),
    });
    if (res.ok) return;
  } catch { /* fall through */ }
  saveProjectLocal(project);
}

/** Delete a project */
export async function deleteProject(id: string): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'DELETE',
      headers: apiHeaders(),
      body: JSON.stringify({ id }),
    });
    if (res.ok) return;
  } catch { /* fall through */ }
  removeProjectLocal(id);
}

/** Toggle hidden status */
export async function updateProjectHidden(id: string, hidden: boolean): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'PATCH',
      headers: apiHeaders(),
      body: JSON.stringify({ id, hidden }),
    });
    if (res.ok) return;
  } catch { /* fall through */ }
  toggleHiddenLocal(id, hidden);
}

/** Get single project */
export async function getProjectById(id: string): Promise<ProjectData | undefined> {
  const projects = await getAllProjects();
  return projects.find((p) => p.id === id);
}

export async function initializeProjectsDB(): Promise<void> {}

// ── Local fallback (IndexedDB + localStorage) ──

const DB_NAME = 'ozobek_usmonqulov_portfolio_db';
const STORE_NAME = 'projects';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getProjectsFromLocal(): ProjectData[] {
  try {
    const raw = localStorage.getItem('ozobek_usmonqulov_portfolio_projects');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function syncToLocal(project: ProjectData): void {
  const projects = getProjectsFromLocal();
  const i = projects.findIndex((p) => p.id === project.id);
  if (i >= 0) projects[i] = project;
  else projects.unshift(project);
  localStorage.setItem('ozobek_usmonqulov_portfolio_projects', JSON.stringify(projects));
}

async function saveProjectLocal(project: ProjectData): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(project);
      tx.oncomplete = () => { syncToLocal(project); resolve(); };
      tx.onerror = () => reject(tx.error);
    });
  } catch { syncToLocal(project); }
}

async function removeProjectLocal(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => {
        const projects = getProjectsFromLocal().filter((p) => p.id !== id);
        localStorage.setItem('ozobek_usmonqulov_portfolio_projects', JSON.stringify(projects));
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    const projects = getProjectsFromLocal().filter((p) => p.id !== id);
    localStorage.setItem('ozobek_usmonqulov_portfolio_projects', JSON.stringify(projects));
  }
}

async function toggleHiddenLocal(id: string, hidden: boolean): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(id);
    return new Promise((resolve) => {
      request.onsuccess = async () => {
        const project = request.result as ProjectData | undefined;
        if (project) await saveProjectLocal({ ...project, hidden });
        resolve();
      };
      request.onerror = () => resolve();
    });
  } catch {
    const projects = getProjectsFromLocal();
    const p = projects.find((p) => p.id === id);
    if (p) { p.hidden = hidden; localStorage.setItem('ozobek_usmonqulov_portfolio_projects', JSON.stringify(projects)); }
  }
}

