import React, { useState, useEffect, useRef } from 'react';
import { Search, FileCode, Folder, X, FileText } from 'lucide-react';
import type { IDEProject, IDEFile } from './ideTypes';

interface QuickFileOpenProps {
  isOpen: boolean;
  onClose: () => void;
  project: IDEProject;
  onSelectFile: (filePath: string) => void;
}

export const QuickFileOpen: React.FC<QuickFileOpenProps> = ({
  isOpen,
  onClose,
  project,
  onSelectFile,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const files = Object.values(project.files).filter((f) => !f.isFolder);

  const filtered = files.filter((f) =>
    f.path.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        onSelectFile(filtered[selectedIndex].path);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#131722] border border-white/15 rounded-xl shadow-2xl overflow-hidden flex flex-col text-zinc-200 animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-[#0c101a]">
          <Search size={18} className="text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Go to file... (type name or path)"
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto p-1.5 space-y-0.5">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No files matching &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((file, idx) => {
              const isSelected = idx === selectedIndex;
              const isCurrent = file.path === project.activeFilePath;
              return (
                <button
                  key={file.path}
                  onClick={() => {
                    onSelectFile(file.path);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-blue-600 text-white font-medium'
                      : 'hover:bg-white/5 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileCode
                      size={15}
                      className={
                        isSelected
                          ? 'text-white'
                          : file.name.endsWith('.html')
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
                    <span className="font-mono text-xs">{file.name}</span>
                    <span
                      className={`text-[11px] truncate ${
                        isSelected ? 'text-blue-100' : 'text-zinc-500'
                      }`}
                    >
                      {file.path}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {file.isDirty && (
                      <span className="w-2 h-2 rounded-full bg-amber-400" title="Unsaved changes" />
                    )}
                    {isCurrent && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-blue-700 text-white' : 'bg-white/10 text-zinc-400'
                        }`}
                      >
                        active
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-mono uppercase ${
                        isSelected ? 'text-blue-200' : 'text-zinc-500'
                      }`}
                    >
                      {file.language}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 border-t border-white/10 bg-[#090d16] flex items-center justify-between text-[11px] text-zinc-500">
          <span>{files.length} project files</span>
          <span>Press Enter to open</span>
        </div>
      </div>
    </div>
  );
};
