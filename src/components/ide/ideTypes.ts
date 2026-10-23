export interface IDEFile {
  id: string;
  name: string;
  path: string; // e.g. "/index.html" or "/src/App.tsx"
  content: string;
  language: string; // e.g. "html", "css", "javascript", "typescript", "json", "python", "markdown"
  isDirty?: boolean;
  isFolder?: boolean;
  parentPath?: string;
  size?: number;
  updatedAt?: number;
}

export interface IDEProject {
  id: string;
  name: string;
  description?: string;
  template: 'web' | 'react' | 'python' | 'markdown' | 'blank';
  files: Record<string, IDEFile>; // path -> file
  activeFilePath: string;
  openTabs: string[]; // array of paths
  createdAt: number;
  updatedAt: number;
  isFileSystemBacked?: boolean;
  fileSystemDirectoryName?: string;
}

export type IDEActivityTab = 'explorer' | 'search' | 'git' | 'copilot' | 'trench' | 'preview' | 'settings';
export type BottomPanelTab = 'terminal' | 'problems' | 'output' | 'preview';

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  proposedDiff?: {
    path: string;
    oldCode: string;
    newCode: string;
    description: string;
    applied?: boolean;
    rejected?: boolean;
  };
  errorSnippet?: string;
}

export interface ConsoleLogEntry {
  id: string;
  type: 'log' | 'info' | 'warn' | 'error' | 'system';
  message: string;
  timestamp: number;
  source?: string;
}

export interface ProblemItem {
  id: string;
  file: string;
  line: number;
  col: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface GitCommit {
  id: string;
  message: string;
  timestamp: number;
  author: string;
  changedFiles: string[];
}

export interface EditorSettings {
  fontSize: number;
  tabSize: number;
  wordWrap: 'on' | 'off';
  minimap: boolean;
  lineNumbers: 'on' | 'off';
  autoSave: boolean;
  autoSaveDelay: number;
  fontFamily: string;
  theme: 'vs-dark' | 'vs-light';
}

export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: 'on',
  minimap: true,
  lineNumbers: 'on',
  autoSave: false,
  autoSaveDelay: 1000,
  fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
  theme: 'vs-dark',
};

export function detectLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'html':
    case 'htm':
      return 'html';
    case 'css':
      return 'css';
    case 'scss':
    case 'sass':
      return 'scss';
    case 'js':
    case 'mjs':
    case 'cjs':
      return 'javascript';
    case 'jsx':
      return 'javascript';
    case 'ts':
      return 'typescript';
    case 'tsx':
      return 'typescript';
    case 'json':
      return 'json';
    case 'py':
      return 'python';
    case 'md':
    case 'markdown':
      return 'markdown';
    case 'sql':
      return 'sql';
    case 'sh':
    case 'bash':
      return 'shell';
    case 'yml':
    case 'yaml':
      return 'yaml';
    case 'xml':
    case 'svg':
      return 'xml';
    case 'txt':
    default:
      return 'plaintext';
  }
}
