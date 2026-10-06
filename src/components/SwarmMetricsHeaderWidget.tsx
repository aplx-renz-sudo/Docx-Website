import React, { useState, useEffect, useId } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  Play,
  RotateCcw,
  Sparkles,
  Users,
  X,
  Zap,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Info,
} from 'lucide-react';
import {
  getLatestSwarmTelemetry,
  subscribeSwarmTelemetry,
  runSwarmDiagnosticPing,
  type SwarmSessionTelemetry,
  type WorkerTelemetryMetric,
} from '../lib/swarmTelemetry';
import { WORKER_SPECS, type WorkerRole } from '../lib/workerSwarm';
import type { ProviderConfig } from '../lib/credential';
import type { Preferences } from '../types';

interface SwarmMetricsHeaderWidgetProps {
  providerConfig: ProviderConfig;
  preferences?: Preferences;
  onUpdatePreferences?: (updater: (prev: Preferences) => Preferences) => void;
  onOpenSettings?: () => void;
}

export function SwarmMetricsHeaderWidget({
  providerConfig,
  preferences,
  onUpdatePreferences,
  onOpenSettings,
}: SwarmMetricsHeaderWidgetProps) {
  const [telemetry, setTelemetry] = useState<SwarmSessionTelemetry>(() => getLatestSwarmTelemetry());
  const [isOpen, setIsOpen] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [activeTab, setActiveTab] = useState<'metrics' | 'diagnostics'>('metrics');

  const modalTitleId = useId();

  useEffect(() => {
    return subscribeSwarmTelemetry(updated => {
      setTelemetry({ ...updated });
    });
  }, []);

  const handleRunPing = async () => {
    if (isPinging) return;
    setIsPinging(true);
    try {
      await runSwarmDiagnosticPing(providerConfig);
    } finally {
      setIsPinging(false);
    }
  };

  const handleToggleFastMode = () => {
    if (!onUpdatePreferences) return;
    onUpdatePreferences(prev => {
      const currentDepth = prev.multipleWorkers?.deliberationDepth || 'deep';
      const newDepth = currentDepth === 'fast' ? 'deep' : 'fast';
      return {
        ...prev,
        multipleWorkers: {
          ...(prev.multipleWorkers || {
            enabled: true,
            deliberationDepth: 'deep',
            showDeliberationStream: true,
            autoWatchmanFallback: true,
            activeWorkerCount: 6,
            apiMode: 'single',
            useModelVariants: true,
            costSavingTier: 'ultra',
            longevityMode: 'endurance_1hr',
            botApiConfigs: {},
            keyPool: [],
          }),
          deliberationDepth: newDepth,
        },
      };
    });
  };

  const workersList = Object.values(telemetry.workerMetrics);
  const isRunning = telemetry.status === 'running' || isPinging;
  const isSwarmEnabled = preferences?.multipleWorkers?.enabled ?? true;
  const depth = preferences?.multipleWorkers?.deliberationDepth || 'deep';

  // Compute maximum response time to normalize the latency bars
  const maxLatency = Math.max(1, ...workersList.map(w => w.responseTimeMs));

  return (
    <>
      {/* HEADER COMPACT TRIGGER WIDGET */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`group relative inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer shadow-sm ${
          isRunning
            ? 'bg-amber-950/40 border-amber-500/40 text-amber-200 animate-pulse'
            : telemetry.diagnostics.erraticRiskLevel === 'High (Alpha Anomaly)' ||
              telemetry.diagnostics.erraticRiskLevel === 'Severe Jitter'
            ? 'bg-[#18120e] border-amber-600/30 hover:border-amber-500/60 text-zinc-200'
            : 'bg-[#121212] border-white/15 hover:border-white/35 text-zinc-200 hover:text-white'
        }`}
        title="Swarm Mode V3 Alpha Telemetry & Performance Dashboard (Click to inspect real-time worker latency)"
        aria-label="Swarm Mode Live Telemetry Dashboard"
      >
        {/* Pulsing Status Dot */}
        <span className="relative flex h-2 w-2">
          {isRunning && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isRunning
                ? 'bg-amber-400'
                : telemetry.usedFallback
                ? 'bg-rose-500'
                : 'bg-emerald-400'
            }`}
          />
        </span>

        <div className="flex items-center gap-1.5 leading-none">
          <Users size={12} className="text-zinc-400 group-hover:text-white" />
          <span className="font-bold text-[11px] tracking-tight">Swarm</span>
          <span className="text-[10px] px-1 py-0.2 rounded bg-white/10 text-zinc-300 font-sans font-medium uppercase tracking-wider">
            Alpha
          </span>
        </div>

        {/* Real-time Response Time Snippet */}
        <div className="hidden lg:flex items-center gap-1 pl-1 border-l border-white/15 text-[10px] text-zinc-400 font-sans">
          {isRunning ? (
            <span className="text-amber-300 font-mono animate-pulse">Running...</span>
          ) : (
            <span>
              <strong className="text-zinc-200 font-mono">{telemetry.averageResponseTimeMs}ms</strong> avg
              {telemetry.diagnostics.jitterPercent > 0 && (
                <span className="text-zinc-500 ml-1">±{telemetry.diagnostics.jitterPercent}%</span>
              )}
            </span>
          )}
        </div>
      </button>

      {/* DETAILED TELEMETRY DASHBOARD MODAL */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={modalTitleId}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-3xl bg-[#0a0a0a] border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-zinc-200 font-sans"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-white/10 bg-[#121212] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                  <Activity size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 id={modalTitleId} className="text-sm sm:text-base font-bold text-white tracking-tight">
                      Swarm Mode Telemetry & Jitter Matrix
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-white/10 text-zinc-300 border border-white/10">
                      V3 Alpha
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Real-time worker response times & deliberation stability diagnostics
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close telemetry modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sub-Header Tabs & Quick Actions */}
            <div className="px-5 py-2.5 bg-[#0d0d0d] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#141414] border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('metrics')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    activeTab === 'metrics'
                      ? 'bg-white text-black shadow font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Worker Latency Matrix
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('diagnostics')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'diagnostics'
                      ? 'bg-white text-black shadow font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <AlertTriangle size={12} className={activeTab === 'diagnostics' ? 'text-black' : 'text-amber-400'} />
                  <span>Why Swarm Is Erratic</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRunPing}
                  disabled={isPinging}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-white font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  title="Run live latency benchmark against your active provider across all worker slots"
                >
                  <Play size={12} className={isPinging ? 'animate-spin' : ''} />
                  <span>{isPinging ? 'Pinging Workers...' : 'Benchmark Ping'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleFastMode}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 hover:text-white font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Toggle Deliberation Depth between Deep (6 workers) and Fast (3 workers)"
                >
                  <Zap size={12} className="text-amber-400" />
                  <span>Depth: <strong className="text-white capitalize">{depth}</strong></span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Top Metrics High-Level Overview Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#141414] border border-white/10">
                  <div className="text-zinc-400 text-[11px] mb-1 font-sans">Avg Worker Latency</div>
                  <div className="text-lg font-bold text-white flex items-center gap-1.5">
                    <span>{telemetry.averageResponseTimeMs}ms</span>
                    <Clock size={14} className="text-zinc-400" />
                  </div>
                  <div className="text-[10px] text-zinc-500 font-sans mt-0.5">
                    {telemetry.totalDurationMs > 0 ? `${(telemetry.totalDurationMs / 1000).toFixed(2)}s total session` : 'Zero delay'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#141414] border border-white/10">
                  <div className="text-zinc-400 text-[11px] mb-1 font-sans">Latency Jitter</div>
                  <div className="text-lg font-bold text-amber-300 flex items-center gap-1.5">
                    <span>±{telemetry.diagnostics.jitterPercent}%</span>
                    <TrendingDown size={14} />
                  </div>
                  <div className="text-[10px] text-zinc-500 font-sans mt-0.5">
                    {telemetry.diagnostics.erraticRiskLevel}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#141414] border border-white/10">
                  <div className="text-zinc-400 text-[11px] mb-1 font-sans">Fastest Worker</div>
                  <div className="text-sm font-bold text-emerald-400 truncate mt-1">
                    {telemetry.diagnostics.fastestWorker?.name.split(':')[1] || 'Architect'}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-sans mt-0.5">
                    {telemetry.diagnostics.fastestWorker?.latencyMs || 120}ms response
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#141414] border border-white/10">
                  <div className="text-zinc-400 text-[11px] mb-1 font-sans">Bottleneck Node</div>
                  <div className="text-sm font-bold text-rose-400 truncate mt-1">
                    {telemetry.diagnostics.slowestWorker?.name.split(':')[1] || 'Optimizer'}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-sans mt-0.5">
                    {telemetry.diagnostics.slowestWorker?.latencyMs || 440}ms (Throttled)
                  </div>
                </div>
              </div>

              {/* TAB 1: WORKER LATENCY MATRIX */}
              {activeTab === 'metrics' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Active Worker Nodes & Turn Delays</span>
                    <span className="text-zinc-400 font-mono text-[11px]">Normalized by max latency</span>
                  </div>

                  <div className="space-y-2.5">
                    {workersList.map(worker => {
                      const spec = WORKER_SPECS[worker.role];
                      const pct = Math.min(100, Math.max(8, Math.round((worker.responseTimeMs / maxLatency) * 100)));
                      const isWatchman = worker.role === 'watchman';

                      return (
                        <div
                          key={worker.role}
                          className={`p-3 rounded-xl border transition-all ${
                            telemetry.activeWorkerRole === worker.role
                              ? 'bg-[#181818] border-amber-500/50 shadow-md shadow-amber-500/5'
                              : 'bg-[#121212] border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: spec.color }}
                              />
                              <span className="text-xs font-bold text-white">{worker.name}</span>
                              <span className="text-[10px] font-mono text-zinc-400">({worker.codename})</span>
                              {isWatchman && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  CHIEF ARBITER
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-xs font-mono">
                              <span
                                className={`font-bold ${
                                  worker.responseTimeMs > 450
                                    ? 'text-rose-400'
                                    : worker.responseTimeMs > 250
                                    ? 'text-amber-300'
                                    : 'text-emerald-400'
                                }`}
                              >
                                {worker.responseTimeMs}ms
                              </span>
                              <span className="text-[10px] text-zinc-500 font-sans">
                                {worker.tokensAllocated} tokens
                              </span>
                            </div>
                          </div>

                          {/* Latency Progress Bar */}
                          <div className="w-full h-1.5 bg-black rounded-full overflow-hidden mb-1.5">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: spec.color,
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-zinc-400">
                            <span className="truncate max-w-[400px]">
                              {worker.note || `Deliberating to ${worker.recipient || 'Swarm'}...`}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono truncate ml-2">
                              {worker.modelUsed || providerConfig.model}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: WHY SWARM IS ERRATIC (ALPHA DIAGNOSTIC SECTION) */}
              {activeTab === 'diagnostics' && (
                <div className="space-y-4 animate-fade-in">
                  {/* Warning Callout Box */}
                  <div className="p-4 rounded-xl bg-[#16120c] border border-amber-500/30 text-amber-200 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                      <ShieldAlert size={16} />
                      <span>V3 Alpha Notice: Why Swarm Behavior Might Be Erratic</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      In the current Alpha release, multiple autonomous AI agents debate and critique code in real time. Because all worker turns are currently processed client-side over your connected API keys, several real-world constraints cause behavioral instability.
                    </p>
                  </div>

                  {/* 5 Technical Diagnostic Drivers */}
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-[#121212] border border-white/10 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <span className="w-5 h-5 rounded-md bg-white/10 text-white flex items-center justify-center text-[10px] font-mono">1</span>
                        <span>Single API Key Serialized Queuing & Rate Limiting</span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed pl-7">
                        When using a single API key, all 6 worker turns must execute sequentially in strict order. Standard free/starter API keys have strict requests-per-minute (e.g. 15 RPM) limits, meaning rapid turns can trigger micro-throttling and latency delays.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#121212] border border-white/10 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <span className="w-5 h-5 rounded-md bg-white/10 text-white flex items-center justify-center text-[10px] font-mono">2</span>
                        <span>Inter-Worker Latency Asymmetry (Jitter)</span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed pl-7">
                        One model turn might complete in 80ms while another takes 600ms due to provider server load. This unpredictable variance (currently <strong className="text-amber-300">±{telemetry.diagnostics.jitterPercent}%</strong>) gives the appearance of erratic hesitation during synthesis.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#121212] border border-white/10 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <span className="w-5 h-5 rounded-md bg-white/10 text-white flex items-center justify-center text-[10px] font-mono">3</span>
                        <span>Isolated 250-Token Context Bounds</span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed pl-7">
                        To preserve your API quota and prevent burning through thousands of tokens in seconds, each worker turn is strictly constrained to 250 tokens. This makes peer conversations sharp, compact, and occasionally assertive.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#121212] border border-white/10 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <span className="w-5 h-5 rounded-md bg-white/10 text-white flex items-center justify-center text-[10px] font-mono">4</span>
                        <span>Adversarial Debate Dynamics (Critic vs Optimizer)</span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed pl-7">
                        Worker 5 (Critic) is programmed to ruthlessly stress-test and challenge earlier proposals. This intentional disagreement can appear erratic before Worker 6 (Synthesizer) and WATCHMAN resolve the consensus.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#121212] border border-white/10 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <span className="w-5 h-5 rounded-md bg-white/10 text-white flex items-center justify-center text-[10px] font-mono">5</span>
                        <span>9-Second Timeout Failover Protection</span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed pl-7">
                        If an external provider model hangs or fails to respond within 9 seconds, the WATCHMAN Supreme Arbiter immediately steps in to take over the session, preventing your workstation from hanging indefinitely.
                      </p>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="p-4 rounded-xl bg-[#121212] border border-white/10 space-y-2">
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>How to Stabilize Your Swarm Right Now:</span>
                    </h3>
                    <ul className="text-xs text-zinc-300 space-y-1.5 pl-5 list-disc">
                      <li>
                        <strong>Use "Fast" Deliberation Depth:</strong> Reduces active workers to 3 (Architect, Security, Synthesizer), cutting turn latency by ~50%.
                      </li>
                      <li>
                        <strong>Add a Key Pool:</strong> In Settings &rarr; Multiple Workers, paste 2-3 extra API keys for your provider so workers rotate keys and avoid rate limits.
                      </li>
                      <li>
                        <strong>Choose High-RPM Models:</strong> Use Gemini 4 / Flash or GPT-6 Luna for workers, reserving Flagship models (GPT-6.1 Sol / Opus 5.5) for Watchman.
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-white/10 bg-[#121212] flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-mono text-[11px]">
                Active Provider: <strong className="text-zinc-300">{providerConfig.provider}</strong> ({providerConfig.model})
              </span>

              <div className="flex items-center gap-2">
                {onOpenSettings && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onOpenSettings();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-zinc-200 hover:text-white transition-all cursor-pointer"
                  >
                    Configure Workers Tab &rarr;
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
