import { Check, Globe, Sparkles } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getTranslation, type LanguageCode } from '../lib/i18n';
import type { Preferences } from '../types';
import { sounds } from '../lib/audio';

interface LanguagesSettingsTabProps {
  preferences: Preferences;
  setPreferences: (updater: any) => void;
}

export function LanguagesSettingsTab({ preferences, setPreferences }: LanguagesSettingsTabProps) {
  const currentLang: LanguageCode = preferences.language || 'en';
  const t = getTranslation(currentLang);

  const handleSelectLanguage = (code: LanguageCode) => {
    if (code === currentLang) return;
    if (preferences.soundEffects) {
      sounds.playClick();
    }
    const nextPrefs: Preferences = {
      ...preferences,
      language: code,
    };
    if (typeof setPreferences === 'function') {
      try {
        setPreferences((prev: Preferences) => ({
          ...prev,
          language: code,
        }));
      } catch {
        setPreferences(nextPrefs);
      }
    }
    try {
      localStorage.setItem('viledocx:language', code);
    } catch {}
    document.documentElement.lang = code;
    document.body.setAttribute('data-lang', code);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-[11px] font-bold tracking-wider uppercase mb-2">
          <Globe size={13} className="text-indigo-400" />
          <span>{t.tabLanguages}</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          {t.langTabTitle}
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-2xl leading-relaxed">
          {t.langTabSubtitle}
        </p>
      </div>

      {/* Language Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {SUPPORTED_LANGUAGES.map(lang => {
          const isSelected = currentLang === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelectLanguage(lang.code)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between group relative ${
                isSelected
                  ? 'bg-white/10 border-white text-white shadow-lg shadow-white/5 ring-1 ring-white/30'
                  : 'bg-zinc-900/60 border-white/10 hover:border-white/30 hover:bg-white/[0.04] text-zinc-300'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="text-2xl flex-none select-none" role="img" aria-label={lang.name}>
                  {lang.flag}
                </span>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-white group-hover:text-white transition-colors">
                      {lang.name}
                    </span>
                    {lang.code === 'en' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 font-mono">
                        Default
                      </span>
                    )}
                    {lang.fontBadge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                        {lang.fontBadge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-zinc-400 mt-0.5 font-sans">
                    {lang.nativeName} • {lang.region}
                  </span>
                </div>
              </div>

              <div className="flex items-center ml-3 flex-none">
                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center shadow-md">
                    <Check size={14} strokeWidth={3} />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border border-white/20 group-hover:border-white/40 flex items-center justify-center transition-colors" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Font & Typographic Guarantee Notice */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 text-xs text-zinc-300">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Sparkles size={14} className="text-indigo-400" />
          <span>CJK & International Typography System</span>
        </div>
        <p className="text-zinc-400 leading-relaxed text-[11px] sm:text-xs">
          • <strong>Chinese (Simplified)</strong> utilizes authentic CJK typography (<code>Noto Sans SC</code>, <code>PingFang SC</code>, <code>Microsoft YaHei</code>) for razor-sharp rendering of ideograms.<br />
          • <strong>Hindi</strong> utilizes <code>Noto Sans Devanagari</code> for accurate conjuncts, matras, and native character composition.<br />
          • <strong>English (US)</strong> and <strong>German</strong> use crisp modern system geometry with high contrast.
        </p>
      </div>
    </div>
  );
}
