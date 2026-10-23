import React, { useState } from 'react';
import {
  Layers,
  Send,
  Copy,
  Check,
  FileCode,
  AlertCircle,
  ExternalLink,
  X,
  FileText,
  Upload,
} from 'lucide-react';
import type { IDEProject, IDEFile } from './ideTypes';

interface TrenchModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: IDEProject;
  activeFile?: IDEFile;
  recentErrors?: string[];
  onApplyModification: (filePath: string, newContent: string) => void;
}

export const TrenchModal: React.FC<TrenchModalProps> = ({
  isOpen,
  onClose,
  project,
  activeFile,
  recentErrors = [],
  onApplyModification,
}) => {
  const [taskPrompt, setTaskPrompt] = useState('');
  const [includeActiveOnly, setIncludeActiveOnly] = useState(false);
  const [includeErrors, setIncludeErrors] = useState(true);
  const [copied, setCopied] = useState(false);

  // Agent modification review
  const [targetFilePath, setTargetFilePath] = useState(activeFile?.path || '/index.html');
  const [agentModifiedContent, setAgentModifiedContent] = useState('');
  const [appliedNotice, setAppliedNotice] = useState(false);

  if (!isOpen) return null;

  // Generate Trench payload bundle
  const generatePayload = () => {
    const payload: Record<string, any> = {
      project: project.name,
      timestamp: new Date().toISOString(),
      task: taskPrompt.trim() || 'Analyze and optimize code',
    };

    if (includeActiveOnly && activeFile) {
      payload.files = {
        [activeFile.path]: activeFile.content,
      };
    } else {
      payload.files = Object.fromEntries(
        Object.entries(project.files)
          .filter(([_, f]) => !f.isFolder)
          .map(([path, file]) => [path, file.content])
      );
    }

    if (includeErrors && recentErrors.length > 0) {
      payload.recentErrors = recentErrors;
    }

    return JSON.stringify(payload, null, 2);
  };

  const handleCopyPayload = () => {
    const payload = generatePayload();
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleApplyToIDE = () => {
    if (!targetFilePath || !agentModifiedContent.trim()) return;
    onApplyModification(targetFilePath, agentModifiedContent);
    setAppliedNotice(true);
    setTimeout(() => {
      setAppliedNotice(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#111522] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-zinc-200 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#0c101a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-950/70 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Trench Handoff & Review Bridge
              </h3>
              <p className="text-[11px] text-zinc-400">
                Package project context for autonomous agent workflows & review results
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Tabs / Body */}
        <div className="p-5 overflow-y-auto max-h-[75vh] space-y-5 text-xs">
          {/* Section 1: Handoff to Agent */}
          <div className="space-y-3 bg-[#0a0d16] p-4 rounded-xl border border-white/5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <Send size={13} className="text-purple-400" />
                1. Export Handoff Context
              </span>
              <span className="text-[10px] text-zinc-500">
                Project: {project.name} ({Object.keys(project.files).length} files)
              </span>
            </div>

            <textarea
              value={taskPrompt}
              onChange={(e) => setTaskPrompt(e.target.value)}
              placeholder="Describe the agent objective or instructions for Trench (e.g., 'Refactor state management into hooks and fix runtime race condition')..."
              rows={3}
              className="w-full bg-[#111522] border border-white/10 rounded-lg p-2.5 text-zinc-100 placeholder:text-zinc-500 focus:outline-hidden focus:border-purple-500/60"
            />

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!includeActiveOnly}
                  onChange={(e) => setIncludeActiveOnly(!e.target.checked)}
                  className="rounded border-zinc-700 text-purple-600 focus:ring-0"
                />
                <span>Include all project files</span>
              </label>

              {recentErrors.length > 0 && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeErrors}
                    onChange={(e) => setIncludeErrors(e.target.checked)}
                    className="rounded border-zinc-700 text-purple-600 focus:ring-0"
                  />
                  <span>Attach recent execution logs ({recentErrors.length})</span>
                </label>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyPayload}
                className="py-2 px-4 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-900/40"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Context Copied to Clipboard!' : 'Copy Context Payload'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([generatePayload()], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}-trench-context.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
              >
                <FileText size={13} />
                <span>Download JSON</span>
              </button>
            </div>
          </div>

          {/* Section 2: Review & Apply Agent Modifications */}
          <div className="space-y-3 bg-[#0a0d16] p-4 rounded-xl border border-white/5">
            <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
              <Upload size={13} className="text-emerald-400" />
              2. Review & Apply Agent Modifications
            </span>
            <p className="text-[11px] text-zinc-400">
              Paste the modified code returned by your Trench or external agent run below to apply it back into the IDE.
            </p>

            <div className="flex items-center gap-2">
              <label className="text-[11px] text-zinc-400 shrink-0">Target File:</label>
              <select
                value={targetFilePath}
                onChange={(e) => setTargetFilePath(e.target.value)}
                className="bg-[#111522] border border-white/10 rounded-md px-2 py-1 text-xs text-zinc-200 focus:outline-hidden"
              >
                {Object.values(project.files)
                  .filter((f) => !f.isFolder)
                  .map((f) => (
                    <option key={f.path} value={f.path}>
                      {f.path}
                    </option>
                  ))}
              </select>
            </div>

            <textarea
              value={agentModifiedContent}
              onChange={(e) => setAgentModifiedContent(e.target.value)}
              placeholder="Paste updated code from Trench agent here..."
              rows={5}
              className="w-full font-mono text-xs bg-[#111522] border border-white/10 rounded-lg p-2.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-emerald-500/60"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-zinc-500">
                Changes will be saved and can be inspected in Source Control or reverted.
              </span>
              <button
                type="button"
                disabled={!agentModifiedContent.trim()}
                onClick={handleApplyToIDE}
                className="py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/30"
              >
                <Check size={14} />
                <span>{appliedNotice ? 'Applied to File!' : 'Apply to Project File'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-[#090d16] flex items-center justify-between text-[11px] text-zinc-500">
          <span>Safe sandbox handoff · No unconfirmed overwrites</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-zinc-300 cursor-pointer"
          >
            Return to IDE
          </button>
        </div>
      </div>
    </div>
  );
};
