import { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES, type LanguageCode } from '../lib/i18n';
import type { Preferences } from '../types';
import { sounds } from '../lib/audio';

interface LanguageDropdownProps {
  preferences: Preferences;
  onSelectLanguage: (code: LanguageCode) => void;
  className?: string;
  compact?: boolean;
}

export function LanguageDropdown({
  preferences,
  onSelectLanguage,
  className = '',
  compact = false,
}: LanguageDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentLangCode: LanguageCode = preferences.language || 'en';
  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === currentLangCode) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (code: LanguageCode) => {
    if (preferences.soundEffects) sounds.playClick();
    onSelectLanguage(code);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-medium text-zinc-200 hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
        title="Change Language (English (US), German, Hindi, Chinese)"
        aria-label="Switch Language"
        aria-expanded={isOpen}
      >
        <Globe size={13} className="text-zinc-400" />
        <span className="text-sm leading-none mr-0.5">{currentLang.flag}</span>
        {!compact && (
          <span className="hidden sm:inline font-sans">{currentLang.name}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-52 rounded-xl bg-[#121212] border border-white/20 shadow-2xl z-50 overflow-hidden py-1 animate-fade-in backdrop-blur-xl">
          <div className="px-3 py-1.5 border-b border-white/10 text-[10px] font-mono uppercase text-zinc-400 font-semibold tracking-wider">
            Languages / भाषाएं / 语言
          </div>
          <div className="py-1">
            {SUPPORTED_LANGUAGES.map(lang => {
              const isSelected = currentLangCode === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-zinc-300 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <div className="flex flex-col">
                      <span className="text-white font-medium">{lang.name}</span>
                      <span className="text-[10px] text-zinc-400">{lang.nativeName}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <Check size={14} className="text-white flex-none" strokeWidth={2.5} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
