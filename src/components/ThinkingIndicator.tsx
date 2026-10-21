import React, { useState, useEffect } from 'react';
import type { ThinkingStyle, ThemeMode } from '../types';

type ThinkingProps = {
  style?: ThinkingStyle;
  showTimer?: boolean;
  modelName?: string;
  tokensSaved?: number;
  themeMode?: ThemeMode;
};

export function ThinkingIndicator({
  style = 'minimal',
  showTimer = true,
  modelName = 'VileDocx',
  themeMode = 'halloween',
}: ThinkingProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const t0 = performance.now();
    const interval = setInterval(() => {
      setSeconds(Number(((performance.now() - t0) / 1000).toFixed(1)));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  if (themeMode === 'candy') {
    return (
      <div className="candy-thinking my-3 py-2.5 px-4 rounded-2xl bg-white/95 border border-pink-300/80 backdrop-blur-xl shadow-xl shadow-pink-200/40 inline-flex items-center gap-3 select-none text-xs text-slate-800">
        <div className="relative flex items-center justify-center w-7 h-7 rounded-xl bg-pink-100/80 border border-pink-300/60 text-pink-600 flex-none shadow-inner">
          <span className="text-base animate-pulse">🍬</span>
          <span className="absolute -top-1 -right-1 text-[9px] animate-bounce">✨</span>
        </div>
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 tracking-wide font-mono text-[11px]">
              Sweet Thoughts Baking...
            </span>
            {showTimer && (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-pink-100 text-pink-700 border border-pink-200">
                {seconds.toFixed(1)}s
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
            <span>{modelName}</span>
            <span>•</span>
            <span>Whisking sweet intelligence</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 py-0.5 ml-1">
          <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse [animation-delay:0ms] shadow-[0_0_8px_#ec4899]" />
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse [animation-delay:200ms] shadow-[0_0_8px_#fbbf24]" />
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse [animation-delay:400ms] shadow-[0_0_8px_#fb7185]" />
        </div>
      </div>
    );
  }

  if (themeMode === 'dark') {
    return (
      <div className="dark-thinking my-3 py-2.5 px-4 rounded-2xl bg-[#141721]/95 border border-white/15 backdrop-blur-xl shadow-xl shadow-black/60 inline-flex items-center gap-3 select-none text-xs text-zinc-200">
        <div className="relative flex items-center justify-center w-7 h-7 rounded-xl bg-zinc-800/80 border border-white/10 text-white flex-none shadow-inner">
          <span className="text-sm animate-pulse">⚡</span>
          <span className="absolute -top-0.5 -right-0.5 text-[8px] animate-ping text-blue-400">●</span>
        </div>
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white tracking-wide font-mono text-[11px]">
              Neural Synthesis Active...
            </span>
            {showTimer && (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                {seconds.toFixed(1)}s
              </span>
            )}
          </div>
          <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
            <span>{modelName}</span>
            <span>•</span>
            <span>Processing reasoning tokens</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 py-0.5 ml-1">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse [animation-delay:0ms] shadow-[0_0_8px_#60a5fa]" />
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse [animation-delay:200ms] shadow-[0_0_8px_#22d3ee]" />
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse [animation-delay:400ms] shadow-[0_0_8px_#c084fc]" />
        </div>
      </div>
    );
  }

  // Halloween mode default
  return (
    <div className="halloween-thinking my-3 py-2.5 px-4 rounded-2xl bg-[#140824]/90 border border-orange-500/35 backdrop-blur-xl shadow-xl shadow-orange-950/30 inline-flex items-center gap-3 select-none text-xs text-orange-200">
      {/* Animated Mini Spooky Glowing Jack-o'-lantern */}
      <div className="relative flex items-center justify-center w-7 h-7 rounded-xl bg-orange-950/60 border border-orange-500/40 text-orange-400 flex-none shadow-inner">
        <span className="text-base filter drop-shadow-[0_0_8px_rgba(255,120,0,0.9)] animate-pulse">🎃</span>
        <span className="absolute -top-1 -right-1 text-[9px] animate-bounce text-purple-300">👻</span>
      </div>

      {/* Spooky Thinking Message & Dots */}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-orange-100 tracking-wide font-mono text-[11px]">
            Spooky Thoughts Brewing...
          </span>
          {showTimer && (
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
              {seconds.toFixed(1)}s
            </span>
          )}
        </div>
        <span className="text-[10px] text-orange-300/70 font-mono flex items-center gap-1">
          <span>{modelName}</span>
          <span>•</span>
          <span>Stirring the midnight code cauldron</span>
        </span>
      </div>

      {/* Spectral Bubbling Orbs */}
      <div className="flex items-center gap-1.5 py-0.5 ml-1">
        <span className="inline-block w-2 h-2 rounded-full bg-orange-400 animate-pulse [animation-delay:0ms] shadow-[0_0_8px_#ff7a00] flex-none" />
        <span className="inline-block w-2 h-2 rounded-full bg-purple-400 animate-pulse [animation-delay:200ms] shadow-[0_0_8px_#a855f7] flex-none" />
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse [animation-delay:400ms] shadow-[0_0_8px_#10b981] flex-none" />
      </div>
    </div>
  );
}
