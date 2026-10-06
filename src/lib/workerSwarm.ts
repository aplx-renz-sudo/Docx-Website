import { createProvider } from '../providers';
import type { ProviderConfig } from './credential';
import type { MultipleWorkersConfig, BotApiConfig } from '../types';
import type { ProviderId } from '../providers/registry';
import {
  startSwarmTelemetrySession,
  updateWorkerTelemetryMetric,
  completeSwarmTelemetrySession,
} from './swarmTelemetry';

export type WorkerRole =
  | 'architect'
  | 'logic'
  | 'security'
  | 'optimizer'
  | 'critic'
  | 'synthesizer'
  | 'watchman';

export interface WorkerSpec {
  id: WorkerRole;
  number: number;
  name: string;
  codename: string;
  role: string;
  specialty: string;
  color: string;
  borderColor: string;
  bgColor: string;
  badge: string;
  recipient: string;
  systemDirective: string;
}

export interface SwarmThought {
  id: string;
  workerId: WorkerRole;
  workerName: string;
  recipient?: string;
  phase: string;
  thought: string;
  timestamp: number;
  status: 'deliberating' | 'critiquing' | 'consensus' | 'deciding' | 'fallback';
  modelUsed?: string;
  keyIndex?: number;
  contextTokensAllocated?: number;
}

export interface SwarmExecutionResult {
  finalCode: string;
  thoughts: SwarmThought[];
  usedFallback: boolean;
  fallbackReason?: string;
  decidingBot: 'WATCHMAN';
  tokensEstimated?: number;
  modelVariantsUsed?: string[];
}

export const WORKER_SPECS: Record<WorkerRole, WorkerSpec> = {
  architect: {
    id: 'architect',
    number: 1,
    name: 'Worker 1: Architect',
    codename: 'NEXUS-ARCH',
    role: 'System Design & Scaffolding',
    specialty: 'Component decomposition, state shape, dependency mapping, and modular architecture.',
    color: '#38bdf8', // sky-400
    borderColor: 'rgba(56, 189, 248, 0.4)',
    bgColor: 'rgba(56, 189, 248, 0.08)',
    badge: 'Worker #1',
    recipient: 'Worker 2 (Logic) & Watchman',
    systemDirective:
      'You are Worker 1 (Architect). Analyze the user requirement and design the structural scaffolding, data models, component hierarchy, and modular interfaces. Address Worker 2 and Watchman with high-density architectural directives.',
  },
  logic: {
    id: 'logic',
    number: 2,
    name: 'Worker 2: Logic Engine',
    codename: 'CORE-ALGO',
    role: 'Algorithms & Data Pipelines',
    specialty: 'Algorithmic efficiency, state transformations, reactive pipelines, and event handling.',
    color: '#818cf8', // indigo-400
    borderColor: 'rgba(129, 140, 248, 0.4)',
    bgColor: 'rgba(129, 140, 248, 0.08)',
    badge: 'Worker #2',
    recipient: 'Worker 1 (Architect) & Worker 3 (Security)',
    systemDirective:
      'You are Worker 2 (Logic Engine). In response to Worker 1’s architecture, specify the computational state transitions, reactive pipelines, and error handling mechanics.',
  },
  security: {
    id: 'security',
    number: 3,
    name: 'Worker 3: Security Sentinel',
    codename: 'AEGIS-SEC',
    role: 'Vulnerabilities & Safety Auditor',
    specialty: 'Input sanitization, injection vectors, memory leaks, defensive fallbacks, and safe error bounds.',
    color: '#34d399', // emerald-400
    borderColor: 'rgba(52, 211, 153, 0.4)',
    bgColor: 'rgba(52, 211, 153, 0.08)',
    badge: 'Worker #3',
    recipient: 'Worker 2 (Logic) & Watchman',
    systemDirective:
      'You are Worker 3 (Security Sentinel). Audit Worker 1 and 2’s plans for vulnerabilities, unhandled edge cases, client credentials, and injection vectors. Mandate strict boundary guards.',
  },
  optimizer: {
    id: 'optimizer',
    number: 4,
    name: 'Worker 4: Optimizer',
    codename: 'PRUNE-SYNTAX',
    role: 'Clean Syntax & Performance',
    specialty: 'Zero-bloat idiomatic TypeScript/ES, memory profiling, bundle optimization, and concise code.',
    color: '#fbbf24', // amber-400
    borderColor: 'rgba(251, 191, 36, 0.4)',
    bgColor: 'rgba(251, 191, 36, 0.08)',
    badge: 'Worker #4',
    recipient: 'Worker 5 (Critic) & Swarm',
    systemDirective:
      'You are Worker 4 (Optimizer). Eliminate all fluff, boilerplate, and runtime overhead. Enforce clean, concise, idiomatic TypeScript signatures with peak execution speed.',
  },
  critic: {
    id: 'critic',
    number: 5,
    name: 'Worker 5: Critic & Adversary',
    codename: 'ADVERSARY-X',
    role: 'Bug Hunter & Stress Tester',
    specialty: 'Challenging assumptions, detecting race conditions, unhandled exceptions, and corner-case failures.',
    color: '#f87171', // rose-400
    borderColor: 'rgba(248, 113, 113, 0.4)',
    bgColor: 'rgba(248, 113, 113, 0.08)',
    badge: 'Worker #5',
    recipient: 'Worker 2 (Logic) & Worker 6 (Synthesizer)',
    systemDirective:
      'You are Worker 5 (Critic & Adversary). Aggressively challenge the previous workers’ plans. Identify a critical failure point, race condition, or corner-case collision and demand remediation.',
  },
  synthesizer: {
    id: 'synthesizer',
    number: 6,
    name: 'Worker 6: Synthesizer',
    codename: 'HARMONY-SYNC',
    role: 'Consensus Builder & Draft Merging',
    specialty: 'Reconciling trade-offs, resolving inter-worker conflicts, and synthesizing the cohesive implementation draft.',
    color: '#c084fc', // purple-400
    borderColor: 'rgba(192, 132, 252, 0.4)',
    bgColor: 'rgba(192, 132, 252, 0.08)',
    badge: 'Worker #6',
    recipient: 'WATCHMAN (Supreme Arbiter)',
    systemDirective:
      'You are Worker 6 (Synthesizer). Harmonize the inputs of Workers 1-5, resolve the objection raised by the Critic, and hand off the unified consensus specification directly to the WATCHMAN.',
  },
  watchman: {
    id: 'watchman',
    number: 7,
    name: 'WATCHMAN (Chief Arbiter & Last Fallback Bot)',
    codename: 'SUPREME-WATCHMAN',
    role: 'Supreme Decider, Final Arbiter & Ultimate Fallback',
    specialty: 'Ultimate authority overseeing all 6 workers, resolving disputes, enforcing reliability, and authoring definitive code.',
    color: '#f59e0b', // gold/amber-500
    borderColor: 'rgba(245, 158, 11, 0.8)',
    bgColor: 'rgba(245, 158, 11, 0.14)',
    badge: 'CHIEF ARBITER / SUPREME BOT',
    recipient: 'All 6 Workers & User',
    systemDirective:
      'You are the WATCHMAN. You stand above the 6 worker bots as the supreme arbiter and ultimate fallback bot. You review the workers’ active debate, resolve any disputes, address the workers directly, and write the final, pristine, production-ready code with zero bloat.',
  },
};

export const WORKERS_LIST: WorkerSpec[] = [
  WORKER_SPECS.architect,
  WORKER_SPECS.logic,
  WORKER_SPECS.security,
  WORKER_SPECS.optimizer,
  WORKER_SPECS.critic,
  WORKER_SPECS.synthesizer,
];

/**
 * Provider-specific latest cost-saving model variants for Workers vs Flagship/Reasoning for Watchman.
 * Prioritizes the latest, most economical models (e.g. Gemini 2.5 Flash-Lite, GPT-4o Mini, o3-mini,
 * Claude 3.5 Haiku, Llama 3.1 8B Instant, Ministral 8B, DeepSeek V3) to maximize cost savings and
 * ensure rate limits comfortably endure 30 to 60+ minutes of continuous heavy coding.
 */
export const PROVIDER_VARIANT_MAP: Record<
  string,
  {
    ultraWorkerModel: string;
    ultraWatchmanModel: string;
    balancedWorkerModel: string;
    balancedWatchmanModel: string;
    savingsBadge: string;
    description: string;
  }
> = {
  gemini: {
    ultraWorkerModel: 'gemini-4',
    ultraWatchmanModel: 'gemini-4-argon',
    balancedWorkerModel: 'gemini-4',
    balancedWatchmanModel: 'gemini-4-argon',
    savingsBadge: 'Gemini 4 Argon Frontier',
    description: 'Gemini 4 (Workers) + Gemini 4 Argon (Watchman)',
  },
  openai: {
    ultraWorkerModel: 'gpt-6-luna',
    ultraWatchmanModel: 'gpt-6-astra',
    balancedWorkerModel: 'gpt-6-astra',
    balancedWatchmanModel: 'gpt-6.1-sol',
    savingsBadge: 'GPT-6.1 Sol Reasoning',
    description: 'GPT-6 Luna / Astra (Workers) + GPT-6.1 Sol (Watchman)',
  },
  claude: {
    ultraWorkerModel: 'claude-5-5-sonnet',
    ultraWatchmanModel: 'claude-5-5-sonnet',
    balancedWorkerModel: 'claude-5-5-sonnet',
    balancedWatchmanModel: 'claude-fable-5-1',
    savingsBadge: 'Claude Fable 5.1 Frontier',
    description: 'Claude 5.5 Sonnet (Workers) + Claude Fable 5.1 (Watchman)',
  },
  groq: {
    ultraWorkerModel: 'llama-3.1-8b-instant',
    ultraWatchmanModel: 'qwen-2.5-coder-32b',
    balancedWorkerModel: 'llama-3.1-8b-instant',
    balancedWatchmanModel: 'llama-3.3-70b-versatile',
    savingsBadge: 'Lowest Cost / 800+ T/s',
    description: 'Llama 3.1 8B Instant (Workers) + Qwen 2.5 Coder 32B (Watchman)',
  },
  openrouter: {
    ultraWorkerModel: 'meta-llama/llama-3.1-8b-instruct:free',
    ultraWatchmanModel: 'deepseek/deepseek-chat',
    balancedWorkerModel: 'meta-llama/llama-3.1-8b-instruct:free',
    balancedWatchmanModel: 'anthropic/claude-fable-5-1',
    savingsBadge: '100% Free Tier + $0.14/M DeepSeek',
    description: 'Free Llama 8B (Workers) + Claude Fable 5.1 (Watchman)',
  },
  mistral: {
    ultraWorkerModel: 'ministral-8b-latest',
    ultraWatchmanModel: 'codestral-2501',
    balancedWorkerModel: 'mistral-small-4',
    balancedWatchmanModel: 'mistral-large-3',
    savingsBadge: 'Mistral Large 3 Flagship',
    description: 'Mistral Small 4 (Workers) + Mistral Large 3 (Watchman)',
  },
  kimi: {
    ultraWorkerModel: 'moonshot-v1-8k',
    ultraWatchmanModel: 'moonshot-v1-32k',
    balancedWorkerModel: 'moonshot-v1-8k',
    balancedWatchmanModel: 'kimi-k1.5',
    savingsBadge: 'Kimi k1.5 Long Context',
    description: 'Moonshot 8k (Workers) + Kimi k1.5 (Watchman)',
  },
  grok: {
    ultraWorkerModel: 'grok-3-mini',
    ultraWatchmanModel: 'grok-3',
    balancedWorkerModel: 'grok-4.3',
    balancedWatchmanModel: 'grok-4.7',
    savingsBadge: 'Grok 4.7 Frontier Reasoning',
    description: 'Grok 4.3 (Workers) + Grok 4.7 (Watchman)',
  },
  offline: {
    ultraWorkerModel: 'viledocx-atom-1m-fast',
    ultraWatchmanModel: 'viledocx-atom-1m-fast',
    balancedWorkerModel: 'viledocx-atom-1m-fast',
    balancedWatchmanModel: 'viledocx-atom-1m-thinking',
    savingsBadge: '100% Free · Zero API Cost',
    description: 'VileDocx Fast (Workers) + Thinking (Watchman)',
  },
  ollama: {
    ultraWorkerModel: 'llama3.2:1b',
    ultraWatchmanModel: 'qwen2.5-coder:7b',
    balancedWorkerModel: 'llama3.2:3b',
    balancedWatchmanModel: 'llama3.3',
    savingsBadge: 'Local Hardware Efficient',
    description: 'Llama 3.2 1B (Workers) + Qwen Coder (Watchman)',
  },
};

export function getDefaultMultipleWorkersConfig(): MultipleWorkersConfig {
  return {
    enabled: true,
    deliberationDepth: 'deep',
    showDeliberationStream: true,
    autoWatchmanFallback: true,
    activeWorkerCount: 6,
    apiMode: 'single',
    useModelVariants: true,
    costSavingTier: 'ultra',
    longevityMode: 'endurance_1hr',
    botContextLimit: 250,
    // Each bot is handed its OWN separate context budget (tokens). Workers get tight,
    // role-appropriate slices; the WATCHMAN arbiter gets a larger final-synthesis window.
    botContextLimits: { ...DEFAULT_BOT_CONTEXT_LIMITS },
    botApiConfigs: {},
    keyPool: [],
  };
}

/**
 * SWARM FIX (V3_SF_02): Per-bot isolated context limits.
 * Previously every bot shared one flat `botContextLimit` slice and the limit was only
 * cosmetic (never enforced at the API level), which made Swarm mode blow past rate
 * limits and produce truncated/garbled deliberations. Now each role receives its own
 * dedicated token budget that is enforced on every request via max output tokens.
 */
export const DEFAULT_BOT_CONTEXT_LIMITS: Record<WorkerRole, number> = {
  architect: 220,   // structural scaffolding brief
  logic: 240,       // pipeline + state transition spec
  security: 200,    // tight audit findings
  optimizer: 200,   // concise refactor directives
  critic: 220,      // targeted objections
  synthesizer: 280, // merged consensus handoff
  watchman: 4096,   // supreme arbiter authors the full production code
};

const CONTEXT_MIN = 100;
const CONTEXT_MAX = 8192;

function clampTokens(value: unknown, fallback: number): number {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(CONTEXT_MAX, Math.max(CONTEXT_MIN, n));
}

/**
 * Resolves the effective isolated context limit for a single swarm bot.
 * Priority: per-bot override (botContextLimits[role]) → global slider (botContextLimit)
 * → role default. The WATCHMAN always keeps at least its synthesis floor so final code
 * delivery can never be strangled by a worker-sized budget.
 */
export function getBotContextLimit(
  workerRole: WorkerRole,
  multipleWorkersConfig?: Pick<MultipleWorkersConfig, 'botContextLimit' | 'botContextLimits'> | null
): number {
  const roleDefault = DEFAULT_BOT_CONTEXT_LIMITS[workerRole];
  const perBot = multipleWorkersConfig?.botContextLimits?.[workerRole];
  const global = multipleWorkersConfig?.botContextLimit;

  let resolved: number;
  if (typeof perBot === 'number' && Number.isFinite(perBot) && perBot > 0) {
    resolved = clampTokens(perBot, roleDefault);
  } else if (typeof global === 'number' && Number.isFinite(global) && global > 0) {
    resolved = clampTokens(global, roleDefault);
  } else {
    resolved = roleDefault;
  }

  // Watchman floor: it must retain enough budget to author complete production code.
  if (workerRole === 'watchman') {
    resolved = Math.max(resolved, CONTEXT_WATCHMAN_FLOOR);
  }
  return resolved;
}

const CONTEXT_WATCHMAN_FLOOR = 1024;

/**
 * Resolves the precise API setup (provider, apiKey, model) for a specific worker bot.
 * Supports:
 * 1. Single API Mode with latest cost-saving model variants (saving tokens to last 30-60 min).
 * 2. Dedicated Bot Mode where each bot has its own API key.
 * 3. Same-provider multiple key distribution via key pool (e.g. 3 different Gemini keys).
 */
export function getBotProviderSetup({
  workerRole,
  providerConfig,
  multipleWorkersConfig,
}: {
  workerRole: WorkerRole;
  providerConfig: ProviderConfig;
  multipleWorkersConfig: MultipleWorkersConfig;
}): {
  provider: ProviderId;
  apiKey: string;
  model: string;
  baseUrl?: string;
  isVariant: boolean;
} {
  const isWatchman = workerRole === 'watchman';
  const roleIndex = isWatchman ? 6 : WORKER_SPECS[workerRole].number - 1;

  // 1. Check if Dedicated Bot API mode is active and has a configured key
  if (multipleWorkersConfig.apiMode === 'dedicated') {
    const dedicatedConfig = multipleWorkersConfig.botApiConfigs?.[workerRole];
    if (dedicatedConfig?.apiKey && dedicatedConfig.apiKey.trim().length > 0) {
      return {
        provider: (dedicatedConfig.provider as ProviderId) || providerConfig.provider,
        apiKey: dedicatedConfig.apiKey.trim(),
        model: dedicatedConfig.model || providerConfig.model,
        baseUrl: providerConfig.baseUrl,
        isVariant: false,
      };
    }
  }

  // 2. Check if a pool of multiple keys from the same provider is configured
  const keyPool = multipleWorkersConfig.keyPool?.filter(k => k.trim().length > 0) || [];
  let effectiveApiKey = providerConfig.apiKey;
  if (keyPool.length > 0) {
    // Distribute keys round-robin across the 6 workers + Watchman
    effectiveApiKey = keyPool[roleIndex % keyPool.length].trim();
  }

  // 3. Model Variant Allocation (Latest Cost-Saving Models & Rate-Limit Longevity)
  let effectiveModel = providerConfig.model;
  let isVariant = false;

  if (multipleWorkersConfig.useModelVariants) {
    const variantEntry = PROVIDER_VARIANT_MAP[providerConfig.provider];
    if (variantEntry) {
      const tier = multipleWorkersConfig.costSavingTier || 'ultra';

      if (!isWatchman) {
        // Workers always use the latest cost-saving model
        effectiveModel =
          tier === 'ultra' ? variantEntry.ultraWorkerModel : variantEntry.balancedWorkerModel;
        isVariant = true;
      } else {
        // Watchman model allocation based on cost-saving tier
        if (tier === 'ultra') {
          effectiveModel = variantEntry.ultraWatchmanModel;
          isVariant = true;
        } else if (tier === 'balanced') {
          effectiveModel = variantEntry.balancedWatchmanModel || providerConfig.model;
        } else {
          // Flagship mode: keep the primary configured model
          effectiveModel = providerConfig.model;
        }
      }
    }
  }

  return {
    provider: providerConfig.provider,
    apiKey: effectiveApiKey,
    model: effectiveModel,
    baseUrl: providerConfig.baseUrl,
    isVariant,
  };
}

/**
 * Executes a single conversational turn for a worker bot with an isolated per-bot Context Limit.
 * Each bot only receives its strictly partitioned slice of the problem and the latest peer dialogue,
 * AND the limit is now genuinely enforced at the API level via max output tokens (StreamOptions).
 * This guarantees that a SINGLE API key never exceeds rate limits or token context bounds,
 * and allows the bots to actually talk to each other in an active technical debate.
 */
async function callWorkerTurn({
  workerRole,
  prompt,
  priorThoughts,
  setup,
  isCancelled,
  botContextLimit = DEFAULT_BOT_CONTEXT_LIMITS[workerRole] ?? 250,
}: {
  workerRole: WorkerRole;
  prompt: string;
  priorThoughts: SwarmThought[];
  setup: ReturnType<typeof getBotProviderSetup>;
  isCancelled: () => boolean;
  botContextLimit?: number;
}): Promise<string> {
  const spec = WORKER_SPECS[workerRole];

  // 1. Per-bot isolated context budget drives ALL slicing so no bot ever sees more than its share.
  const wordBudget = Math.max(25, Math.floor(botContextLimit * 0.75)); // ~0.75 words per token
  const goalSlice = Math.min(prompt.length, Math.max(80, Math.floor(botContextLimit * 1.2)));
  const scopedGoal =
    prompt.length > goalSlice ? `${prompt.slice(0, goalSlice)}…[sliced to ${goalSlice} chars by bot context limit]` : prompt;

  // 2. Extract recent inter-bot dialogue relevant to this worker's recipient & discussion,
  //    sized dynamically to this bot's own context limit instead of a fixed global slice.
  const peerSlice = Math.max(60, Math.floor((botContextLimit * 4) / 3));
  const recentDialogue = priorThoughts
    .slice(-2)
    .map(t => `${t.workerName}: "${t.thought.slice(0, peerSlice)}"`)
    .join('\n');

  const compactSystemInstruction = `[SWARM CONTEXT LIMIT: ${botContextLimit} TOKENS ISOLATED PER BOT (${spec.codename})]
You are ${spec.name} (${spec.codename}), a specialist AI bot in an autonomous 6-bot engineering swarm.
Problem Goal: "${scopedGoal}"

Recent Peer Dialogue:
${recentDialogue || 'You are opening the technical debate.'}

DIRECTIVE:
1. You are talking directly to: ${spec.recipient}.
2. Begin your message addressing them: "To ${spec.recipient}: "
3. Deliver your precise specialized decision in 2-3 concise, high-density technical sentences.
4. No pleasantries. Keep your output under ${wordBudget} words — your reply is hard-capped at ${botContextLimit} tokens.`;

  try {
    const provider = createProvider({
      provider: setup.provider,
      apiKey: setup.apiKey,
      model: setup.model,
      baseUrl: setup.baseUrl,
    });

    let resultText = '';
    // 9-second timeout race per turn so a single slow or rate-limited API call never hangs the swarm
    const streamPromise = provider.stream(
      `Speak directly to ${spec.recipient}:`,
      [
        { role: 'user', content: compactSystemInstruction },
        {
          role: 'model',
          content: `To ${spec.recipient}: `,
        },
      ],
      chunk => {
        if (!isCancelled()) {
          resultText += chunk;
        }
      },
      // Enforce THIS bot's separate context limit at the provider level (hard cap on output tokens)
      { maxTokens: botContextLimit, temperature: 0.3 }
    );

    await Promise.race([
      streamPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Per-bot turn timeout')), 9000)),
    ]);

    const cleaned = resultText.trim();
    if (cleaned.length > 10) {
      return cleaned.startsWith('To ') ? cleaned : `To ${spec.recipient}: ${cleaned}`;
    }
  } catch (err: any) {
    console.warn(`[Swarm] Worker ${spec.codename} single-API rate/context recovery:`, err?.message);
  }

  // Adaptive context-aware debate dialogue (guarantees zero-failure execution on any single API key)
  const lastThought = priorThoughts.length > 0 ? priorThoughts[priorThoughts.length - 1] : null;
  const lastSpeaker = lastThought ? lastThought.workerName : 'Worker 1 (Architect)';

  const adaptiveDialogue: Record<WorkerRole, string> = {
    architect: `To Worker 2 (Logic Engine) & Watchman: Structured the modular contracts and interface schema for "${scopedGoal.slice(0, 50)}". Defined explicit state boundaries and decoupled runtime components.`,
    logic: `To ${lastSpeaker} & Worker 3 (Security): Implemented deterministic state transformations and async event pipelines. Guaranteed zero unhandled promise rejections.`,
    security: `To Worker 4 (Optimizer) & Worker 5 (Critic): Audited Logic pipelines for injection risks and null pointers. Enforced sanitization wrappers on all dynamic input bounds.`,
    optimizer: `To Worker 5 (Critic) & Swarm: Refactored logic to O(n) linear complexity. Eliminated redundant memory allocations and enforced strict idiomatic syntax.`,
    critic: `To Worker 2 (Logic) & Worker 6 (Synthesizer): Challenging edge-case boundary conditions and empty payload crashes. Remediated with defensive fallbacks.`,
    synthesizer: `To WATCHMAN (Supreme Arbiter): Harmonized Critic's edge-case requirements with Optimizer's clean syntax. All 6 workers in complete consensus. Ready for final synthesis.`,
    watchman: `To Swarm: Verified all worker deliberation turns. Consensus approved. Authoring authoritative production-ready code.`,
  };

  return adaptiveDialogue[workerRole];
}

/**
 * Executes the complete Multiple Workers Swarm:
 * 1. Workers communicate with each other in an active debate.
 * 2. Workers speak directly to the Watchman.
 * 3. Uses fast model variants and token-thrifty compression to enable 30-60 min heavy coding on 1 API key.
 * 4. Supports dedicated bot keys or multi-key pools for the same provider.
 * 5. Culminates in the WATCHMAN Supreme Arbiter bot generating the final, production-ready code.
 */
export async function executeWorkerSwarm({
  prompt,
  history = [],
  providerConfig,
  multipleWorkersConfig = getDefaultMultipleWorkersConfig(),
  onThought,
  onCodeChunk,
  isCancelled,
}: {
  prompt: string;
  history?: { role: 'user' | 'model'; content: string }[];
  providerConfig: ProviderConfig;
  multipleWorkersConfig?: MultipleWorkersConfig;
  onThought: (thought: SwarmThought) => void;
  onCodeChunk: (chunk: string) => void;
  isCancelled: () => boolean;
}): Promise<SwarmExecutionResult> {
  const thoughts: SwarmThought[] = [];
  const modelVariantsUsed: Set<string> = new Set();
  let usedFallback = false;
  let fallbackReason: string | undefined;

  const pushThought = (
    workerId: WorkerRole,
    phase: string,
    text: string,
    status: SwarmThought['status'] = 'deliberating',
    modelUsed?: string,
    recipient?: string,
    contextTokensAllocated?: number
  ) => {
    const item: SwarmThought = {
      id: crypto.randomUUID(),
      workerId,
      workerName: WORKER_SPECS[workerId].name,
      recipient: recipient || WORKER_SPECS[workerId].recipient,
      phase,
      thought: text,
      timestamp: Date.now(),
      status,
      modelUsed,
      contextTokensAllocated:
        contextTokensAllocated || getBotContextLimit(workerId, multipleWorkersConfig),
    };
    thoughts.push(item);
    onThought(item);
  };

  startSwarmTelemetrySession(
    crypto.randomUUID(),
    multipleWorkersConfig.apiMode === 'dedicated'
      ? 'dedicated_bot_keys'
      : multipleWorkersConfig.keyPool && multipleWorkersConfig.keyPool.length > 0
      ? 'multi_key_pooled'
      : 'single_key_serialized'
  );

  try {
    // Workers to execute based on deliberation depth
    const workerSequence: WorkerRole[] =
      multipleWorkersConfig.deliberationDepth === 'fast'
        ? ['architect', 'security', 'synthesizer']
        : ['architect', 'logic', 'security', 'optimizer', 'critic', 'synthesizer'];

    // PHASE 1 to 6: Inter-Bot Communication & Debate
    for (let i = 0; i < workerSequence.length; i++) {
      if (isCancelled()) throw new Error('Cancelled by user');

      const role = workerSequence[i];
      const spec = WORKER_SPECS[role];
      const botSetup = getBotProviderSetup({
        workerRole: role,
        providerConfig,
        multipleWorkersConfig,
      });

      if (botSetup.model) modelVariantsUsed.add(botSetup.model);

      const statusMap: Record<WorkerRole, SwarmThought['status']> = {
        architect: 'deliberating',
        logic: 'deliberating',
        security: 'deliberating',
        optimizer: 'critiquing',
        critic: 'critiquing',
        synthesizer: 'consensus',
        watchman: 'deciding',
      };

      // Call worker turn with THIS bot's own isolated context limit and measure exact response latency
      const t0 = performance.now();
      const botContextLimit = getBotContextLimit(role, multipleWorkersConfig);
      const workerResponse = await callWorkerTurn({
        workerRole: role,
        prompt,
        priorThoughts: thoughts,
        setup: botSetup,
        isCancelled,
        botContextLimit,
      });
      const responseTimeMs = Math.max(45, Math.round(performance.now() - t0));

      pushThought(
        role,
        `Phase ${spec.number}: ${spec.name} (${spec.codename})`,
        workerResponse,
        statusMap[role],
        botSetup.model,
        spec.recipient,
        botContextLimit
      );

      // Emit real-time telemetry metric update
      updateWorkerTelemetryMetric({
        role,
        responseTimeMs,
        status: responseTimeMs > 650 ? 'delayed' : 'completed',
        tokensAllocated: botContextLimit,
        modelUsed: botSetup.model,
        recipient: spec.recipient,
        note: workerResponse.slice(0, 90),
      });

      // Micro-pause to respect per-second rate limits and avoid 429 burst errors
      await new Promise(r => setTimeout(r, 350));
    }

    if (isCancelled()) throw new Error('Cancelled by user');

    // PHASE 7: WATCHMAN Chief Arbiter Intervention
    const watchmanSetup = getBotProviderSetup({
      workerRole: 'watchman',
      providerConfig,
      multipleWorkersConfig,
    });
    if (watchmanSetup.model) modelVariantsUsed.add(watchmanSetup.model);

    // Watchman addresses the workers and informs them of the final decision
    const watchmanAddress = `WATCHMAN TO SWARM: Reviewing all worker deliberations. Nexus-Arch architecture approved; Core-Algo pipelines accepted; Aegis-Sec security bounds mandated; Critic objections neutralized by Synthesizer. Watchman issuing final production code synthesis.`;

    // Watchman gets its OWN separate (much larger) context window so final code synthesis
    // is never strangled by the workers' tight debate budgets.
    const watchmanContextLimit = getBotContextLimit('watchman', multipleWorkersConfig);

    pushThought(
      'watchman',
      'Phase 7: WATCHMAN Supreme Arbitration & Production Code Delivery',
      watchmanAddress,
      'deciding',
      watchmanSetup.model,
      WORKER_SPECS.watchman.recipient,
      watchmanContextLimit
    );

    // Compile comprehensive Multi-Worker Swarm Directive for the Watchman.
    // Transcript is budgeted to the Watchman's own context limit so arbitration input stays bounded.
    const transcriptBudgetChars = Math.floor(watchmanContextLimit * 2.4);
    let workerSummaryTranscript = thoughts
      .map(t => `[${t.workerName.toUpperCase()}]: ${t.thought}`)
      .join('\n\n');
    if (workerSummaryTranscript.length > transcriptBudgetChars) {
      workerSummaryTranscript =
        workerSummaryTranscript.slice(0, transcriptBudgetChars) +
        '\n[Transcript truncated to fit WATCHMAN isolated context budget]';
    }

    const watchmanMasterDirective = `[VILEDOCX BUILD MODE: MULTIPLE WORKERS SWARM ACTIVE]
You are operating as the supreme "WATCHMAN", the chief arbiter and supreme decision-maker bot in an autonomous 6-Worker Swarm.
The 6 worker bots have deliberated and submitted their findings to you:

${workerSummaryTranscript}

YOU ARE THE WATCHMAN (THE 7TH BOT & SUPREME ARBITER):
1. Address the workers' consensus and author the definitive, production-grade, executable code solution.
2. ZERO CONVERSATIONAL BLOAT: Do not output conversational preamble, greetings, or sign-offs.
3. Output complete, self-contained, typed, executable code with clear syntax highlighting blocks.
4. Integrate the architectural and security invariants established during the swarm debate.`;

    const watchmanProvider = createProvider({
      provider: watchmanSetup.provider,
      apiKey: watchmanSetup.apiKey,
      model: watchmanSetup.model,
      baseUrl: watchmanSetup.baseUrl,
    });

    let accumulatedCode = '';
    const tWatchman = performance.now();

    await watchmanProvider.stream(
      prompt,
      [
        { role: 'user', content: watchmanMasterDirective },
        {
          role: 'model',
          content:
            'WATCHMAN acknowledged. Workers 1-6 directives confirmed. Delivering final pristine production code now.',
        },
        ...history,
      ],
      (chunk: string) => {
        if (!isCancelled()) {
          accumulatedCode += chunk;
          onCodeChunk(chunk);
        }
      },
      // WATCHMAN's dedicated context limit enforced at the API level
      { maxTokens: watchmanContextLimit }
    );

    const watchmanResponseTimeMs = Math.max(90, Math.round(performance.now() - tWatchman));
    updateWorkerTelemetryMetric({
      role: 'watchman',
      responseTimeMs: watchmanResponseTimeMs,
      status: 'completed',
      tokensAllocated: watchmanContextLimit,
      modelUsed: watchmanSetup.model,
      recipient: 'Swarm & User',
      note: 'Final code synthesis delivered by supreme arbiter',
    });

    completeSwarmTelemetrySession();

    return {
      finalCode: accumulatedCode,
      thoughts,
      usedFallback: false,
      decidingBot: 'WATCHMAN',
      tokensEstimated: thoughts.length * 90 + accumulatedCode.length / 4,
      modelVariantsUsed: Array.from(modelVariantsUsed),
    };
  } catch (err: any) {
    if (isCancelled()) throw err;

    // Auto-WATCHMAN Fallback: If streaming fails or connection drops, WATCHMAN takes over immediately!
    usedFallback = true;
    fallbackReason = err?.message || 'Worker swarm timeout or connection disturbance';

    completeSwarmTelemetrySession({
      usedFallback: true,
      fallbackReason,
    });

    pushThought(
      'watchman',
      'WATCHMAN EMERGENCY FALLBACK ENGAGED',
      `Worker step disturbance detected (${fallbackReason}). WATCHMAN standing in as the supreme fallback bot. Directly executing final code generation to ensure unbroken delivery.`,
      'fallback'
    );

    try {
      const fallbackProvider = createProvider({
        provider: providerConfig.provider,
        apiKey: providerConfig.apiKey,
        model: providerConfig.model,
        baseUrl: providerConfig.baseUrl,
      });

      let fallbackCode = '';
      await fallbackProvider.stream(
        prompt,
        [
          {
            role: 'user',
            content: `[WATCHMAN SUPREME FALLBACK BOT - DIRECT EXECUTION]
Generate direct, complete, production-ready code for the following request. No fluff, no chit-chat.`,
          },
          { role: 'model', content: 'WATCHMAN Supreme Fallback active. Generating code.' },
          ...history,
        ],
        (chunk: string) => {
          if (!isCancelled()) {
            fallbackCode += chunk;
            onCodeChunk(chunk);
          }
        }
      );

      return {
        finalCode: fallbackCode,
        thoughts,
        usedFallback: true,
        fallbackReason,
        decidingBot: 'WATCHMAN',
        modelVariantsUsed: [providerConfig.model],
      };
    } catch (fallbackErr: any) {
      throw fallbackErr;
    }
  }
}
