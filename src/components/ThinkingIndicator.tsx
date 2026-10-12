import React, { useState, useEffect } from 'react';
import type { ThinkingStyle } from '../types';

type ThinkingProps = {
  style?: ThinkingStyle;
  showTimer?: boolean;
  modelName?: string;
  tokensSaved?: number;
};

export function ThinkingIndicator({
  style = 'minimal',
  showTimer = true,
  modelName = 'VileDocx',
}: ThinkingProps) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const t0 = performance.now();
    const interval = setInterval(() => {
      setSeconds(Number(((performance.now() - t0) / 1000).toFixed(1)));
    }, 100);
    return () => clearInterval(interval);
  }, []);

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
        <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse [animation-delay:0ms] shadow-[0_0_8px_#ff7a00]" />
        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse [animation-delay:200ms] shadow-[0_0_8px_#a855f7]" />
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse [animation-delay:400ms] shadow-[0_0_8px_#10b981]" />
      </div>
    </div>
  );
}
