import React from 'react';
import {
  Save,
  RotateCcw,
  X,
  Move,
  Check,
  Layout,
  ArrowUp,
  ArrowDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
} from 'lucide-react';
import type { ChatPositionsConfig, ThemeMode } from '../types';

interface ChatPositionsBarProps {
  currentPositions: ChatPositionsConfig;
  draftPositions: ChatPositionsConfig;
  onChangeDraft: (next: ChatPositionsConfig) => void;
  onSave: () => void;
  onReset: () => void;
  onClose: () => void;
  hasUnsavedChanges: boolean;
  themeMode?: ThemeMode;
}

export function ChatPositionsBar({
  currentPositions: _currentPositions,
  draftPositions,
  onChangeDraft,
  onSave,
  onReset,
  onClose,
  hasUnsavedChanges,
  themeMode = 'dark',
}: ChatPositionsBarProps) {
  const isCandy = themeMode === 'candy';
  const isHalloween = themeMode === 'halloween';

  const update = (patch: Partial<ChatPositionsConfig>) => {
    onChangeDraft({ ...draftPositions, ...patch });
  };

  const moveSection = (section: 'header' | 'messages' | 'composer', direction: 'up' | 'down') => {
    const order = [...draftPositions.layoutOrder];
    const index = order.indexOf(section);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= order.length) return;
    
    // Swap
    const temp = order[index];
    order[index] = order[targetIndex];
    order[targetIndex] = temp;
    
    // If composer moves to the top (index 0 or before messages), reflect composerPosition
    const compIdx = order.indexOf('composer');
    const msgIdx = order.indexOf('messages');
    let newCompPos = draftPositions.composerPosition;
    if (compIdx < msgIdx && newCompPos === 'bottom') {
      newCompPos = 'top';
    } else if (compIdx > msgIdx && newCompPos === 'top') {
      newCompPos = 'bottom';
    }

    onChangeDraft({
      ...draftPositions,
      layoutOrder: order,
      composerPosition: newCompPos,
    });
  };

  // Presets
  const applyPreset = (presetKey: 'default' | 'topComposer' | 'wide' | 'floating' | 'full') => {
    if (presetKey === 'default') {
      onChangeDraft({
        composerPosition: 'bottom',
        composerWidth: 'normal',
        composerAlign: 'center',
        messagesWidth: 'normal',
        messagesAlign: 'center',
        messagesFlow: 'standard',
        headerPosition: 'top',
        layoutOrder: ['header', 'messages', 'composer'],
        inputToolbarAlign: 'left',
      });
    } else if (presetKey === 'topComposer') {
      onChangeDraft({
        ...draftPositions,
        composerPosition: 'top',
        layoutOrder: ['header', 'composer', 'messages'],
      });
    } else if (presetKey === 'wide') {
      onChangeDraft({
        ...draftPositions,
        composerWidth: 'wide',
        messagesWidth: 'wide',
        composerAlign: 'center',
        messagesAlign: 'center',
      });
    } else if (presetKey === 'floating') {
      onChangeDraft({
        ...draftPositions,
        composerPosition: 'floating',
        composerWidth: 'normal',
        composerAlign: 'center',
      });
    } else if (presetKey === 'full') {
      onChangeDraft({
        ...draftPositions,
        composerWidth: 'full',
        messagesWidth: 'full',
        composerAlign: 'left',
        messagesAlign: 'left',
      });
    }
  };

  return (
    <aside
      aria-label="Chat layout positions editor"
      className={`sticky top-0 z-40 w-full px-4 py-2.5 transition-all shadow-md ${
        isCandy
          ? 'bg-white/95 backdrop-blur-md border-b-2 border-pink-200 text-slate-800'
          : isHalloween
          ? 'bg-[#1b0a2a]/95 backdrop-blur-md border-b border-orange-500/30 text-orange-100'
          : 'bg-[#181818]/95 backdrop-blur-md border-b border-white/10 text-zinc-100'
      }`}
    >
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Mode Title & Unsaved Status */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div
            className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
              isCandy
                ? 'bg-pink-100 text-pink-700 border border-pink-200'
                : isHalloween
                ? 'bg-orange-950/80 text-orange-300 border border-orange-500/40'
                : 'bg-white/10 text-white border border-white/15'
            }`}
          >
            <Move size={14} className="animate-pulse" />
            <span>Position Editor</span>
          </div>

          <span className="text-xs font-medium text-opacity-80 flex items-center gap-1.5">
            {hasUnsavedChanges ? (
              <span className="inline-flex items-center gap-1 text-amber-500 dark:text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                Unsaved edits (User-side only)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-emerald-500 dark:text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full text-[11px]">
                <Check size={11} /> Saved in local storage
              </span>
            )}
          </span>

          {/* Quick Presets Pills */}
          <div className="hidden lg:flex items-center gap-1.5 ml-2 border-l border-white/10 pl-2 text-xs">
            <span className="text-[11px] opacity-60">Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset('default')}
              className="px-2 py-0.5 rounded text-[11px] font-medium border border-transparent hover:border-current opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
            >
              Standard
            </button>
            <button
              type="button"
              onClick={() => applyPreset('topComposer')}
              className="px-2 py-0.5 rounded text-[11px] font-medium border border-transparent hover:border-current opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
            >
              Top Input
            </button>
            <button
              type="button"
              onClick={() => applyPreset('wide')}
              className="px-2 py-0.5 rounded text-[11px] font-medium border border-transparent hover:border-current opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
            >
              Wide
            </button>
            <button
              type="button"
              onClick={() => applyPreset('floating')}
              className="px-2 py-0.5 rounded text-[11px] font-medium border border-transparent hover:border-current opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
            >
              Floating
            </button>
            <button
              type="button"
              onClick={() => applyPreset('full')}
              className="px-2 py-0.5 rounded text-[11px] font-medium border border-transparent hover:border-current opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
            >
              Full Width
            </button>
          </div>
        </div>

        {/* Center/Right: Quick Position Adjusters & Main SAVE Button */}
        <div className="flex items-center gap-2 justify-end flex-wrap">
          {/* Composer Position Selector */}
          <div
            className={`flex items-center text-xs rounded-lg p-0.5 border ${
              isCandy
                ? 'bg-slate-50 border-pink-200'
                : isHalloween
                ? 'bg-[#291340] border-orange-500/20'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase opacity-60">Input:</span>
            <button
              type="button"
              onClick={() => {
                const nextOrder: ('header' | 'composer' | 'messages')[] = ['header', 'composer', 'messages'];
                update({ composerPosition: 'top', layoutOrder: nextOrder });
              }}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                draftPositions.composerPosition === 'top'
                  ? isCandy
                    ? 'bg-pink-500 text-white font-bold shadow-xs'
                    : 'bg-white text-black font-bold'
                  : 'opacity-70 hover:opacity-100'
              }`}
              title="Position chat composer at the top of workspace"
            >
              <ArrowUp size={12} /> Top
            </button>
            <button
              type="button"
              onClick={() => {
                const nextOrder: ('header' | 'composer' | 'messages')[] = ['header', 'messages', 'composer'];
                update({ composerPosition: 'bottom', layoutOrder: nextOrder });
              }}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                draftPositions.composerPosition === 'bottom'
                  ? isCandy
                    ? 'bg-pink-500 text-white font-bold shadow-xs'
                    : 'bg-white text-black font-bold'
                  : 'opacity-70 hover:opacity-100'
              }`}
              title="Position chat composer docked at the bottom"
            >
              <ArrowDown size={12} /> Bottom
            </button>
            <button
              type="button"
              onClick={() => update({ composerPosition: 'floating' })}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                draftPositions.composerPosition === 'floating'
                  ? isCandy
                    ? 'bg-pink-500 text-white font-bold shadow-xs'
                    : 'bg-white text-black font-bold'
                  : 'opacity-70 hover:opacity-100'
              }`}
              title="Position chat composer as floating overlay"
            >
              <Sparkles size={12} /> Float
            </button>
          </div>

          {/* Width Selector */}
          <div
            className={`flex items-center text-xs rounded-lg p-0.5 border ${
              isCandy
                ? 'bg-slate-50 border-pink-200'
                : isHalloween
                ? 'bg-[#291340] border-orange-500/20'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase opacity-60">Width:</span>
            <button
              type="button"
              onClick={() => update({ messagesWidth: 'compact', composerWidth: 'compact' })}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                draftPositions.messagesWidth === 'compact'
                  ? isCandy
                    ? 'bg-pink-500 text-white font-bold'
                    : 'bg-white text-black font-bold'
                  : 'opacity-70 hover:opacity-100'
              }`}
              title="Compact (640px)"
            >
              <Minimize2 size={12} />
            </button>
            <button
              type="button"
              onClick={() => update({ messagesWidth: 'normal', composerWidth: 'normal' })}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                draftPositions.messagesWidth === 'normal'
                  ? isCandy
                    ? 'bg-pink-500 text-white font-bold'
                    : 'bg-white text-black font-bold'
                  : 'opacity-70 hover:opacity-100'
              }`}
              title="Default (768px)"
            >
              Std
            </button>
            <button
              type="button"
              onClick={() => update({ messagesWidth: 'wide', composerWidth: 'wide' })}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                draftPositions.messagesWidth === 'wide'
                  ? isCandy
                    ? 'bg-pink-500 text-white font-bold'
                    : 'bg-white text-black font-bold'
                  : 'opacity-70 hover:opacity-100'
              }`}
              title="Wide (980px)"
            >
              Wide
            </button>
            <button
              type="button"
              onClick={() => update({ messagesWidth: 'full', composerWidth: 'full' })}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                draftPositions.messagesWidth === 'full'
                  ? isCandy
                    ? 'bg-pink-500 text-white font-bold'
                    : 'bg-white text-black font-bold'
                  : 'opacity-70 hover:opacity-100'
              }`}
              title="Full Width (100%)"
            >
              <Maximize2 size={12} />
            </button>
          </div>

          {/* Alignment Selector */}
          <div
            className={`flex items-center text-xs rounded-lg p-0.5 border ${
              isCandy
                ? 'bg-slate-50 border-pink-200'
                : isHalloween
                ? 'bg-[#291340] border-orange-500/20'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <button
              type="button"
              onClick={() => update({ messagesAlign: 'left', composerAlign: 'left' })}
              className={`p-1 rounded transition-colors cursor-pointer ${
                draftPositions.messagesAlign === 'left'
                  ? isCandy
                    ? 'bg-pink-500 text-white'
                    : 'bg-white text-black'
                  : 'opacity-70 hover:opacity-100'
              }`}
              title="Align Left"
            >
              <AlignLeft size={13} />
            </button>
            <button
              type="button"
              onClick={() => update({ messagesAlign: 'center', composerAlign: 'center' })}
              className={`p-1 rounded transition-colors cursor-pointer ${
                draftPositions.messagesAlign === 'center'
                  ? isCandy
                    ? 'bg-pink-500 text-white'
                    : 'bg-white text-black'
                  : 'opacity-70 hover:opacity-100'
              }`}
              title="Align Center"
            >
              <AlignCenter size={13} />
            </button>
            <button
              type="button"
              onClick={() => update({ messagesAlign: 'right', composerAlign: 'right' })}
              className={`p-1 rounded transition-colors cursor-pointer ${
                draftPositions.messagesAlign === 'right'
                  ? isCandy
                    ? 'bg-pink-500 text-white'
                    : 'bg-white text-black'
                  : 'opacity-70 hover:opacity-100'
              }`}
              title="Align Right"
            >
              <AlignRight size={13} />
            </button>
          </div>

          {/* Reset Defaults Button */}
          <button
            type="button"
            onClick={onReset}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              isCandy
                ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                : 'bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300'
            }`}
            title="Reset positions to default layout"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>

          {/* THE SAVE BUTTON - Requested by user */}
          <button
            type="button"
            onClick={onSave}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
              hasUnsavedChanges
                ? isCandy
                  ? 'bg-pink-600 hover:bg-pink-700 text-white ring-2 ring-pink-400 ring-offset-1 animate-pulse'
                  : isHalloween
                  ? 'bg-orange-600 hover:bg-orange-500 text-black ring-2 ring-orange-400 ring-offset-1 animate-pulse'
                  : 'bg-white hover:bg-zinc-200 text-black ring-2 ring-white/50 ring-offset-1 ring-offset-zinc-900 animate-pulse'
                : isCandy
                ? 'bg-pink-500 hover:bg-pink-600 text-white'
                : isHalloween
                ? 'bg-orange-600 text-black'
                : 'bg-white text-black hover:bg-zinc-200'
            }`}
            title="Save changes to your browser (user side only)"
          >
            <Save size={14} />
            <span>Save</span>
          </button>

          {/* Close/Done button */}
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isCandy
                ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                : 'hover:bg-white/10 text-zinc-400 hover:text-white'
            }`}
            title="Exit Position Editor"
            aria-label="Close Position Editor"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

// In-canvas section positioning handles & guides
interface SectionPositionHandleProps {
  sectionTitle: string;
  sectionKey: 'header' | 'messages' | 'composer';
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  themeMode?: ThemeMode;
  extraControls?: React.ReactNode;
}

export function SectionPositionHandle({
  sectionTitle,
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true,
  themeMode = 'dark',
  extraControls,
}: SectionPositionHandleProps) {
  const isCandy = themeMode === 'candy';

  return (
    <div
      className={`py-1 px-3 mb-1.5 rounded-md text-[11px] font-mono flex items-center justify-between gap-2 border select-none transition-all ${
        isCandy
          ? 'bg-pink-50/80 border-pink-200 text-pink-700'
          : 'bg-white/[0.04] border-white/10 text-zinc-300'
      }`}
    >
      <div className="flex items-center gap-1.5">
        <Layers size={12} className="opacity-70" />
        <span className="font-semibold uppercase tracking-wider">{sectionTitle}</span>
      </div>

      <div className="flex items-center gap-1">
        {extraControls}
        {onMoveUp && (
          <button
            type="button"
            disabled={!canMoveUp}
            onClick={onMoveUp}
            className="p-0.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Move section up"
          >
            <ArrowUp size={12} />
          </button>
        )}
        {onMoveDown && (
          <button
            type="button"
            disabled={!canMoveDown}
            onClick={onMoveDown}
            className="p-0.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Move section down"
          >
            <ArrowDown size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
