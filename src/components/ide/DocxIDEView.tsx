import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Editor, { DiffEditor } from '@monaco-editor/react';
import {
  FileCode,
  Folder,
  FolderPlus,
  FilePlus,
  Play,
  RotateCcw,
  Save,
  Download,
  Upload,
  Search,
  Settings as SettingsIcon,
  GitBranch,
  Sparkles,
  Layers,
  Terminal as TerminalIcon,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronRight,
  ChevronDown,
  Trash2,
  Edit2,
  ExternalLink,
  Code2,
  ArrowLeft,
  Maximize2,
  Minimize2,
  HelpCircle,
  Eye,
  PanelBottom,
  Plus,
  Menu,
  FolderUp,
  FolderInput,
} from 'lucide-react';

import type {
  IDEProject,
  IDEFile,
  IDEActivityTab,
  BottomPanelTab,
  ConsoleLogEntry,
  ProblemItem,
  GitCommit,
  EditorSettings,
} from './ideTypes';
import {
  DEFAULT_EDITOR_SETTINGS,
  detectLanguageFromPath,
} from './ideTypes';
import {
  loadIDEProjects,
  saveIDEProjects,
  loadActiveProjectId,
  saveActiveProjectId,
  loadEditorSettings,
  saveEditorSettings,
  exportProjectAsZip,
  importProjectFromZip,
  importProjectFromFolderFiles,
  importProjectFromDirectoryPicker,
  importProjectFromDropEntries,
  isFileSystemAccessSupported,
} from './ideStorage';
import { createStarterWebProject, createStarterPythonProject } from './defaultProjects';
import { WebPreviewIframe } from './WebPreviewIframe';
import { CopilotSidebar } from './CopilotSidebar';
import { CommandPalette, type CommandItem } from './CommandPalette';
import { QuickFileOpen } from './QuickFileOpen';
import { SourceControlPanel } from './SourceControlPanel';
import { TrenchModal } from './TrenchModal';
import type { ProviderConfig } from '../../lib/credential';
import type { ThemeMode } from '../../types';

interface DocxIDEViewProps {
  providerConfig: ProviderConfig;
  onLeave: () => void;
  onOpenSettings: (tab?: string) => void;
  themeMode?: ThemeMode;
}

export const DocxIDEView: React.FC<DocxIDEViewProps> = ({
  providerConfig,
  onLeave,
  onOpenSettings,
  themeMode = 'halloween',
}) => {
  // Projects state
  const [projects, setProjects] = useState<IDEProject[]>(() => loadIDEProjects());
  const [activeProjectId, setActiveProjectId] = useState<string>(() =>
    loadActiveProjectId(projects)
  );

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === activeProjectId) || projects[0] || createStarterWebProject();
  }, [projects, activeProjectId]);

  // Editor settings
  const [editorSettings, setEditorSettings] = useState<EditorSettings>(() => loadEditorSettings());

  // UI Panels state
  const [activeActivityTab, setActiveActivityTab] = useState<IDEActivityTab>('explorer');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBottomOpen, setIsBottomOpen] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<BottomPanelTab>('terminal');
  const [isRightCopilotOpen, setIsRightCopilotOpen] = useState(false);
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(false);

  // Modals state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuickOpenOpen, setIsQuickOpenOpen] = useState(false);
  const [isTrenchModalOpen, setIsTrenchModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  // Diff inspection state
  const [diffView, setDiffView] = useState<{
    filePath: string;
    oldCode: string;
    newCode: string;
  } | null>(null);

  // Search in files
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ path: string; line: number; text: string }[]>([]);

  // Logs & Console
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLogEntry[]>([
    {
      id: 'init-1',
      type: 'system',
      message: 'Docx-IDE environment initialized. Web preview & JS execution sandbox ready.',
      timestamp: Date.now(),
    },
  ]);
  const [terminalInput, setTerminalInput] = useState('');

  // Git commits
  const [gitCommits, setGitCommits] = useState<GitCommit[]>([
    {
      id: 'init-commit',
      message: 'Initial project boilerplate',
      timestamp: Date.now() - 3600000,
      author: 'Docx-IDE User',
      changedFiles: Object.keys(activeProject.files),
    },
  ]);

  // Editor cursor & status
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [editorNotice, setEditorNotice] = useState<string | null>(null);

  // File creation & renaming inline inputs
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const dragCounterRef = useRef(0);

  // Auto-save project changes to localStorage
  useEffect(() => {
    saveIDEProjects(projects);
  }, [projects]);

  useEffect(() => {
    saveActiveProjectId(activeProjectId);
  }, [activeProjectId]);

  useEffect(() => {
    saveEditorSettings(editorSettings);
  }, [editorSettings]);

  // Active file helper
  const activeFile = useMemo(() => {
    if (!activeProject.activeFilePath) return undefined;
    return activeProject.files[activeProject.activeFilePath];
  }, [activeProject]);

  // Update active file content
  const handleContentChange = useCallback((newContent: string | undefined) => {
    if (newContent === undefined || !activeProject.activeFilePath) return;

    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== activeProject.id) return proj;
        const currentFile = proj.files[proj.activeFilePath];
        if (!currentFile || currentFile.content === newContent) return proj;

        return {
          ...proj,
          updatedAt: Date.now(),
          files: {
            ...proj.files,
            [proj.activeFilePath]: {
              ...currentFile,
              content: newContent,
              isDirty: true,
              updatedAt: Date.now(),
            },
          },
        };
      })
    );
  }, [activeProject.id, activeProject.activeFilePath]);

  // Save current active file
  const handleSaveActiveFile = useCallback(() => {
    if (!activeProject.activeFilePath) return;

    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== activeProject.id) return proj;
        const currentFile = proj.files[proj.activeFilePath];
        if (!currentFile) return proj;

        return {
          ...proj,
          files: {
            ...proj.files,
            [proj.activeFilePath]: {
              ...currentFile,
              isDirty: false,
              updatedAt: Date.now(),
            },
          },
        };
      })
    );

    setEditorNotice(`Saved ${activeProject.activeFilePath}`);
    setTimeout(() => setEditorNotice(null), 2000);
  }, [activeProject.id, activeProject.activeFilePath]);

  // Save all open files
  const handleSaveAllFiles = useCallback(() => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== activeProject.id) return proj;
        const updatedFiles = { ...proj.files };
        for (const [k, v] of Object.entries(updatedFiles)) {
          if (v.isDirty) {
            updatedFiles[k] = { ...v, isDirty: false, updatedAt: Date.now() };
          }
        }
        return {
          ...proj,
          files: updatedFiles,
        };
      })
    );
    setEditorNotice('All files saved');
    setTimeout(() => setEditorNotice(null), 2000);
  }, [activeProject.id]);

  // Open file in editor
  const handleOpenFile = (path: string) => {
    setDiffView(null);
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== activeProject.id) return proj;
        const openTabs = proj.openTabs.includes(path) ? proj.openTabs : [...proj.openTabs, path];
        return {
          ...proj,
          activeFilePath: path,
          openTabs,
        };
      })
    );
  };

  // Close tab
  const handleCloseTab = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== activeProject.id) return proj;
        const newTabs = proj.openTabs.filter((t) => t !== path);
        let nextActive = proj.activeFilePath;
        if (proj.activeFilePath === path) {
          nextActive = newTabs[newTabs.length - 1] || '';
        }
        return {
          ...proj,
          openTabs: newTabs,
          activeFilePath: nextActive,
        };
      })
    );
  };

  // Create new file
  const handleCreateFileSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newFileName.trim();
    if (!trimmed) {
      setIsCreatingFile(false);
      return;
    }

    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    const lang = detectLanguageFromPath(cleanPath);

    const newFile: IDEFile = {
      id: 'file_' + Math.random().toString(36).substring(2, 9),
      name: cleanPath.split('/').pop() || 'file',
      path: cleanPath,
      content: '',
      language: lang,
      isDirty: false,
      updatedAt: Date.now(),
    };

    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== activeProject.id) return proj;
        return {
          ...proj,
          files: {
            ...proj.files,
            [cleanPath]: newFile,
          },
          openTabs: [...proj.openTabs, cleanPath],
          activeFilePath: cleanPath,
        };
      })
    );

    setNewFileName('');
    setIsCreatingFile(false);
  };

  // Rename file
  const handleRenameSubmit = (oldPath: string) => {
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === oldPath) {
      setRenamingPath(null);
      return;
    }

    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    const lang = detectLanguageFromPath(cleanPath);

    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== activeProject.id) return proj;
        const target = proj.files[oldPath];
        if (!target) return proj;

        const updatedFiles = { ...proj.files };
        delete updatedFiles[oldPath];
        updatedFiles[cleanPath] = {
          ...target,
          name: cleanPath.split('/').pop() || 'file',
          path: cleanPath,
          language: lang,
          updatedAt: Date.now(),
        };

        const updatedTabs = proj.openTabs.map((t) => (t === oldPath ? cleanPath : t));
        const updatedActive = proj.activeFilePath === oldPath ? cleanPath : proj.activeFilePath;

        return {
          ...proj,
          files: updatedFiles,
          openTabs: updatedTabs,
          activeFilePath: updatedActive,
        };
      })
    );

    setRenamingPath(null);
  };

  // Delete file
  const handleDeleteFile = (path: string) => {
    if (Object.keys(activeProject.files).length <= 1) {
      alert('Cannot delete the only file in the project.');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${path}?`)) return;

    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== activeProject.id) return proj;
        const updatedFiles = { ...proj.files };
        delete updatedFiles[path];

        const updatedTabs = proj.openTabs.filter((t) => t !== path);
        const updatedActive =
          proj.activeFilePath === path ? updatedTabs[0] || Object.keys(updatedFiles)[0] : proj.activeFilePath;

        return {
          ...proj,
          files: updatedFiles,
          openTabs: updatedTabs,
          activeFilePath: updatedActive,
        };
      })
    );
  };

  // Search across files
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const q = searchQuery.toLowerCase();
    const results: { path: string; line: number; text: string }[] = [];

    for (const [path, file] of Object.entries(activeProject.files)) {
      if (file.isFolder) continue;
      const lines = file.content.split('\n');
      lines.forEach((lineText, idx) => {
        if (lineText.toLowerCase().includes(q)) {
          results.push({
            path,
            line: idx + 1,
            text: lineText.trim(),
          });
        }
      });
    }

    setSearchResults(results.slice(0, 100));
  }, [searchQuery, activeProject.files]);

  // Zip Export
  const handleExportZip = async () => {
    try {
      const blob = await exportProjectAsZip(activeProject);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeProject.name.toLowerCase().replace(/\s+/g, '-')}-project.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setEditorNotice('Project exported as ZIP');
      setTimeout(() => setEditorNotice(null), 2500);
    } catch (err) {
      console.error('Failed to export ZIP:', err);
      alert('Failed to export project archive.');
    }
  };

  // Zip Import
  const handleImportZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importProjectFromZip(file);
      setProjects((prev) => [imported, ...prev]);
      setActiveProjectId(imported.id);
      setEditorNotice(`Imported project "${imported.name}"`);
      setTimeout(() => setEditorNotice(null), 3000);
    } catch (err) {
      console.error('Failed to import ZIP:', err);
      alert('Failed to parse ZIP archive.');
    } finally {
      if (zipInputRef.current) zipInputRef.current.value = '';
    }
  };

  // Local Folder Import via Directory Picker (File System Access API)
  const handleImportViaDirectoryPicker = async () => {
    try {
      const imported = await importProjectFromDirectoryPicker();
      if (!imported) return; // User cancelled
      setProjects((prev) => [imported, ...prev]);
      setActiveProjectId(imported.id);
      setEditorNotice(`Opened local folder "${imported.name}" (${Object.keys(imported.files).length} files)`);
      setTimeout(() => setEditorNotice(null), 3000);
    } catch (err: any) {
      console.warn('Directory picker failed or not supported, falling back to browser folder input:', err);
      folderInputRef.current?.click();
    }
  };

  // Local Folder Import via File Input (webkitdirectory)
  const handleImportFolderInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const imported = await importProjectFromFolderFiles(files);
      setProjects((prev) => [imported, ...prev]);
      setActiveProjectId(imported.id);
      setEditorNotice(`Imported local folder "${imported.name}" (${Object.keys(imported.files).length} files)`);
      setTimeout(() => setEditorNotice(null), 3000);
    } catch (err: any) {
      console.error('Failed to import local folder:', err);
      alert(err?.message || 'Failed to import local folder.');
    } finally {
      if (folderInputRef.current) folderInputRef.current.value = '';
    }
  };

  // Smart folder open: tries native picker first, otherwise opens browser folder picker
  const handleSmartOpenFolder = () => {
    if (isFileSystemAccessSupported()) {
      handleImportViaDirectoryPicker();
    } else {
      folderInputRef.current?.click();
    }
  };

  // Drag and Drop folder support
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      setIsDraggingOver(false);
      dragCounterRef.current = 0;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    dragCounterRef.current = 0;

    // 1. Try directory/files from DataTransfer items
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      try {
        const imported = await importProjectFromDropEntries(e.dataTransfer.items);
        if (imported) {
          setProjects((prev) => [imported, ...prev]);
          setActiveProjectId(imported.id);
          setEditorNotice(`Imported dropped folder "${imported.name}" (${Object.keys(imported.files).length} files)`);
          setTimeout(() => setEditorNotice(null), 3000);
          return;
        }
      } catch (err: any) {
        console.warn('Failed to parse dropped directory items:', err);
      }
    }

    // 2. Check for ZIP file or individual files
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const zip = files.find((f) => f.name.endsWith('.zip'));
      if (zip) {
        try {
          const imported = await importProjectFromZip(zip);
          setProjects((prev) => [imported, ...prev]);
          setActiveProjectId(imported.id);
          setEditorNotice(`Imported project "${imported.name}"`);
          setTimeout(() => setEditorNotice(null), 3000);
          return;
        } catch (err) {
          alert('Failed to parse dropped ZIP file.');
          return;
        }
      }

      try {
        const imported = await importProjectFromFolderFiles(files);
        setProjects((prev) => [imported, ...prev]);
        setActiveProjectId(imported.id);
        setEditorNotice(`Imported ${Object.keys(imported.files).length} dropped files`);
        setTimeout(() => setEditorNotice(null), 3000);
      } catch (err: any) {
        console.warn('Could not import dropped files as project:', err);
      }
    }
  };

  // Local Git commit
  const handleGitCommit = (message: string, filesToCommit: string[]) => {
    const newCommit: GitCommit = {
      id: 'commit_' + Math.random().toString(36).substring(2, 10),
      message,
      timestamp: Date.now(),
      author: 'Docx-IDE Developer',
      changedFiles: filesToCommit,
    };

    setGitCommits((prev) => [newCommit, ...prev]);

    // Mark committed files clean
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== activeProject.id) return proj;
        const updatedFiles = { ...proj.files };
        for (const p of filesToCommit) {
          if (updatedFiles[p]) {
            updatedFiles[p] = { ...updatedFiles[p], isDirty: false };
          }
        }
        return { ...proj, files: updatedFiles };
      })
    );

    setEditorNotice(`Committed: "${message}"`);
    setTimeout(() => setEditorNotice(null), 2500);
  };

  // Apply proposed diff / agent modification
  const handleApplyProposedDiff = (filePath: string, newContent: string) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== activeProject.id) return proj;
        const target = proj.files[filePath] || {
          id: 'file_' + Math.random().toString(36).substring(2, 9),
          name: filePath.split('/').pop() || 'file',
          path: filePath,
          content: '',
          language: detectLanguageFromPath(filePath),
          isDirty: true,
          updatedAt: Date.now(),
        };

        return {
          ...proj,
          files: {
            ...proj.files,
            [filePath]: {
              ...target,
              content: newContent,
              isDirty: true,
              updatedAt: Date.now(),
            },
          },
        };
      })
    );
    setDiffView(null);
    setEditorNotice(`Updated ${filePath}`);
    setTimeout(() => setEditorNotice(null), 2500);
  };

  // Interactive JavaScript Terminal REPL execution
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const input = terminalInput.trim();
    const entryUser: ConsoleLogEntry = {
      id: 'term-' + Date.now(),
      type: 'info',
      message: `> ${input}`,
      timestamp: Date.now(),
    };

    let resultMsg = '';
    let resultType: ConsoleLogEntry['type'] = 'log';

    try {
      // Evaluate within a safe function scope
      // eslint-disable-next-line no-new-func
      const evalFn = new Function(`"use strict"; return (${input});`);
      const res = evalFn();
      resultMsg = typeof res === 'object' ? JSON.stringify(res, null, 2) : String(res);
    } catch (err: any) {
      resultType = 'error';
      resultMsg = err?.message || String(err);
    }

    const entryRes: ConsoleLogEntry = {
      id: 'term-res-' + Date.now(),
      type: resultType,
      message: resultMsg,
      timestamp: Date.now(),
    };

    setConsoleLogs((prev) => [...prev, entryUser, entryRes]);
    setTerminalInput('');
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S / Cmd+S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (e.shiftKey) {
          handleSaveAllFiles();
        } else {
          handleSaveActiveFile();
        }
      }
      // Ctrl+P / Cmd+P
      if ((e.ctrlKey || e.metaKey) && e.key === 'p' && !e.shiftKey) {
        e.preventDefault();
        setIsQuickOpenOpen((prev) => !prev);
      }
      // Ctrl+Shift+P / Cmd+Shift+P
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      // Ctrl+` (Toggle bottom terminal)
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        setIsBottomOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveActiveFile, handleSaveAllFiles]);

  // Command palette actions
  const commandList: CommandItem[] = useMemo(() => {
    return [
      {
        id: 'file-save',
        title: 'Save Active File',
        category: 'File',
        shortcut: 'Ctrl+S',
        icon: <Save size={14} />,
        action: handleSaveActiveFile,
      },
      {
        id: 'file-save-all',
        title: 'Save All Files',
        category: 'File',
        shortcut: 'Ctrl+Shift+S',
        icon: <Save size={14} />,
        action: handleSaveAllFiles,
      },
      {
        id: 'file-new',
        title: 'New File',
        category: 'File',
        icon: <FilePlus size={14} />,
        action: () => {
          setActiveActivityTab('explorer');
          setIsSidebarOpen(true);
          setIsCreatingFile(true);
        },
      },
      {
        id: 'view-quick-open',
        title: 'Quick Open File',
        category: 'View',
        shortcut: 'Ctrl+P',
        icon: <Search size={14} />,
        action: () => setIsQuickOpenOpen(true),
      },
      {
        id: 'view-preview-toggle',
        title: 'Toggle Sandboxed Live Web Preview',
        category: 'View',
        icon: <Play size={14} />,
        action: () => setIsLivePreviewOpen((prev) => !prev),
      },
      {
        id: 'view-copilot',
        title: 'Open Docx-IDE Copilot Assistant',
        category: 'View',
        icon: <Sparkles size={14} />,
        action: () => setIsRightCopilotOpen((prev) => !prev),
      },
      {
        id: 'view-source-control',
        title: 'Open Source Control (Git Snapshots)',
        category: 'View',
        icon: <GitBranch size={14} />,
        action: () => {
          setActiveActivityTab('git');
          setIsSidebarOpen(true);
        },
      },
      {
        id: 'view-trench',
        title: 'Open Trench Handoff Bridge',
        category: 'View',
        icon: <Layers size={14} />,
        action: () => setIsTrenchModalOpen(true),
      },
      {
        id: 'project-export-zip',
        title: 'Export Project as ZIP Archive',
        category: 'Project',
        icon: <Download size={14} />,
        action: handleExportZip,
      },
      {
        id: 'project-import-zip',
        title: 'Import Project from ZIP Archive',
        category: 'Project',
        icon: <Upload size={14} />,
        action: () => zipInputRef.current?.click(),
      },
      {
        id: 'project-open-folder',
        title: 'Open Local Project Folder (Native / Dialog)',
        category: 'Project',
        icon: <FolderInput size={14} />,
        action: handleSmartOpenFolder,
      },
      {
        id: 'project-browse-folder',
        title: 'Upload Local Project Folder (Browser Directory Picker)',
        category: 'Project',
        icon: <FolderUp size={14} />,
        action: () => folderInputRef.current?.click(),
      },
      {
        id: 'editor-wrap-toggle',
        title: 'Toggle Word Wrap',
        category: 'Editor',
        icon: <SettingsIcon size={14} />,
        action: () =>
          setEditorSettings((s) => ({
            ...s,
            wordWrap: s.wordWrap === 'on' ? 'off' : 'on',
          })),
      },
      {
        id: 'editor-minimap-toggle',
        title: 'Toggle Minimap',
        category: 'Editor',
        icon: <SettingsIcon size={14} />,
        action: () =>
          setEditorSettings((s) => ({
            ...s,
            minimap: !s.minimap,
          })),
      },
      {
        id: 'app-dock-leave',
        title: 'Return to VileDocx Dock / Chat',
        category: 'VileDocx',
        icon: <ArrowLeft size={14} />,
        action: onLeave,
      },
      {
        id: 'app-keys',
        title: 'Configure Provider API Credentials',
        category: 'VileDocx',
        icon: <SettingsIcon size={14} />,
        action: () => onOpenSettings('provider'),
      },
    ];
  }, [handleSaveActiveFile, handleSaveAllFiles, handleExportZip, onLeave, onOpenSettings]);

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex flex-col h-screen w-screen bg-[#0d1017] text-zinc-200 select-none overflow-hidden font-sans relative"
    >
      {/* Hidden ZIP file input */}
      <input
        ref={zipInputRef}
        type="file"
        accept=".zip"
        onChange={handleImportZip}
        className="hidden"
      />

      {/* Hidden Folder directory file input */}
      <input
        ref={folderInputRef}
        type="file"
        multiple
        {...({ webkitdirectory: '', directory: '' } as any)}
        onChange={handleImportFolderInput}
        className="hidden"
      />

      {/* Drag & Drop Visual Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 bg-blue-950/85 backdrop-blur-md border-3 border-dashed border-blue-400 flex flex-col items-center justify-center pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/30 border border-blue-400/60 flex items-center justify-center text-blue-200 mb-4 animate-bounce shadow-2xl shadow-blue-500/40">
            <FolderInput size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-1.5">Drop Local Project Folder Here</h2>
          <p className="text-xs text-blue-200 font-mono max-w-md text-center leading-relaxed">
            Release to import your local folders, code files, and assets directly into Docx-IDE.
          </p>
        </div>
      )}

      {/* =========================================================================
          1. TOP APP BAR (Navigation, Project Switcher, Quick Commands, Action Ribbon)
          ========================================================================= */}
      <header className="h-10 bg-[#090c13] border-b border-white/10 flex items-center justify-between px-3 shrink-0 z-20">
        {/* Left: Back to Dock & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onLeave}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
            title="Return to VileDocx Workspace"
          >
            <ArrowLeft size={13} />
            <span>Dock</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-[10px] font-mono font-bold shadow-xs">
              IDE
            </div>
            <span className="text-xs font-bold tracking-tight text-white hidden sm:inline">
              Docx-IDE
            </span>
          </div>

          <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

          {/* Project selector dropdown */}
          <div className="relative flex items-center gap-1.5">
            <select
              value={activeProjectId}
              onChange={(e) => setActiveProjectId(e.target.value)}
              className="bg-[#141824] border border-white/15 text-zinc-200 text-xs rounded-md px-2 py-1 focus:outline-hidden focus:border-blue-500 cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({Object.keys(p.files).length} files)
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
              title="Create New Project"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Center: Command Palette / Quick Open pill */}
        <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-4">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between px-3 py-1 rounded-md bg-[#131722] hover:bg-[#181d2a] border border-white/10 text-xs text-zinc-400 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2 truncate">
              <Search size={13} className="text-zinc-500 group-hover:text-zinc-300" />
              <span className="truncate">Search commands or files...</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[10px] text-zinc-500">
              <kbd className="bg-zinc-800 px-1 rounded border border-white/10">Ctrl+Shift+P</kbd>
            </div>
          </button>
        </div>

        {/* Right: Quick actions toolbar */}
        <div className="flex items-center gap-2">
          {/* Live Web Preview toggle */}
          <button
            onClick={() => setIsLivePreviewOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
              isLivePreviewOpen
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50 shadow-xs'
                : 'bg-white/5 text-zinc-300 hover:text-white border-white/10 hover:bg-white/10'
            }`}
            title="Toggle Live Sandboxed Web Preview"
          >
            <Play size={13} className={isLivePreviewOpen ? 'text-emerald-400' : 'text-zinc-400'} />
            <span className="hidden sm:inline">Preview</span>
          </button>

          {/* AI Copilot toggle */}
          <button
            onClick={() => setIsRightCopilotOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
              isRightCopilotOpen
                ? 'bg-purple-950/70 text-purple-200 border-purple-500/50 shadow-xs'
                : 'bg-white/5 text-zinc-300 hover:text-white border-white/10 hover:bg-white/10'
            }`}
            title="Toggle Docx-IDE Copilot Assistant"
          >
            <Sparkles size={13} className="text-purple-400" />
            <span className="hidden sm:inline">Copilot</span>
          </button>

          {/* Trench Modal Bridge */}
          <button
            onClick={() => setIsTrenchModalOpen(true)}
            className="p-1.5 rounded-md text-zinc-400 hover:text-purple-300 hover:bg-purple-950/40 border border-transparent hover:border-purple-500/30 transition-colors cursor-pointer"
            title="Trench Handoff Bridge"
          >
            <Layers size={15} />
          </button>

          {/* Open Local Folder */}
          <button
            onClick={handleSmartOpenFolder}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/35 text-blue-300 hover:text-white border border-blue-500/40 transition-colors cursor-pointer shadow-xs"
            title="Import Local Folder from Disk (File System Access or Browser Folder Picker)"
          >
            <FolderInput size={13} className="text-blue-400" />
            <span className="hidden sm:inline">Open Folder</span>
          </button>

          {/* Export ZIP */}
          <button
            onClick={handleExportZip}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
            title="Export Project as ZIP"
          >
            <Download size={15} />
          </button>

          {/* Import ZIP */}
          <button
            onClick={() => zipInputRef.current?.click()}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
            title="Import Project from ZIP"
          >
            <Upload size={15} />
          </button>
        </div>
      </header>

      {/* =========================================================================
          2. MAIN WORKSPACE BODY (Activity Bar + Left Sidebar + Editor + Right Copilot)
          ========================================================================= */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Activity Bar (Vertical Left Navigation) */}
        <div className="w-12 bg-[#090c13] border-r border-white/10 flex flex-col items-center justify-between py-2 shrink-0 z-10">
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => {
                if (activeActivityTab === 'explorer' && isSidebarOpen) {
                  setIsSidebarOpen(false);
                } else {
                  setActiveActivityTab('explorer');
                  setIsSidebarOpen(true);
                }
              }}
              className={`p-2.5 rounded-lg transition-colors cursor-pointer relative ${
                activeActivityTab === 'explorer' && isSidebarOpen
                  ? 'text-white bg-white/10'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
              title="Explorer (Files & Folders)"
            >
              <FileCode size={18} />
              {activeActivityTab === 'explorer' && isSidebarOpen && (
                <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-blue-500 rounded-r" />
              )}
            </button>

            <button
              onClick={() => {
                if (activeActivityTab === 'search' && isSidebarOpen) {
                  setIsSidebarOpen(false);
                } else {
                  setActiveActivityTab('search');
                  setIsSidebarOpen(true);
                }
              }}
              className={`p-2.5 rounded-lg transition-colors cursor-pointer relative ${
                activeActivityTab === 'search' && isSidebarOpen
                  ? 'text-white bg-white/10'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
              title="Search in Files"
            >
              <Search size={18} />
              {activeActivityTab === 'search' && isSidebarOpen && (
                <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-blue-500 rounded-r" />
              )}
            </button>

            <button
              onClick={() => {
                if (activeActivityTab === 'git' && isSidebarOpen) {
                  setIsSidebarOpen(false);
                } else {
                  setActiveActivityTab('git');
                  setIsSidebarOpen(true);
                }
              }}
              className={`p-2.5 rounded-lg transition-colors cursor-pointer relative ${
                activeActivityTab === 'git' && isSidebarOpen
                  ? 'text-white bg-white/10'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
              title="Source Control (Local Snapshots)"
            >
              <GitBranch size={18} />
              {activeActivityTab === 'git' && isSidebarOpen && (
                <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-blue-500 rounded-r" />
              )}
            </button>

            <button
              onClick={() => setIsRightCopilotOpen((prev) => !prev)}
              className={`p-2.5 rounded-lg transition-colors cursor-pointer relative ${
                isRightCopilotOpen
                  ? 'text-purple-300 bg-purple-950/50'
                  : 'text-zinc-400 hover:text-purple-300 hover:bg-white/5'
              }`}
              title="Docx-IDE Copilot"
            >
              <Sparkles size={18} />
            </button>

            <button
              onClick={() => setIsTrenchModalOpen(true)}
              className="p-2.5 rounded-lg text-zinc-400 hover:text-purple-300 hover:bg-white/5 cursor-pointer"
              title="Trench Handoff Bridge"
            >
              <Layers size={18} />
            </button>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => {
                if (activeActivityTab === 'settings' && isSidebarOpen) {
                  setIsSidebarOpen(false);
                } else {
                  setActiveActivityTab('settings');
                  setIsSidebarOpen(true);
                }
              }}
              className={`p-2.5 rounded-lg transition-colors cursor-pointer relative ${
                activeActivityTab === 'settings' && isSidebarOpen
                  ? 'text-white bg-white/10'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
              title="IDE & Editor Settings"
            >
              <SettingsIcon size={18} />
            </button>
          </div>
        </div>

        {/* Collapsible Left Sidebar (Explorer, Search, Git, Settings) */}
        {isSidebarOpen && (
          <aside className="w-64 bg-[#0e121b] border-r border-white/10 flex flex-col shrink-0 overflow-hidden">
            {/* 1. File Explorer Tab */}
            {activeActivityTab === 'explorer' && (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-[#090c13]">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Explorer
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleSmartOpenFolder}
                      className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
                      title="Open Local Project Folder"
                    >
                      <FolderUp size={14} />
                    </button>
                    <button
                      onClick={() => setIsCreatingFile(true)}
                      className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
                      title="New File"
                    >
                      <FilePlus size={14} />
                    </button>
                    <button
                      onClick={handleExportZip}
                      className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
                      title="Export Project ZIP"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>

                {/* Inline file creation */}
                {isCreatingFile && (
                  <form onSubmit={handleCreateFileSubmit} className="p-2 border-b border-white/10 bg-[#121622]">
                    <div className="flex items-center gap-1">
                      <input
                        ref={fileInputRef}
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        placeholder="e.g. /styles.css or /script.js"
                        autoFocus
                        onBlur={() => {
                          if (!newFileName.trim()) setIsCreatingFile(false);
                        }}
                        className="flex-1 bg-[#090c14] border border-blue-500/70 text-xs text-white px-2 py-1 rounded focus:outline-hidden"
                      />
                      <button
                        type="submit"
                        className="p-1 text-emerald-400 hover:bg-emerald-950/40 rounded cursor-pointer"
                      >
                        <CheckCircle2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCreatingFile(false)}
                        className="p-1 text-zinc-400 hover:bg-white/5 rounded cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </form>
                )}

                {/* Project File Tree */}
                <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
                  <div className="px-2 py-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Folder size={12} className="text-blue-400" />
                    <span className="truncate">{activeProject.name}</span>
                  </div>

                  {Object.values(activeProject.files)
                    .filter((f) => !f.isFolder)
                    .map((file) => {
                      const isActive = file.path === activeProject.activeFilePath;
                      const isRenaming = renamingPath === file.path;

                      if (isRenaming) {
                        return (
                          <div key={file.path} className="px-2 py-1">
                            <input
                              type="text"
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onBlur={() => handleRenameSubmit(file.path)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRenameSubmit(file.path);
                                if (e.key === 'Escape') setRenamingPath(null);
                              }}
                              autoFocus
                              className="w-full bg-[#090c14] border border-blue-500 text-xs text-white px-1.5 py-0.5 rounded focus:outline-hidden font-mono"
                            />
                          </div>
                        );
                      }

                      return (
                        <div
                          key={file.path}
                          onClick={() => handleOpenFile(file.path)}
                          className={`group flex items-center justify-between px-2 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                            isActive
                              ? 'bg-blue-600/20 text-blue-200 border border-blue-500/30 font-medium'
                              : 'text-zinc-300 hover:bg-white/5 hover:text-white border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileCode
                              size={14}
                              className={
                                file.name.endsWith('.html')
                                  ? 'text-orange-400'
                                  : file.name.endsWith('.css')
                                  ? 'text-blue-400'
                                  : file.name.endsWith('.js') || file.name.endsWith('.ts')
                                  ? 'text-yellow-400'
                                  : file.name.endsWith('.py')
                                  ? 'text-emerald-400'
                                  : 'text-zinc-400'
                              }
                            />
                            <span className="truncate font-mono text-[12px]">{file.name}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {file.isDirty && (
                              <span
                                className="w-2 h-2 rounded-full bg-amber-400 group-hover:hidden"
                                title="Unsaved changes"
                              />
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRenamingPath(file.path);
                                setRenameValue(file.path);
                              }}
                              className="p-1 text-zinc-500 hover:text-zinc-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Rename file"
                            >
                              <Edit2 size={12} />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFile(file.path);
                              }}
                              className="p-1 text-zinc-500 hover:text-rose-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete file"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Bottom Explorer Action Button */}
                <div className="p-2 border-t border-white/5 bg-[#0a0d14]">
                  <button
                    onClick={handleSmartOpenFolder}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-blue-600/15 hover:bg-blue-600/30 border border-blue-500/30 hover:border-blue-500/60 text-xs font-medium text-blue-300 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                    title="Import local project folder from your computer"
                  >
                    <FolderInput size={13} className="text-blue-400" />
                    <span>Open Local Folder</span>
                  </button>
                  <p className="text-[10px] text-zinc-500 text-center mt-1.5">
                    or drop folder from desktop
                  </p>
                </div>
              </div>
            )}

            {/* 2. Search in Files Tab */}
            {activeActivityTab === 'search' && (
              <div className="flex flex-col h-full">
                <div className="px-3 py-2 border-b border-white/10 bg-[#090c13]">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Search Files
                  </span>
                </div>
                <div className="p-3 space-y-2 border-b border-white/10">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search across project..."
                    className="w-full text-xs bg-[#090c14] border border-white/15 rounded-md px-2 py-1.5 text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-blue-500"
                  />
                  <div className="text-[11px] text-zinc-500">
                    {searchResults.length} matches found
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {searchResults.map((res, i) => (
                    <button
                      key={i}
                      onClick={() => handleOpenFile(res.path)}
                      className="w-full text-left p-2 rounded bg-[#131724]/60 hover:bg-[#181d2c] border border-white/5 hover:border-white/15 text-xs space-y-0.5 cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-[11px] text-blue-300 font-mono">
                        <span className="truncate">{res.path}</span>
                        <span className="text-zinc-500">Ln {res.line}</span>
                      </div>
                      <div className="text-zinc-300 font-mono text-[11px] truncate bg-[#090c14] p-1 rounded">
                        {res.text}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Source Control Tab */}
            {activeActivityTab === 'git' && (
              <SourceControlPanel
                project={activeProject}
                commits={gitCommits}
                onCommit={handleGitCommit}
                onOpenDiff={(path) => {
                  const target = activeProject.files[path];
                  if (target) {
                    setDiffView({
                      filePath: path,
                      oldCode: target.content,
                      newCode: target.content,
                    });
                  }
                }}
                onDiscardChanges={(path) => {
                  if (confirm(`Discard all unsaved edits to ${path}?`)) {
                    // reset isDirty
                    setProjects((prev) =>
                      prev.map((proj) => {
                        if (proj.id !== activeProject.id) return proj;
                        const f = proj.files[path];
                        if (!f) return proj;
                        return {
                          ...proj,
                          files: {
                            ...proj.files,
                            [path]: { ...f, isDirty: false },
                          },
                        };
                      })
                    );
                  }
                }}
              />
            )}

            {/* 4. Settings Tab */}
            {activeActivityTab === 'settings' && (
              <div className="flex flex-col h-full">
                <div className="px-3 py-2 border-b border-white/10 bg-[#090c13]">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Editor Preferences
                  </span>
                </div>
                <div className="p-3 overflow-y-auto space-y-4 text-xs">
                  <div>
                    <label className="block text-zinc-400 mb-1">Font Size ({editorSettings.fontSize}px)</label>
                    <input
                      type="range"
                      min={10}
                      max={22}
                      value={editorSettings.fontSize}
                      onChange={(e) =>
                        setEditorSettings((s) => ({ ...s, fontSize: Number(e.target.value) }))
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Tab Size</label>
                    <div className="flex gap-2">
                      {[2, 4].map((size) => (
                        <button
                          key={size}
                          onClick={() => setEditorSettings((s) => ({ ...s, tabSize: size }))}
                          className={`flex-1 py-1 rounded text-xs border ${
                            editorSettings.tabSize === size
                              ? 'bg-blue-600 text-white border-blue-500'
                              : 'bg-white/5 text-zinc-300 border-white/10'
                          }`}
                        >
                          {size} Spaces
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Word Wrap</label>
                    <button
                      onClick={() =>
                        setEditorSettings((s) => ({
                          ...s,
                          wordWrap: s.wordWrap === 'on' ? 'off' : 'on',
                        }))
                      }
                      className={`w-full py-1.5 rounded text-xs border ${
                        editorSettings.wordWrap === 'on'
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                          : 'bg-white/5 text-zinc-400 border-white/10'
                      }`}
                    >
                      {editorSettings.wordWrap === 'on' ? 'Enabled (Wrap Lines)' : 'Disabled'}
                    </button>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1">Minimap</label>
                    <button
                      onClick={() => setEditorSettings((s) => ({ ...s, minimap: !s.minimap }))}
                      className={`w-full py-1.5 rounded text-xs border ${
                        editorSettings.minimap
                          ? 'bg-blue-950/60 text-blue-300 border-blue-500/40'
                          : 'bg-white/5 text-zinc-400 border-white/10'
                      }`}
                    >
                      {editorSettings.minimap ? 'Minimap Visible' : 'Minimap Hidden'}
                    </button>
                  </div>

                  <div className="pt-3 border-t border-white/10">
                    <span className="block text-zinc-400 mb-2">VileDocx Integration</span>
                    <button
                      onClick={() => onOpenSettings('provider')}
                      className="w-full py-1.5 px-3 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <SettingsIcon size={13} />
                      <span>Configure API Keys & Models</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </aside>
        )}

        {/* Center: Editor & Tabs Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0d1017] relative">
          {/* Editor Tabs Bar */}
          <div className="h-9 bg-[#090c13] border-b border-white/10 flex items-center justify-between px-1 overflow-x-auto shrink-0 scrollbar-none">
            <div className="flex items-center gap-0.5 min-w-0">
              {activeProject.openTabs.map((path) => {
                const file = activeProject.files[path];
                if (!file) return null;
                const isActive = path === activeProject.activeFilePath && !diffView;

                return (
                  <div
                    key={path}
                    onClick={() => handleOpenFile(path)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs border-r border-white/5 cursor-pointer select-none transition-colors max-w-[200px] ${
                      isActive
                        ? 'bg-[#0d1017] text-white border-t-2 border-t-blue-500 font-medium'
                        : 'bg-[#090c13] text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                    }`}
                  >
                    <FileCode
                      size={13}
                      className={
                        file.name.endsWith('.html')
                          ? 'text-orange-400'
                          : file.name.endsWith('.css')
                          ? 'text-blue-400'
                          : file.name.endsWith('.js') || file.name.endsWith('.ts')
                          ? 'text-yellow-400'
                          : file.name.endsWith('.py')
                          ? 'text-emerald-400'
                          : 'text-zinc-400'
                      }
                    />
                    <span className="truncate font-mono">{file.name}</span>

                    {file.isDirty ? (
                      <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Unsaved" />
                    ) : (
                      <button
                        onClick={(e) => handleCloseTab(e, path)}
                        className="p-0.5 rounded text-zinc-500 hover:text-white hover:bg-white/10 shrink-0 cursor-pointer"
                        title="Close tab"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                );
              })}

              {diffView && (
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs bg-purple-950/60 text-purple-200 border-t-2 border-t-purple-500 font-medium border-r border-white/10">
                  <Sparkles size={13} className="text-purple-400" />
                  <span className="font-mono">Diff: {diffView.filePath}</span>
                  <button
                    onClick={() => setDiffView(null)}
                    className="p-0.5 rounded text-purple-300 hover:text-white cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions (Save, Format, Run) */}
            <div className="flex items-center gap-1 shrink-0 px-2">
              {activeFile?.isDirty && (
                <button
                  onClick={handleSaveActiveFile}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium transition-colors cursor-pointer shadow-xs"
                  title="Save current file (Ctrl+S)"
                >
                  <Save size={12} />
                  <span>Save</span>
                </button>
              )}

              <button
                onClick={() => setIsBottomOpen((prev) => !prev)}
                className={`p-1.5 rounded text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer ${
                  isBottomOpen ? 'text-blue-400 bg-white/5' : ''
                }`}
                title="Toggle Bottom Terminal / Output Panel (Ctrl+`)"
              >
                <PanelBottom size={14} />
              </button>
            </div>
          </div>

          {/* Editor Body */}
          <div className="flex-1 relative overflow-hidden bg-[#0d1017]">
            {diffView ? (
              <div className="h-full flex flex-col">
                <div className="px-4 py-2 bg-[#121624] border-b border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-purple-300 font-mono">
                    <Sparkles size={14} />
                    <span>Review Proposed Changes: {diffView.filePath}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApplyProposedDiff(diffView.filePath, diffView.newCode)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium cursor-pointer shadow-xs"
                    >
                      Accept & Apply
                    </button>
                    <button
                      onClick={() => setDiffView(null)}
                      className="px-3 py-1 bg-white/10 hover:bg-white/15 text-zinc-300 rounded cursor-pointer"
                    >
                      Discard
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <DiffEditor
                    original={diffView.oldCode}
                    modified={diffView.newCode}
                    language={detectLanguageFromPath(diffView.filePath)}
                    theme="vs-dark"
                    options={{
                      fontSize: editorSettings.fontSize,
                      minimap: { enabled: false },
                      readOnly: true,
                      renderSideBySide: true,
                    }}
                  />
                </div>
              </div>
            ) : activeFile ? (
              <Editor
                height="100%"
                path={activeFile.path}
                language={activeFile.language}
                value={activeFile.content}
                onChange={handleContentChange}
                theme="vs-dark"
                options={{
                  fontSize: editorSettings.fontSize,
                  tabSize: editorSettings.tabSize,
                  wordWrap: editorSettings.wordWrap,
                  minimap: { enabled: editorSettings.minimap },
                  lineNumbers: editorSettings.lineNumbers,
                  fontFamily: editorSettings.fontFamily,
                  automaticLayout: true,
                  smoothScrolling: true,
                  cursorBlinking: 'smooth',
                  scrollBeyondLastLine: false,
                }}
                onMount={(editor) => {
                  editor.onDidChangeCursorPosition((e) => {
                    setCursorPos({ line: e.position.lineNumber, col: e.position.column });
                  });
                }}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                <FileCode size={36} className="text-zinc-600 mb-2" />
                <p className="text-sm">No file currently open</p>
                <p className="text-xs text-zinc-600 mt-1">
                  Select a file from the explorer or press <kbd className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-400">Ctrl+P</kbd> to open.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Panel (Collapsible: Terminal, Console Logs, Problems) */}
          {isBottomOpen && (
            <div className="h-48 bg-[#090c13] border-t border-white/10 flex flex-col shrink-0">
              {/* Bottom tabs bar */}
              <div className="flex items-center justify-between px-3 py-1 border-b border-white/10 bg-[#07090f]">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveBottomTab('terminal')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
                      activeBottomTab === 'terminal'
                        ? 'bg-white/10 text-white font-medium'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <TerminalIcon size={13} />
                    <span>JS Terminal / REPL</span>
                  </button>

                  <button
                    onClick={() => setActiveBottomTab('output')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
                      activeBottomTab === 'output'
                        ? 'bg-white/10 text-white font-medium'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>Output & Logs</span>
                    {consoleLogs.length > 0 && (
                      <span className="px-1 text-[10px] rounded-full bg-white/10 text-zinc-300">
                        {consoleLogs.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveBottomTab('problems')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors cursor-pointer ${
                      activeBottomTab === 'problems'
                        ? 'bg-white/10 text-white font-medium'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <AlertCircle size={13} />
                    <span>Problems</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setConsoleLogs([])}
                    className="text-[11px] text-zinc-400 hover:text-white px-2 py-0.5 rounded hover:bg-white/5 cursor-pointer"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setIsBottomOpen(false)}
                    className="p-1 text-zinc-400 hover:text-white hover:bg-white/5 rounded cursor-pointer"
                    title="Close bottom panel"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Bottom tab contents */}
              <div className="flex-1 overflow-y-auto p-2 font-mono text-xs">
                {activeBottomTab === 'terminal' && (
                  <div className="flex flex-col h-full justify-between">
                    <div className="flex-1 overflow-y-auto space-y-1">
                      <div className="text-[11px] text-zinc-500">
                        Interactive JavaScript REPL execution sandbox. Run JS statements or inspect variables:
                      </div>
                      {consoleLogs.slice(-20).map((log) => (
                        <div
                          key={log.id}
                          className={`flex items-start gap-2 leading-relaxed ${
                            log.type === 'error'
                              ? 'text-rose-400'
                              : log.type === 'warn'
                              ? 'text-amber-400'
                              : log.type === 'info'
                              ? 'text-blue-300'
                              : 'text-zinc-300'
                          }`}
                        >
                          <span className="text-[10px] text-zinc-600 select-none">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                          <span className="break-all whitespace-pre-wrap">{log.message}</span>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleTerminalSubmit} className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <span className="text-emerald-400 font-bold select-none">&gt;</span>
                      <input
                        type="text"
                        value={terminalInput}
                        onChange={(e) => setTerminalInput(e.target.value)}
                        placeholder="Type JavaScript expression to evaluate (e.g. 2 + 2, document.title, Math.random())..."
                        className="flex-1 bg-transparent text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-hidden"
                      />
                    </form>
                  </div>
                )}

                {activeBottomTab === 'output' && (
                  <div className="space-y-1">
                    {consoleLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`text-xs ${
                          log.type === 'error'
                            ? 'text-rose-400'
                            : log.type === 'warn'
                            ? 'text-amber-400'
                            : 'text-zinc-400'
                        }`}
                      >
                        [{log.type.toUpperCase()}] {log.message}
                      </div>
                    ))}
                  </div>
                )}

                {activeBottomTab === 'problems' && (
                  <div className="text-zinc-500 py-4 text-center">
                    No active syntax errors or lint problems detected in workspace files.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Live Web Preview Panel (Right Side Split View) */}
        {isLivePreviewOpen && (
          <aside className="w-1/2 min-w-[320px] max-w-[800px] bg-[#090c13] border-l border-white/10 flex flex-col shrink-0 z-10">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-[#0d1017]">
              <div className="flex items-center gap-2">
                <Play size={13} className="text-emerald-400" />
                <span className="text-xs font-semibold text-white">Live Sandboxed Web Runner</span>
              </div>
              <button
                onClick={() => setIsLivePreviewOpen(false)}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-white/5 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex-1">
              <WebPreviewIframe
                project={activeProject}
                onConsoleLog={(entry) => setConsoleLogs((prev) => [...prev, entry])}
                className="h-full"
              />
            </div>
          </aside>
        )}

        {/* Right Sidebar: AI Copilot */}
        {isRightCopilotOpen && (
          <aside className="w-80 sm:w-96 bg-[#0e121c] border-l border-white/10 flex flex-col shrink-0 z-10">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-[#090c13]">
              <div className="flex items-center gap-2 text-purple-300">
                <Sparkles size={14} />
                <span className="text-xs font-semibold">Docx-IDE Copilot</span>
              </div>
              <button
                onClick={() => setIsRightCopilotOpen(false)}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-white/5 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <CopilotSidebar
                project={activeProject}
                activeFile={activeFile}
                providerConfig={providerConfig}
                onApplyProposedDiff={handleApplyProposedDiff}
                onOpenDiffEditor={(path, oldCode, newCode) => {
                  setDiffView({ filePath: path, oldCode, newCode });
                }}
                onOpenSettings={() => onOpenSettings('provider')}
              />
            </div>
          </aside>
        )}
      </div>

      {/* =========================================================================
          3. STATUS BAR (Line, Col, Language, Indentation, Model Badge, Notifications)
          ========================================================================= */}
      <footer className="h-6 bg-[#07090f] border-t border-white/10 flex items-center justify-between px-3 text-[11px] text-zinc-400 shrink-0 select-none z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-mono text-zinc-300">{activeProject.name}</span>
          </div>

          {activeFile && (
            <span>
              Ln {cursorPos.line}, Col {cursorPos.col}
            </span>
          )}

          <span>Spaces: {editorSettings.tabSize}</span>
          <span>UTF-8</span>

          {editorNotice && (
            <span className="text-blue-300 font-medium animate-pulse">
              {editorNotice}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-purple-300">
            <Sparkles size={11} />
            <span className="font-mono truncate max-w-[140px]">{providerConfig.model}</span>
          </div>

          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="hover:text-white cursor-pointer"
            title="Command Palette"
          >
            Ctrl+Shift+P
          </button>
        </div>
      </footer>

      {/* =========================================================================
          4. MODALS (Command Palette, Quick Open, Trench Bridge, New Project)
          ========================================================================= */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        commands={commandList}
      />

      <QuickFileOpen
        isOpen={isQuickOpenOpen}
        onClose={() => setIsQuickOpenOpen(false)}
        project={activeProject}
        onSelectFile={handleOpenFile}
      />

      <TrenchModal
        isOpen={isTrenchModalOpen}
        onClose={() => setIsTrenchModalOpen(false)}
        project={activeProject}
        activeFile={activeFile}
        recentErrors={consoleLogs.filter((l) => l.type === 'error').map((l) => l.message)}
        onApplyModification={handleApplyProposedDiff}
      />

      {/* New Project Dialog */}
      {isNewProjectModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
          onClick={() => setIsNewProjectModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#131722] border border-white/15 rounded-xl shadow-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Code2 size={16} className="text-blue-400" />
                Create New Project
              </h3>
              <button
                onClick={() => setIsNewProjectModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Option 1: Import Local Project Folder */}
              <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/30 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-200">
                  <FolderInput size={15} className="text-blue-400" />
                  <span>Import Local Project Folder</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Open an existing project folder from your computer. Docx-IDE reads all nested directories, code files, and styles while skipping node_modules and build artifacts.
                </p>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    onClick={() => {
                      setIsNewProjectModalOpen(false);
                      handleSmartOpenFolder();
                    }}
                    className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-blue-900/40"
                  >
                    <FolderInput size={14} />
                    <span>Choose Local Folder</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsNewProjectModalOpen(false);
                      folderInputRef.current?.click();
                    }}
                    className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FolderUp size={14} />
                    <span>Browser Upload</span>
                  </button>
                </div>
              </div>

              {/* Option 2: Starter Templates */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">Or Start from Template:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const newP = createStarterWebProject();
                      newP.id = 'proj_' + Math.random().toString(36).substring(2, 9);
                      newP.name = `Web Project ${projects.length + 1}`;
                      setProjects((prev) => [newP, ...prev]);
                      setActiveProjectId(newP.id);
                      setIsNewProjectModalOpen(false);
                    }}
                    className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-blue-400 text-left cursor-pointer transition-colors hover:bg-white/10"
                  >
                    <div className="font-semibold text-xs text-blue-200">Modern Web App</div>
                    <div className="text-[11px] text-zinc-400 mt-1">HTML, CSS, JS with Live Runner</div>
                  </button>

                  <button
                    onClick={() => {
                      const newP = createStarterPythonProject();
                      newP.id = 'proj_' + Math.random().toString(36).substring(2, 9);
                      newP.name = `Python Sandbox ${projects.length + 1}`;
                      setProjects((prev) => [newP, ...prev]);
                      setActiveProjectId(newP.id);
                      setIsNewProjectModalOpen(false);
                    }}
                    className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-emerald-400 text-left cursor-pointer transition-colors hover:bg-white/10"
                  >
                    <div className="font-semibold text-xs text-emerald-200">Python Sandbox</div>
                    <div className="text-[11px] text-zinc-400 mt-1">Algorithms, data structures & tests</div>
                  </button>
                </div>
              </div>

              {/* Option 3: Import from ZIP */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-zinc-400">Have a project ZIP archive?</span>
                <button
                  onClick={() => {
                    setIsNewProjectModalOpen(false);
                    zipInputRef.current?.click();
                  }}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-200 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Upload size={12} />
                  <span>Import ZIP</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsNewProjectModalOpen(false)}
                className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
