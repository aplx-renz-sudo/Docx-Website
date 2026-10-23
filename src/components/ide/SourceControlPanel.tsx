import React, { useState } from 'react';
import {
  GitBranch,
  GitCommit as GitCommitIcon,
  Check,
  Plus,
  Minus,
  RotateCcw,
  Clock,
  FileCode,
  AlertCircle,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import type { IDEProject, IDEFile, GitCommit } from './ideTypes';

interface SourceControlPanelProps {
  project: IDEProject;
  commits: GitCommit[];
  onCommit: (message: string, files: string[]) => void;
  onOpenDiff: (filePath: string) => void;
  onDiscardChanges: (filePath: string) => void;
  className?: string;
}

export const SourceControlPanel: React.FC<SourceControlPanelProps> = ({
  project,
  commits,
  onCommit,
  onOpenDiff,
  onDiscardChanges,
  className = '',
}) => {
  const [commitMessage, setCommitMessage] = useState('');
  const [stagedFiles, setStagedFiles] = useState<Set<string>>(new Set());

  // Files that have unsaved or modified state
  const modifiedFiles = Object.values(project.files).filter(
    (f) => !f.isFolder && (f.isDirty || f.updatedAt && f.updatedAt > project.createdAt)
  );

  const toggleStage = (path: string) => {
    setStagedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const stageAll = () => {
    setStagedFiles(new Set(modifiedFiles.map((f) => f.path)));
  };

  const unstageAll = () => {
    setStagedFiles(new Set());
  };

  const handleCommitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitMessage.trim()) return;

    const filesToCommit =
      stagedFiles.size > 0
        ? Array.from(stagedFiles)
        : modifiedFiles.map((f) => f.path);

    onCommit(commitMessage.trim(), filesToCommit);
    setCommitMessage('');
    setStagedFiles(new Set());
  };

  return (
    <div className={`flex flex-col h-full bg-[#11141f] text-zinc-300 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-[#0d1017]">
        <div className="flex items-center gap-2">
          <GitBranch size={15} className="text-blue-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
            Source Control
          </span>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-500/30 text-blue-300">
          local (main)
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Commit message input & action */}
        <form onSubmit={handleCommitSubmit} className="space-y-2">
          <textarea
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Message (Ctrl+Enter to commit)"
            rows={2}
            className="w-full text-xs bg-[#090c14] border border-white/15 rounded-lg p-2 text-zinc-100 placeholder:text-zinc-500 focus:outline-hidden focus:border-blue-500/70 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                handleCommitSubmit(e);
              }
            }}
          />

          <button
            type="submit"
            disabled={!commitMessage.trim() || modifiedFiles.length === 0}
            className="w-full py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-900/30"
          >
            <Check size={14} />
            <span>Commit to Snapshot ({stagedFiles.size > 0 ? stagedFiles.size : modifiedFiles.length})</span>
          </button>
        </form>

        {/* Changes list */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
            <span>Changes ({modifiedFiles.length})</span>
            {modifiedFiles.length > 0 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={stageAll}
                  className="text-[10px] text-blue-400 hover:text-blue-300 px-1 py-0.5 rounded hover:bg-white/5 cursor-pointer"
                  title="Stage all changes"
                >
                  Stage All
                </button>
                {stagedFiles.size > 0 && (
                  <button
                    type="button"
                    onClick={unstageAll}
                    className="text-[10px] text-zinc-400 hover:text-zinc-300 px-1 py-0.5 rounded hover:bg-white/5 cursor-pointer"
                  >
                    Unstage All
                  </button>
                )}
              </div>
            )}
          </div>

          {modifiedFiles.length === 0 ? (
            <div className="py-6 text-center text-xs text-zinc-500 border border-dashed border-white/10 rounded-lg">
              Working tree clean. No modified files.
            </div>
          ) : (
            <div className="space-y-1">
              {modifiedFiles.map((file) => {
                const isStaged = stagedFiles.has(file.path);
                return (
                  <div
                    key={file.path}
                    className="flex items-center justify-between px-2 py-1.5 rounded-md text-xs bg-[#090c14]/70 border border-white/5 hover:border-white/15 group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode size={13} className="text-zinc-400 shrink-0" />
                      <span className="font-mono text-zinc-200 truncate">{file.name}</span>
                      <span className="text-[10px] text-zinc-500 truncate">{file.path}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className={`text-[10px] font-mono px-1 rounded ${
                          file.isDirty
                            ? 'text-amber-400 bg-amber-950/40'
                            : 'text-emerald-400 bg-emerald-950/40'
                        }`}
                      >
                        {file.isDirty ? 'M' : 'U'}
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleStage(file.path)}
                        className={`p-1 rounded cursor-pointer ${
                          isStaged
                            ? 'text-blue-400 bg-blue-950/60'
                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                        }`}
                        title={isStaged ? 'Unstage file' : 'Stage file'}
                      >
                        {isStaged ? <CheckCircle2 size={13} /> : <Plus size={13} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => onDiscardChanges(file.path)}
                        className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Discard changes"
                      >
                        <RotateCcw size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Commit History */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
            <Clock size={13} />
            <span>Commit History ({commits.length})</span>
          </div>

          {commits.length === 0 ? (
            <div className="py-4 text-center text-xs text-zinc-500">
              No commit history yet. Make your first commit above!
            </div>
          ) : (
            <div className="space-y-1.5">
              {commits.map((c) => (
                <div
                  key={c.id}
                  className="p-2 rounded-lg bg-[#090c14]/50 border border-white/5 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-200 truncate">{c.message}</span>
                    <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                      {c.id.slice(0, 7)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500">
                    <span>{c.author}</span>
                    <span>{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    {c.changedFiles.length} file{c.changedFiles.length === 1 ? '' : 's'} committed
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
