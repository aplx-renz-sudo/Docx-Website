import JSZip from 'jszip';
import type { IDEProject, IDEFile, EditorSettings } from './ideTypes';
import { DEFAULT_EDITOR_SETTINGS, detectLanguageFromPath } from './ideTypes';
import { createStarterWebProject, createStarterPythonProject } from './defaultProjects';

const PROJECTS_STORAGE_KEY = 'viledocx:ide_projects_v2';
const ACTIVE_PROJECT_KEY = 'viledocx:ide_active_project_id_v2';
const SETTINGS_STORAGE_KEY = 'viledocx:ide_settings_v2';
const GIT_HISTORY_KEY = 'viledocx:ide_git_history_v2';

export function loadIDEProjects(): IDEProject[] {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as IDEProject[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load IDE projects from localStorage:', err);
  }

  // Return initial starter projects
  const initial = [createStarterWebProject(), createStarterPythonProject()];
  saveIDEProjects(initial);
  return initial;
}

export function saveIDEProjects(projects: IDEProject[]): void {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save IDE projects to localStorage:', err);
  }
}

export function loadActiveProjectId(availableProjects: IDEProject[]): string {
  try {
    const stored = localStorage.getItem(ACTIVE_PROJECT_KEY);
    if (stored && availableProjects.some(p => p.id === stored)) {
      return stored;
    }
  } catch {}
  return availableProjects[0]?.id || '';
}

export function saveActiveProjectId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_PROJECT_KEY, id);
  } catch {}
}

export function loadEditorSettings(): EditorSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_EDITOR_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_EDITOR_SETTINGS;
}

export function saveEditorSettings(settings: EditorSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

/**
 * Export project as a zip archive
 */
export async function exportProjectAsZip(project: IDEProject): Promise<Blob> {
  const zip = new JSZip();

  for (const [filePath, file] of Object.entries(project.files)) {
    if (file.isFolder) continue;
    // Strip leading slash for zip structure
    const relativePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    // Prevent zip path traversal
    const safePath = relativePath.replace(/(\.\.\/|\.\.\\)/g, '');
    if (safePath) {
      zip.file(safePath, file.content);
    }
  }

  return await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

/**
 * Import project from a zip archive
 */
export async function importProjectFromZip(file: File): Promise<IDEProject> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);

  const files: Record<string, IDEFile> = {};
  const projectName = file.name.replace(/\.[^/.]+$/, '') || 'Imported Project';
  const now = Date.now();

  let firstFilePath = '';

  const entries = Object.keys(loadedZip.files);
  for (const rawPath of entries) {
    const zipEntry = loadedZip.files[rawPath];
    if (zipEntry.dir) continue;

    // Sanitize path against directory traversal
    const cleanPath = '/' + rawPath.replace(/^(\.\.\/|\.\.\\)+/, '').replace(/^\//, '');
    if (cleanPath.includes('__MACOSX') || cleanPath.includes('.DS_Store')) continue;

    const content = await zipEntry.async('string');
    const name = cleanPath.split('/').pop() || 'file';
    const lang = detectLanguageFromPath(cleanPath);

    files[cleanPath] = {
      id: 'file_' + Math.random().toString(36).substring(2, 9),
      name,
      path: cleanPath,
      content,
      language: lang,
      isDirty: false,
      updatedAt: now,
    };

    if (!firstFilePath) {
      firstFilePath = cleanPath;
    }
  }

  // Fallback if empty
  if (Object.keys(files).length === 0) {
    files['/index.html'] = {
      id: 'file_' + Math.random().toString(36).substring(2, 9),
      name: 'index.html',
      path: '/index.html',
      content: '<!DOCTYPE html>\n<html>\n<body>\n  <h1>Imported Project</h1>\n</body>\n</html>',
      language: 'html',
      isDirty: false,
      updatedAt: now,
    };
    firstFilePath = '/index.html';
  }

  return {
    id: 'proj_' + Math.random().toString(36).substring(2, 9),
    name: projectName,
    template: 'blank',
    files,
    activeFilePath: firstFilePath,
    openTabs: [firstFilePath],
    createdAt: now,
    updatedAt: now,
  };
}

export const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.svn',
  '.hg',
  '.vscode',
  '.idea',
  'dist',
  'build',
  'out',
  '.next',
  '.turbo',
  '.cache',
  '__pycache__',
  '.pytest_cache',
  '.DS_Store',
  '__MACOSX',
]);

export const BINARY_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'pdf', 'zip', 'tar', 'gz',
  'mp4', 'webm', 'mp3', 'wav', 'exe', 'bin', 'dll', 'so', 'dylib', 'woff',
  'woff2', 'ttf', 'eot', 'otf', 'iso'
]);

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && typeof (window as any).showDirectoryPicker === 'function';
}

/**
 * Import project from HTML5 directory file input (webkitdirectory)
 */
export async function importProjectFromFolderFiles(fileList: FileList | File[]): Promise<IDEProject> {
  const filesArray = Array.from(fileList);
  if (filesArray.length === 0) {
    throw new Error('No files selected in folder.');
  }

  const files: Record<string, IDEFile> = {};
  const now = Date.now();
  let firstFilePath = '';
  let detectedProjectName = '';

  for (const file of filesArray) {
    const rawPath = (file as any).webkitRelativePath || file.name;
    const parts = rawPath.split('/').filter(Boolean);

    // Skip ignored directories
    if (parts.some((part: string) => IGNORED_DIRS.has(part))) {
      continue;
    }

    if (!detectedProjectName && parts.length > 1) {
      detectedProjectName = parts[0];
    }

    const relativeParts = parts.length > 1 ? parts.slice(1) : parts;
    const cleanPath = '/' + relativeParts.join('/');

    const ext = cleanPath.split('.').pop()?.toLowerCase() || '';
    if (BINARY_EXTENSIONS.has(ext)) {
      files[cleanPath] = {
        id: 'file_' + Math.random().toString(36).substring(2, 9),
        name: relativeParts[relativeParts.length - 1],
        path: cleanPath,
        content: `/* Binary asset: ${file.name} (${(file.size / 1024).toFixed(1)} KB) */`,
        language: detectLanguageFromPath(cleanPath),
        isDirty: false,
        size: file.size,
        updatedAt: now,
      };
      continue;
    }

    if (file.size > 4 * 1024 * 1024) {
      continue;
    }

    try {
      const content = await file.text();
      files[cleanPath] = {
        id: 'file_' + Math.random().toString(36).substring(2, 9),
        name: relativeParts[relativeParts.length - 1],
        path: cleanPath,
        content,
        language: detectLanguageFromPath(cleanPath),
        isDirty: false,
        size: file.size,
        updatedAt: now,
      };

      if (!firstFilePath && (cleanPath.endsWith('.html') || cleanPath.endsWith('.js') || cleanPath.endsWith('.ts') || cleanPath.endsWith('.py'))) {
        firstFilePath = cleanPath;
      }
    } catch (err) {
      console.warn(`Could not read file: ${cleanPath}`, err);
    }
  }

  if (Object.keys(files).length === 0) {
    throw new Error('No readable code or text files found in the selected folder.');
  }

  if (!firstFilePath) {
    firstFilePath = Object.keys(files)[0];
  }

  const projectName = detectedProjectName || 'Imported Local Folder';

  return {
    id: 'proj_' + Math.random().toString(36).substring(2, 9),
    name: projectName,
    template: 'blank',
    files,
    activeFilePath: firstFilePath,
    openTabs: [firstFilePath],
    createdAt: now,
    updatedAt: now,
    isFileSystemBacked: true,
    fileSystemDirectoryName: projectName,
  };
}

/**
 * Import project using File System Access API (window.showDirectoryPicker)
 */
export async function importProjectFromDirectoryPicker(): Promise<IDEProject | null> {
  if (!isFileSystemAccessSupported()) {
    throw new Error('File System Access API is not supported in this browser. Please use the standard folder selector.');
  }

  let dirHandle: any;
  try {
    dirHandle = await (window as any).showDirectoryPicker({
      id: 'docx_ide_local_folder',
      mode: 'read',
    });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return null;
    }
    throw err;
  }

  if (!dirHandle) return null;

  const files: Record<string, IDEFile> = {};
  const now = Date.now();
  let firstFilePath = '';

  async function scanDirectory(handle: any, currentPath: string) {
    for await (const entry of handle.values()) {
      if (IGNORED_DIRS.has(entry.name)) continue;

      const fullPath = `${currentPath}/${entry.name}`;
      if (entry.kind === 'directory') {
        await scanDirectory(entry, fullPath);
      } else if (entry.kind === 'file') {
        try {
          const file = await entry.getFile();
          const ext = entry.name.split('.').pop()?.toLowerCase() || '';

          if (BINARY_EXTENSIONS.has(ext)) {
            files[fullPath] = {
              id: 'file_' + Math.random().toString(36).substring(2, 9),
              name: entry.name,
              path: fullPath,
              content: `/* Binary asset: ${entry.name} (${(file.size / 1024).toFixed(1)} KB) */`,
              language: detectLanguageFromPath(fullPath),
              isDirty: false,
              size: file.size,
              updatedAt: now,
            };
            continue;
          }

          if (file.size > 4 * 1024 * 1024) continue;

          const content = await file.text();
          files[fullPath] = {
            id: 'file_' + Math.random().toString(36).substring(2, 9),
            name: entry.name,
            path: fullPath,
            content,
            language: detectLanguageFromPath(fullPath),
            isDirty: false,
            size: file.size,
            updatedAt: now,
          };

          if (!firstFilePath && (fullPath.endsWith('.html') || fullPath.endsWith('.js') || fullPath.endsWith('.ts') || fullPath.endsWith('.py'))) {
            firstFilePath = fullPath;
          }
        } catch (err) {
          console.warn(`Could not read file from directory handle: ${fullPath}`, err);
        }
      }
    }
  }

  await scanDirectory(dirHandle, '');

  if (Object.keys(files).length === 0) {
    throw new Error('No readable code or text files found in the chosen folder.');
  }

  if (!firstFilePath) {
    firstFilePath = Object.keys(files)[0];
  }

  return {
    id: 'proj_' + Math.random().toString(36).substring(2, 9),
    name: dirHandle.name || 'Local Project',
    template: 'blank',
    files,
    activeFilePath: firstFilePath,
    openTabs: [firstFilePath],
    createdAt: now,
    updatedAt: now,
    isFileSystemBacked: true,
    fileSystemDirectoryName: dirHandle.name,
  };
}

/**
 * Import project from Drag & Drop FileSystemEntry items
 */
export async function importProjectFromDropEntries(items: DataTransferItemList): Promise<IDEProject | null> {
  const entries: any[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
    if (entry) {
      entries.push(entry);
    }
  }

  if (entries.length === 0) return null;

  const files: Record<string, IDEFile> = {};
  const now = Date.now();
  let firstFilePath = '';
  let rootName = '';

  function readFileEntry(fileEntry: any, fullPath: string): Promise<void> {
    return new Promise((resolve) => {
      fileEntry.file(async (file: File) => {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        if (BINARY_EXTENSIONS.has(ext)) {
          files[fullPath] = {
            id: 'file_' + Math.random().toString(36).substring(2, 9),
            name: file.name,
            path: fullPath,
            content: `/* Binary asset: ${file.name} (${(file.size / 1024).toFixed(1)} KB) */`,
            language: detectLanguageFromPath(fullPath),
            isDirty: false,
            size: file.size,
            updatedAt: now,
          };
          resolve();
          return;
        }

        if (file.size > 4 * 1024 * 1024) {
          resolve();
          return;
        }

        try {
          const content = await file.text();
          files[fullPath] = {
            id: 'file_' + Math.random().toString(36).substring(2, 9),
            name: file.name,
            path: fullPath,
            content,
            language: detectLanguageFromPath(fullPath),
            isDirty: false,
            size: file.size,
            updatedAt: now,
          };
          if (!firstFilePath && (fullPath.endsWith('.html') || fullPath.endsWith('.js') || fullPath.endsWith('.ts') || fullPath.endsWith('.py'))) {
            firstFilePath = fullPath;
          }
        } catch {}
        resolve();
      }, () => resolve());
    });
  }

  function readDirectoryEntry(dirEntry: any, currentPath: string): Promise<void> {
    return new Promise((resolve) => {
      const reader = dirEntry.createReader();
      const readBatch = () => {
        reader.readEntries(async (subEntries: any[]) => {
          if (subEntries.length === 0) {
            resolve();
            return;
          }

          for (const sub of subEntries) {
            if (IGNORED_DIRS.has(sub.name)) continue;
            const subPath = `${currentPath}/${sub.name}`;
            if (sub.isDirectory) {
              await readDirectoryEntry(sub, subPath);
            } else if (sub.isFile) {
              await readFileEntry(sub, subPath);
            }
          }

          readBatch();
        }, () => resolve());
      };
      readBatch();
    });
  }

  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    if (!rootName) rootName = entry.name;

    if (entry.isDirectory) {
      await readDirectoryEntry(entry, '');
    } else if (entry.isFile) {
      await readFileEntry(entry, `/${entry.name}`);
    }
  }

  if (Object.keys(files).length === 0) return null;

  if (!firstFilePath) {
    firstFilePath = Object.keys(files)[0];
  }

  return {
    id: 'proj_' + Math.random().toString(36).substring(2, 9),
    name: rootName || 'Imported Folder',
    template: 'blank',
    files,
    activeFilePath: firstFilePath,
    openTabs: [firstFilePath],
    createdAt: now,
    updatedAt: now,
    isFileSystemBacked: true,
    fileSystemDirectoryName: rootName,
  };
}
