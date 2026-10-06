import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Zap,
  Layers,
  Cpu,
  AlertTriangle,
  SlidersHorizontal,
  Terminal,
  Check,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  Hammer,
  KeyRound,
  Database,
  Clock,
  ArrowRight,
  Lock,
  Plus,
  Trash2,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import type { Preferences, MultipleWorkersConfig, BotApiConfig } from '../types';
import {
  WORKER_SPECS,
  WORKERS_LIST,
  getDefaultMultipleWorkersConfig,
  getBotContextLimit,
  PROVIDER_VARIANT_MAP,
  type WorkerRole,
} from '../lib/workerSwarm';

interface MultipleWorkersSettingsTabProps {
  preferences: Preferences;
  onUpdatePreferences: (updater: (prev: Preferences) => Preferences) => void;
  onNavigateToBuild?: () => void;
}

export function MultipleWorkersSettingsTab({
  preferences,
  onUpdatePreferences,
  onNavigateToBuild,
}: MultipleWorkersSettingsTabProps) {
  const config: MultipleWorkersConfig = {
    ...getDefaultMultipleWorkersConfig(),
    ...(preferences.multipleWorkers || {}),
  };

  const [activeWorkerPreview, setActiveWorkerPreview] = useState<WorkerRole>('watchman');
  const [testingSwarm, setTestingSwarm] = useState(false);
  const [testLog, setTestLog] = useState<{ worker: string; text: string; role: WorkerRole; model?: string }[]>([]);

  // Key Pool Raw Text State
  const [poolInput, setPoolInput] = useState<string>((config.keyPool || []).join('\n') || '');
  const [showKeyPoolHelp, setShowKeyPoolHelp] = useState(false);

  useEffect(() => {
    setPoolInput((config.keyPool || []).join('\n') || '');
  }, [config.keyPool]);

  const updateConfig = (patch: Partial<MultipleWorkersConfig>) => {
    onUpdatePreferences(prev => ({
      ...prev,
      multipleWorkers: {
        ...getDefaultMultipleWorkersConfig(),
        ...(prev.multipleWorkers || {}),
        ...patch,
      },
    }));
  };

  const handleUpdateBotKey = (role: WorkerRole, apiKey: string) => {
    const currentConfigs: Partial<Record<string, BotApiConfig>> = { ...(config.botApiConfigs || {}) };
    currentConfigs[role] = {
      ...(currentConfigs[role] || {}),
      apiKey: apiKey,
    };
    updateConfig({ botApiConfigs: currentConfigs });
  };

  const handleApplyKeyPool = (text: string) => {
    setPoolInput(text);
    const keys = text
      .split(/[\n,;]+/)
      .map(k => k.trim())
      .filter(k => k.length > 5);
    updateConfig({ keyPool: keys });
  };

  const handleAutoDistributeKeys = () => {
    const keys = (config.keyPool || []).filter(k => k.trim().length > 0);
    if (keys.length === 0) return;

    const allRoles: WorkerRole[] = [
      'architect',
      'logic',
      'security',
      'optimizer',
      'critic',
      'synthesizer',
      'watchman',
    ];

    const newConfigs: Partial<Record<string, BotApiConfig>> = { ...(config.botApiConfigs || {}) };
    allRoles.forEach((role, idx) => {
      newConfigs[role] = {
        ...(newConfigs[role] || {}),
        apiKey: keys[idx % keys.length],
      };
    });

    updateConfig({
      apiMode: 'dedicated',
      botApiConfigs: newConfigs,
    });
  };

  const handleRunTestSimulation = () => {
    if (testingSwarm) return;
    setTestingSwarm(true);
    setTestLog([]);

    const steps: { worker: string; text: string; role: WorkerRole; delay: number; model: string }[] = [
      {
        worker: 'Worker 1: Architect (NEXUS-ARCH)',
        text: 'Addressing Worker 2 (Logic) & WATCHMAN: Deconstructing requirements into decoupled state machine and type interfaces. Blueprint established.',
        role: 'architect',
        model: config.useModelVariants ? 'gemini-4 / gpt-6-luna / claude-5-5-sonnet (Variant)' : 'Primary Model',
        delay: 550,
      },
      {
        worker: 'Worker 2: Logic Engine (CORE-ALGO)',
        text: 'Responding to Worker 1: Accepted interfaces. Formulating non-blocking reactive pipelines and computational state transformations.',
        role: 'logic',
        model: config.useModelVariants ? 'gemini-4 / gpt-6-luna / claude-5-5-sonnet (Variant)' : 'Primary Model',
        delay: 1200,
      },
      {
        worker: 'Worker 3: Security Sentinel (AEGIS-SEC)',
        text: 'Alerting Worker 2 & WATCHMAN: Security audit identified 2 untrusted parameter points. Mandating defensive sanitization and boundary error catches.',
        role: 'security',
        model: config.useModelVariants ? 'gemini-4 / gpt-6-luna / claude-5-5-sonnet (Variant)' : 'Primary Model',
        delay: 1850,
      },
      {
        worker: 'Worker 4: Optimizer (PRUNE-SYNTAX)',
        text: 'Speaking to Worker 5 & Swarm: Stripping redundant abstractions and runtime boilerplate. Enforcing zero-bloat typed signatures.',
        role: 'optimizer',
        model: config.useModelVariants ? 'gemini-4 / gpt-6-luna / claude-5-5-sonnet (Variant)' : 'Primary Model',
        delay: 2500,
      },
      {
        worker: 'Worker 5: Critic & Adversary (ADVERSARY-X)',
        text: 'ADVERSARIAL CHALLENGE to Worker 2 & 3: What happens on race condition failure? Mandating atomic state lock before execution.',
        role: 'critic',
        model: config.useModelVariants ? 'gemini-4 / gpt-6-luna / claude-5-5-sonnet (Variant)' : 'Primary Model',
        delay: 3150,
      },
      {
        worker: 'Worker 6: Synthesizer (HARMONY-SYNC)',
        text: 'SYNTHESIS TO WATCHMAN: Reconciled Critic’s race-condition objection with atomic guard. All 5 workers in unanimous consensus. Blueprint ready.',
        role: 'synthesizer',
        model: config.useModelVariants ? 'gemini-4 / gpt-6-luna / claude-5-5-sonnet (Variant)' : 'Primary Model',
        delay: 3800,
      },
      {
        worker: 'WATCHMAN (Supreme Arbiter & Final Decider)',
        text: 'WATCHMAN TO SWARM: Review complete. Nexus-Arch scaffolding ratified, Core-Algo logic approved, Aegis-Sec security validated. Watchman authoring definitive production-grade code now.',
        role: 'watchman',
        model: 'Flagship Reasoner (gemini-4-argon / gpt-6.1-sol / claude-fable-5-1)',
        delay: 4500,
      },
    ];

    steps.forEach(({ worker, text, role, delay, model }) => {
      setTimeout(() => {
        setTestLog(prev => [...prev, { worker, text, role, model }]);
        setActiveWorkerPreview(role);
        if (role === 'watchman') {
          setTestingSwarm(false);
        }
      }, delay);
    });
  };

  const allRoles: WorkerRole[] = [
    'architect',
    'logic',
    'security',
    'optimizer',
    'critic',
    'synthesizer',
    'watchman',
  ];

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#0d0d0d] border border-white/15 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="px-3 py-1 rounded text-xs font-mono font-bold tracking-wider uppercase bg-white/10 text-white border border-white/20 inline-flex items-center gap-1.5 shadow-sm">
                <Users size={13} className="text-white" />
                ALPHA TESTING
              </span>
              <span className="px-3 py-1 rounded text-xs font-mono font-semibold uppercase bg-white/10 text-white border border-white/20 inline-flex items-center gap-1.5">
                <Hammer size={12} className="text-white" />
                Exclusive to Build Mode
              </span>
              <span className="px-3 py-1 rounded text-xs font-mono font-semibold uppercase bg-white/10 text-white border border-white/20 inline-flex items-center gap-1.5">
                <Clock size={12} className="text-white" />
                30m - 1hr Longevity Engine
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              MULTIPLE WORKERS SWARM & WATCHMAN ARBITER
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl mt-1.5 leading-relaxed">
              Autonomous bots communicate with each other in an active debate and report directly to the{' '}
              <b>WATCHMAN</b>. Uses smart rate-limit model splitting so a single API can endure{' '}
              <b>30 to 60+ minutes of continuous heavy coding</b> without hitting rate limit ceilings.
            </p>
          </div>

          {/* Master Toggle Button */}
          <div className="flex flex-col items-start sm:items-end gap-2 flex-none">
            <button
              type="button"
              onClick={() => updateConfig({ enabled: !config.enabled })}
              className={`playful-pop px-5 py-2.5 rounded-2xl font-bold text-xs tracking-wider uppercase flex items-center gap-2.5 shadow-lg transition-all cursor-pointer ${
                config.enabled
                  ? 'bg-white hover:bg-zinc-200 text-black'
                  : 'bg-white/[0.08] hover:bg-white/[0.14] text-white/80 border border-white/[0.12]'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  config.enabled ? 'bg-black animate-pulse' : 'bg-white/40'
                }`}
              />
              <span>{config.enabled ? 'Swarm Enabled' : 'Swarm Disabled'}</span>
            </button>
            <span className="text-[11px] font-mono text-zinc-400">
              Status: {config.enabled ? 'Active Inter-Bot Deliberation' : 'Single Direct Model'}
            </span>
          </div>
        </div>

        {/* Quick Launch link */}
        {onNavigateToBuild && (
          <div className="mt-4 pt-4 border-t border-white/[0.08] flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="text-zinc-400">
              Ready to code with the Swarm? Launch Build Mode anytime to see live worker debates.
            </span>
            <button
              type="button"
              onClick={onNavigateToBuild}
              className="text-white hover:text-zinc-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Go to Build Mode</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================
          API DISTRIBUTION STRATEGY: SINGLE API vs DEDICATED BOT KEYS
          ======================================================== */}
      <section className="rounded-2xl bg-[#0a0a0a] border border-white/10 p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <KeyRound size={16} className="text-white" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              SWARM API DISTRIBUTION & KEY ROTATION STRATEGY
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-200 bg-white/10 border border-white/20 px-2.5 py-0.5 rounded-full">
            {config.apiMode === 'dedicated' ? '🔑 Dedicated Bot API Mode' : '⚡ Single Shared API Mode'}
          </span>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Mode 1: Single Shared API */}
          <div
            onClick={() => updateConfig({ apiMode: 'single' })}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${
              config.apiMode === 'single'
                ? 'border-white bg-white/10 shadow-lg'
                : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.18]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>1. Single Shared API Key</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/20 text-white border border-white/30">
                  Recommended
                </span>
              </span>
              <input
                type="radio"
                name="apiMode"
                value="single"
                checked={config.apiMode === 'single'}
                onChange={() => updateConfig({ apiMode: 'single' })}
                className="accent-white cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Splits <b>one single API key</b> across all bots by assigning fast, rate-friendly model
              variants (e.g. Gemini Flash / GPT-4o Mini) to Workers 1-6, while WATCHMAN uses the primary
              model. Saves ~85% of rate limit tokens to last <b>30 to 60+ minutes</b> of heavy coding.
            </p>
          </div>

          {/* Mode 2: Dedicated Bot API Keys */}
          <div
            onClick={() => updateConfig({ apiMode: 'dedicated' })}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${
              config.apiMode === 'dedicated'
                ? 'border-white bg-white/10 shadow-lg'
                : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.18]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>2. Dedicated Bot API Keys</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/20">
                  Power Users
                </span>
              </span>
              <input
                type="radio"
                name="apiMode"
                value="dedicated"
                checked={config.apiMode === 'dedicated'}
                onChange={() => updateConfig({ apiMode: 'dedicated' })}
                className="accent-white cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Give each bot its own dedicated API key. <b>Supports different API keys from the SAME provider</b> (e.g. multiple free Gemini keys or multiple Groq keys) so your rate limits are distributed across keys.
            </p>
          </div>
        </div>

        {/* Single API Mode Features: Model Variants & Key Pool */}
        {config.apiMode === 'single' && (
          <div className="p-4 rounded-xl bg-[#141414] border border-white/10 space-y-3.5">
            {/* Model Variant Splitting Toggle */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Zap size={14} className="text-white" />
                  <span>Smart Model Variant Splitting (Preserves Quota for 30m - 1hr)</span>
                </span>
                <p className="text-[11px] text-zinc-400">
                  Routes inter-worker debates to high-throughput flash/mini variants, reserving your quota for the WATCHMAN's definitive code authoring.
                </p>
              </div>
              <input
                type="checkbox"
                checked={Boolean(config.useModelVariants ?? true)}
                onChange={e => updateConfig({ useModelVariants: e.target.checked })}
                className="accent-amber-500 cursor-pointer w-4 h-4"
              />
            </div>

            {/* Cost-Saving Model Tier Selector */}
            <div className="pt-2 space-y-1.5">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <label className="text-xs font-bold text-white block">
                  Latest Cost-Saving Model Tier:
                </label>
                <span className="text-[10px] font-mono text-emerald-400">
                  {config.costSavingTier === 'ultra'
                    ? '⚡ Ultra Cost-Saving (95% Savings · Flash-Lite / Mini / Haiku / Codestral)'
                    : config.costSavingTier === 'balanced'
                    ? '⚖️ Balanced (Cost-Saving Workers + o3-mini/Pro Watchman)'
                    : '💎 Flagship (Primary Configured Model)'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
                {[
                  {
                    id: 'ultra',
                    label: 'Ultra Cost-Saving',
                    desc: 'Latest Flash-Lite, Mini, Haiku, Codestral & DeepSeek',
                    badge: 'Max Savings',
                  },
                  {
                    id: 'balanced',
                    label: 'Balanced',
                    desc: 'Flash Workers + o3-mini/Pro Watchman',
                    badge: 'High Value',
                  },
                  {
                    id: 'flagship',
                    label: 'Flagship Only',
                    desc: 'Uses user’s primary selected model for all bots',
                    badge: 'Unthrottled',
                  },
                ].map(tier => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => updateConfig({ costSavingTier: tier.id as any })}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      config.costSavingTier === tier.id
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-sm'
                        : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] text-[#869abf]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold">{tier.label}</span>
                      <span className="text-[9px] font-mono px-1 rounded bg-black/40 text-emerald-300">
                        {tier.badge}
                      </span>
                    </div>
                    <span className="text-[10px] block opacity-80 leading-tight">
                      {tier.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Same Provider Multi-Key Rotation Pool */}
            <div className="pt-3 border-t border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Database size={13} className="text-cyan-400" />
                  <span>Same-Provider Multi-Key Rotation Pool (Optional)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowKeyPoolHelp(prev => !prev)}
                  className="text-[11px] text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle size={12} />
                  <span>How does this work?</span>
                </button>
              </div>

              {showKeyPoolHelp && (
                <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-[11px] text-cyan-200 leading-relaxed space-y-1">
                  <p>
                    <b>Have multiple keys for the same provider?</b> If you have 2, 3, or more free API keys (e.g. from Google AI Studio, Groq, or OpenRouter), paste them below separated by newlines.
                  </p>
                  <p>
                    The Swarm will automatically rotate requests across all your keys during inter-worker deliberation, multiplying your rate-limit headroom by 2x to 5x!
                  </p>
                </div>
              )}

              <textarea
                rows={2}
                value={poolInput}
                onChange={e => handleApplyKeyPool(e.target.value)}
                placeholder="Paste extra keys for the same provider (one per line or comma-separated)…"
                className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 transition-colors"
              />

              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>
                  Active Keys in Pool: <b>{(config.keyPool || []).length} keys</b>
                </span>
                {(config.keyPool || []).length > 0 && (
                  <button
                    type="button"
                    onClick={handleAutoDistributeKeys}
                    className="text-white hover:underline font-bold cursor-pointer"
                  >
                    Switch to Dedicated Mode & Auto-Assign Keys →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Dedicated Bot API Keys Configuration Grid */}
        {config.apiMode === 'dedicated' && (
          <div className="p-4 rounded-xl bg-[#141414] border border-white/10 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="text-xs font-bold text-white block">
                  Per-Bot API Key Assignment (Same Provider Multiple Keys Allowed)
                </span>
                <span className="text-[11px] text-zinc-400">
                  Assign unique API keys to each bot. You can use different keys from the SAME provider to spread rate limits!
                </span>
              </div>

              {(config.keyPool || []).length > 0 && (
                <button
                  type="button"
                  onClick={handleAutoDistributeKeys}
                  className="playful-pop px-3 py-1 rounded-lg text-xs font-mono font-bold bg-white/10 text-white border border-white/20 hover:bg-white/20 cursor-pointer"
                >
                  Auto-Distribute from Key Pool
                </button>
              )}
            </div>

            <div className="space-y-2 pt-1 max-h-80 overflow-y-auto pr-1">
              {allRoles.map(role => {
                const spec = WORKER_SPECS[role];
                const isWatchman = role === 'watchman';
                const botKey = config.botApiConfigs?.[role]?.apiKey || '';

                return (
                  <div
                    key={role}
                    className={`p-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                      isWatchman
                        ? 'bg-white/10 border-white/30 text-white'
                        : 'bg-white/[0.02] border-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-[170px]">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-none"
                        style={{ backgroundColor: spec.color }}
                      />
                      <div>
                        <b className="text-xs text-white block leading-tight">{spec.name}</b>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {spec.codename}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="password"
                        value={botKey}
                        onChange={e => handleUpdateBotKey(role, e.target.value)}
                        placeholder={`Paste key for ${spec.codename} (or leave blank to use primary)`}
                        className="w-full px-3 py-1.5 rounded-lg bg-black border border-white/15 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-white/40"
                      />
                      {botKey ? (
                        <span className="text-[10px] font-mono text-white flex items-center gap-1 flex-none">
                          <CheckCircle2 size={12} className="text-white" /> Key Set
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-zinc-500 flex-none">
                          Uses Primary
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ========================================================
          SWARM DELIBERATION DEPTH & LONGEVITY SETTINGS
          ======================================================== */}
      <section className="rounded-2xl bg-[#0a0a0a] border border-white/10 p-5 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-white" />
          Swarm Deliberation & Longevity Controls
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {/* Deliberation Depth */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
            <label className="text-xs font-bold text-white block">Deliberation Depth</label>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Controls how many workers debate in the sequence before handing off to WATCHMAN.
            </p>
            <div className="grid grid-cols-3 gap-1 pt-1">
              {(['fast', 'deep', 'exhaustive'] as const).map(depth => (
                <button
                  key={depth}
                  type="button"
                  onClick={() => updateConfig({ deliberationDepth: depth })}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    config.deliberationDepth === depth
                      ? 'bg-white text-black font-bold shadow'
                      : 'bg-white/[0.05] hover:bg-white/[0.08] text-zinc-400'
                  }`}
                >
                  {depth}
                </button>
              ))}
            </div>
            <span className="text-[10px] font-mono text-zinc-400 block pt-1">
              {config.deliberationDepth === 'fast'
                ? '⚡ 3 Key Workers (Fastest & Thrifty)'
                : config.deliberationDepth === 'deep'
                ? '✓ All 6 Workers Round-Robin'
                : '🔬 Exhaustive Multi-Turn Debate'}
            </span>
          </div>

          {/* Session Longevity Mode */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
            <label className="text-xs font-bold text-white block">Rate-Limit Longevity Mode</label>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Paces and buffers requests to keep the API alive for long continuous coding sessions.
            </p>
            <div className="grid grid-cols-2 gap-1 pt-1">
              {(
                [
                  { id: 'endurance_1hr', label: '1-Hr Endurance' },
                  { id: 'standard', label: 'Standard' },
                ] as const
              ).map(mode => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => updateConfig({ longevityMode: mode.id as any })}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    config.longevityMode === mode.id
                      ? 'bg-white text-black font-bold shadow'
                      : 'bg-white/[0.05] hover:bg-white/[0.08] text-zinc-400'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            <span className="text-[10px] font-mono text-zinc-300 block pt-1">
              {config.longevityMode === 'endurance_1hr'
                ? '✓ Engineered for 30m - 1hr sessions'
                : 'Balanced pacing'}
            </span>
          </div>

          {/* Per-Bot Context Limit */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white">Bot Context Limit (Global Baseline)</label>
              <span className="text-xs font-mono font-bold text-white">
                {config.botContextLimit || 250}t
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Strictly isolates context per bot so a single API key never blows through rate limits.
              Each bot also receives its own separate override below — the WATCHMAN keeps a dedicated
              larger window for final code synthesis regardless of this slider.
            </p>
            <input
              type="range"
              min={150}
              max={600}
              step={50}
              value={config.botContextLimit || 250}
              onChange={e => updateConfig({ botContextLimit: Number(e.target.value) })}
              className="w-full accent-white cursor-pointer pt-1"
            />

            {/* Separate per-bot context limit sliders (SWARM FIX V3_SF_02) */}
            <div className="pt-2 mt-1 border-t border-white/[0.06] space-y-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                Separate Per-Bot Context Budgets
              </span>
              {[...WORKERS_LIST, WORKER_SPECS.watchman].map(worker => {
                const effective = getBotContextLimit(worker.id, config);
                return (
                  <div key={worker.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-zinc-200 truncate pr-2">
                        W{worker.number} · {worker.codename}
                      </label>
                      <span className="text-[11px] font-mono font-bold text-white whitespace-nowrap">
                        {effective}t
                      </span>
                    </div>
                    <input
                      type="range"
                      min={worker.id === 'watchman' ? 1024 : 100}
                      max={worker.id === 'watchman' ? 8192 : 600}
                      step={worker.id === 'watchman' ? 256 : 20}
                      value={effective}
                      onChange={e =>
                        updateConfig({
                          botContextLimits: {
                            ...(config.botContextLimits || {}),
                            [worker.id]: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full accent-white cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
            <span className="text-[10px] font-mono text-zinc-300 block">
              ✓ Single-API Rate Shield Active · Limits enforced per bot at API level
            </span>
          </div>

          {/* Auto WATCHMAN Fallback */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white">WATCHMAN Fallback</label>
              <input
                type="checkbox"
                checked={Boolean(config.autoWatchmanFallback ?? true)}
                onChange={e => updateConfig({ autoWatchmanFallback: e.target.checked })}
                className="accent-white cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              If any worker encounters an API rate limit (429) or network blip, WATCHMAN automatically steps in as fallback!
            </p>
            <span className="text-[10px] font-mono text-zinc-300 block">
              {config.autoWatchmanFallback ? '✓ High-reliability guaranteed' : 'Strict consensus'}
            </span>
          </div>
        </div>
      </section>

      {/* Swarm Roster (6 Workers + WATCHMAN) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              SWARM HIERARCHY & INTER-BOT COMMUNICATION NETWORK
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            Active Multi-Agent Topology
          </span>
        </div>

        {/* The 6 Workers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {WORKERS_LIST.map(worker => {
            const isSelected = activeWorkerPreview === worker.id;
            return (
              <div
                key={worker.id}
                onClick={() => setActiveWorkerPreview(worker.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden bg-[#0d0d0d] ${
                  isSelected
                    ? 'border-white/40 shadow-lg scale-[1.01]'
                    : 'border-white/[0.08] hover:border-white/[0.18]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono bg-white text-black"
                    >
                      W{worker.number}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">
                        {worker.name}
                      </h4>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {worker.codename}
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold bg-white/10 text-white border border-white/20"
                  >
                    {worker.badge}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed line-clamp-2">
                  {worker.specialty}
                </p>
                <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span>Talks to: {worker.recipient}</span>
                  <span className="text-white">Active</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* The 7th Bot: WATCHMAN Supreme Arbiter Card */}
        <div
          onClick={() => setActiveWorkerPreview('watchman')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden shadow-xl bg-[#0d0d0d] ${
            activeWorkerPreview === 'watchman'
              ? 'border-white/40 shadow-white/5'
              : 'border-white/20 hover:border-white/40'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-md flex-none">
                <Terminal size={20} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-extrabold text-white tracking-tight">
                    {WORKER_SPECS.watchman.name}
                  </h4>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-white text-black shadow-sm">
                    LAST FALLBACK BOT & SUPREME DECIDER
                  </span>
                </div>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed max-w-2xl">
                  Standing directly between all 6 worker bots, the <b>WATCHMAN</b> supervises their
                  arguments, arbitrates decisions, addresses the workers with binding verdicts, acts as the ultimate fallback, and generates the definitive code.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-white bg-white/10 border border-white/20 px-3 py-1 rounded-xl self-start sm:self-center whitespace-nowrap">
              👑 Chief Arbiter
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Swarm Deliberation Test Simulator */}
      <section className="rounded-2xl bg-[#0a0a0a] border border-white/10 p-5 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Sparkles size={14} className="text-white" />
              Interactive Swarm Communication Simulator
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Simulate how the 6 autonomous workers interact with each other and talk to the WATCHMAN in real-time.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRunTestSimulation}
            disabled={testingSwarm}
            className={`playful-pop px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-all active:scale-95 ${
              testingSwarm
                ? 'bg-white/10 border border-white/20 text-zinc-400 cursor-wait'
                : 'bg-white hover:bg-zinc-200 text-black shadow-md shadow-white/10'
            }`}
          >
            {testingSwarm ? (
              <>
                <RotateCcw size={13} className="animate-spin text-black" />
                <span>Simulating Inter-Bot Dialogue...</span>
              </>
            ) : (
              <>
                <Play size={13} />
                <span>Test Swarm Dialogue</span>
              </>
            )}
          </button>
        </div>

        {/* Live Simulation Output Feed */}
        {testLog.length > 0 && (
          <div className="mt-3 p-3.5 rounded-xl bg-[#050505] border border-white/10 space-y-2 max-h-72 overflow-y-auto font-mono text-xs">
            {testLog.map((entry, idx) => {
              const spec = WORKER_SPECS[entry.role];
              const isWatchman = entry.role === 'watchman';
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition-all ${
                    isWatchman
                      ? 'bg-white/10 border-white/30 text-white'
                      : 'bg-[#121212] border-white/10 text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                    <span
                      className="font-bold text-[11px] uppercase tracking-wide flex items-center gap-1.5 text-white"
                    >
                      <span>{entry.worker}</span>
                    </span>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-zinc-400 px-1.5 py-0.5 rounded bg-white/[0.06]">
                        {entry.model}
                      </span>
                      <span className="text-zinc-500">Step {idx + 1}/7</span>
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed font-sans text-zinc-300">{entry.text}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
