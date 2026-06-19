/** * IndexedDB wrapper for Ozobek Usmonqulov Portfolio projects. * Provides persistent storage for project data including images, * with automatic fallback to localStorage if IndexedDB is unavailable. */
const DB_NAME = 'ozobek_usmonqulov_portfolio_db';
const DB_VERSION = 1;
const STORE_NAME = 'projects';
export interface ProjectData {  id: string;  name: string;  description: string;  image: string;       // base64 data URL or external URL
  languages: Array<{ id: string; name: string }>;  hideCode: boolean;  repoFullName: string;  createdAt?: string;  hidden?: boolean;    
// hidden from public view
}
/** * Initialize database and ensure it's ready (no seed data). */
export async function initializeProjectsDB(): Promise<void> {
  const INIT_FLAG = 'ozobek_usmonqulov_portfolio_initialized';
  localStorage.setItem(INIT_FLAG, '1');
}
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);    request.onupgradeneeded = () => {
      const db = request.result;      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });        store.createIndex('createdAt', 'createdAt', { unique: false });      }    };    request.onsuccess = () => resolve(request.result);    request.onerror = () => reject(request.error);  });}/** * Get all projects from the database, sorted by createdAt (newest first). */
export async function getAllProjects(): Promise<ProjectData[]> {
  try {
    const db = await openDB();    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');      const store = tx.objectStore(STORE_NAME);      const request = store.getAll();      request.onsuccess = () => {
        const projects = request.result as ProjectData[];        // Sort newest first
projects.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;          return dateB - dateA;
});        resolve(projects);      };      request.onerror = () => reject(request.error);    });  } catch {    // Fallback to localStorage
return getProjectsFromLocalStorage();
}}/** * Add a new project to the database. */
export async function addProject(project: ProjectData): Promise<void> {
  try {
    const db = await openDB();    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');      const store = tx.objectStore(STORE_NAME);      store.put(project);      tx.oncomplete = () => {        syncProjectToLocalStorage(project);        resolve();      };      tx.onerror = () => reject(tx.error);    });  } catch {    syncProjectToLocalStorage(project);
}}function syncProjectToLocalStorage(project: ProjectData): void {
  const projects = getProjectsFromLocalStorage();  const existing = projects.findIndex((p) => p.id === project.id);  if (existing >= 0) {    projects[existing] = project;  } else {    projects.unshift(project);  }  localStorage.setItem('ozobek_usmonqulov_portfolio_projects', JSON.stringify(projects));
}/** * Remove a project from the database. */
export async function deleteProject(id: string): Promise<void> {
  try {
    const db = await openDB();    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');      const store = tx.objectStore(STORE_NAME);      store.delete(id);      tx.oncomplete = () => {        syncDeleteFromLocalStorage(id);        resolve();      };      tx.onerror = () => reject(tx.error);    });  } catch {    syncDeleteFromLocalStorage(id);
}}function syncDeleteFromLocalStorage(id: string): void {
  const projects = getProjectsFromLocalStorage();  const filtered = projects.filter((p) => p.id !== id);  localStorage.setItem('ozobek_usmonqulov_portfolio_projects', JSON.stringify(filtered));
}/** * Get a single project by its ID. */
export async function getProjectById(id: string): Promise<ProjectData | undefined> {
  const projects = await getAllProjects();  return projects.find((p) => p.id === id);}/** * Toggle the hidden field of a project. */
export async function updateProjectHidden(id: string, hidden: boolean): Promise<void> {
  try {
    const db = await openDB();    const tx = db.transaction(STORE_NAME, 'readonly');    const store = tx.objectStore(STORE_NAME);    const request = store.get(id);    return new Promise((resolve, reject) => {      request.onsuccess = async () => {
        const project = request.result as ProjectData | undefined;        if (project) {          project.hidden = hidden;          await addProject(project);        };
        resolve();      };      request.onerror = () => reject(request.error);    });  } catch {    // Fallback to localStorage
const projects = getProjectsFromLocalStorage();    const project = projects.find((p) => p.id === id);    if (project) {      project.hidden = hidden;      localStorage.setItem('ozobek_usmonqulov_portfolio_projects', JSON.stringify(projects));
}  }  }/** * Helper to read from localStorage as fallback. */function getProjectsFromLocalStorage(): ProjectData[] {
  try {
    const raw = localStorage.getItem('ozobek_usmonqulov_portfolio_projects');    return raw ? JSON.parse(raw) : [];  } catch {
    return [];  }}
