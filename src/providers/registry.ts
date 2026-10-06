export type ProviderId =
  | 'offline'
  | 'gemini'
  | 'openai'
  | 'claude'
  | 'grok'
  | 'mistral'
  | 'kimi'
  | 'minimax'
  | 'groq'
  | 'openrouter'
  | 'ollama';

export type ProviderModel = { id: string; label: string; desc?: string };

export type ProviderDef = {
  id: ProviderId;
  name: string;
  logo: string;
  description: string;
  keyLabel: string;
  keyPlaceholder: string;
  requiresKey: boolean;
  route: string;
  models: ProviderModel[];
  defaultModel: string;
  baseUrl?: string;
  baseUrlLabel?: string;
  instructions: string;
};

export const PROVIDERS: Record<ProviderId, ProviderDef> = {
  offline: {
    id: 'offline',
    name: 'VileDocx Offline Atom (1M Trained LLM)',
    logo: '⚡',
    description: 'Real ~1M-parameter character-level GPT trained from scratch and run entirely in your browser',
    keyLabel: 'API key (None needed)',
    keyPlaceholder: 'No API key needed (Runs in browser)',
    requiresKey: false,
    route: 'In-Browser (100% Offline · Real Neural Inference)',
    models: [
      { id: 'viledocx-atom-1m-thinking', label: 'VileDocx Atom 1M (Trained · Thinking Trace)' },
      { id: 'viledocx-atom-1m-fast', label: 'VileDocx Atom 1M Fast (Trained · Direct Answer)' },
    ],
    defaultModel: 'viledocx-atom-1m-thinking',
    instructions:
      'Atom 1M is a genuine Transformer language model (~470k–1M parameters) trained from scratch and shipped as Float16 weights. It performs real token-by-token neural inference locally — 0 API keys, 0 network calls after first load. Expect short, charming answers; connect a cloud API in Settings for deep intelligence.',
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    logo: '✦',
    description: 'Direct browser connection to Google Gemini',
    keyLabel: 'Gemini API key',
    keyPlaceholder: 'AIzaSy…',
    requiresKey: true,
    route: 'Browser → Google Gemini',
    models: [
      { id: 'gemini-4-argon', label: 'Gemini 4 Argon (Frontier Deep Reasoning · 1M Tokens)' },
      { id: 'gemini-4', label: 'Gemini 4 (Next-Gen Flagship Architecture)' },
      { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash (High-Throughput Agentic)' },
      { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash (Long-Horizon Workflows & Coding)' },
      { id: 'gemini-3.1-pro', label: 'Gemini 3.1 Pro (Advanced Reasoning Preview)' },
      { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Ultra Cost-Saving & Fast)' },
      { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite (Lowest Cost / Max RPM)' },
      { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Deep Reasoning)' },
      { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Budget Quota)' },
    ],
    defaultModel: 'gemini-4-argon',
    instructions:
      'Get a key from Google AI Studio. VileDocx sends requests directly from your browser — your key never touches a VileDocx server.',
  },
  openai: {
    id: 'openai',
    name: 'OpenAI & CodeX',
    logo: '✳',
    description: 'GPT-6.1 Sol, GPT-6 Astra, GPT-6 Luna, GPT-5.5 & o3 via OpenAI',
    keyLabel: 'OpenAI API key',
    keyPlaceholder: 'sk-proj-…',
    requiresKey: true,
    route: 'Browser → OpenAI',
    models: [
      { id: 'gpt-6.1-sol', label: 'GPT-6.1 Sol (Ultra Deep Reasoning Frontier)' },
      { id: 'gpt-6-astra', label: 'GPT-6 Astra (Flagship Multimodal Architecture)' },
      { id: 'gpt-6-luna', label: 'GPT-6 Luna (Lightweight High-Speed Frontier)' },
      { id: 'gpt-5.5', label: 'GPT-5.5 Instant (Default Agentic System)' },
      { id: 'gpt-5', label: 'GPT-5 (Unified Multimodal & Stepwise Logic)' },
      { id: 'o3', label: 'OpenAI o3 (Autonomous Tool & Reasoning Flagship)' },
      { id: 'o3-mini', label: 'OpenAI o3-mini (Cost-Saving High-Speed Reasoning)' },
      { id: 'gpt-4o', label: 'GPT-4o (Omni Flagship)' },
      { id: 'gpt-4o-mini', label: 'GPT-4o mini (Ultra Cost-Saving & Fast)' },
      { id: 'o1', label: 'OpenAI o1 (Deep Reasoning)' },
      { id: 'codex-5.6', label: 'CodeX (GPT-5.6 Architecture)' },
    ],
    defaultModel: 'gpt-6.1-sol',
    instructions:
      'Use an API key from platform.openai.com. Direct client-side calls to OpenAI chat completions endpoint.',
  },
  claude: {
    id: 'claude',
    name: 'Anthropic Claude',
    logo: '◈',
    description: 'Claude Fable 5.1, Opus 5.5, Sonnet 5.5 & Claude 3.7 Sonnet',
    keyLabel: 'Anthropic API key',
    keyPlaceholder: 'sk-ant-api…',
    requiresKey: true,
    route: 'Browser → Anthropic',
    models: [
      { id: 'claude-fable-5-1', label: 'Claude Fable 5.1 (Supreme Autonomous Frontier)' },
      { id: 'claude-5-5-opus', label: 'Claude Opus 5.5 (Supreme Frontier Intelligence)' },
      { id: 'claude-5-5-sonnet', label: 'Claude Sonnet 5.5 (Hybrid Reasoning & High-Speed Coding)' },
      { id: 'claude-mythos-5-1', label: 'Claude Mythos 5.1 (Mythos-Class Agentic Architecture)' },
      { id: 'claude-3-7-sonnet-20250219', label: 'Claude 3.7 Sonnet (Hybrid Reasoning Flagship)' },
      { id: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku (Ultra Cost-Saving & Fast)' },
      { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Coding Specialist)' },
      { id: 'claude-3-opus-20240229', label: 'Claude 3 Opus (High Intelligence)' },
    ],
    defaultModel: 'claude-fable-5-1',
    instructions:
      'Use an API key from console.anthropic.com. VileDocx communicates directly with the Anthropic Messages API.',
  },
  grok: {
    id: 'grok',
    name: 'xAI Grok',
    logo: '✕',
    description: 'Grok 4.7, Grok 4.3 & Grok 3 via xAI',
    keyLabel: 'xAI Grok API key',
    keyPlaceholder: 'xai-…',
    requiresKey: true,
    route: 'Browser → xAI',
    models: [
      { id: 'grok-4.7', label: 'Grok 4.7 (Latest 500K Frontier Multimodal Reasoning)' },
      { id: 'grok-4.3', label: 'Grok 4.3 (1M Token Context Flagship)' },
      { id: 'grok-3', label: 'Grok 3 (DeepSearch & Think Mode)' },
      { id: 'grok-3-mini', label: 'Grok 3 Mini (Speed-Optimized Reasoning)' },
      { id: 'grok-2-latest', label: 'Grok 2 (Latest Flagship)' },
    ],
    defaultModel: 'grok-4.7',
    instructions:
      'Get a key from console.x.ai. VileDocx sends requests straight to xAI with no intermediaries.',
  },
  mistral: {
    id: 'mistral',
    name: 'Mistral AI / Le Chat',
    logo: '▲',
    description: 'Mistral Large 3, Codestral 25.01 & Mistral Small 4',
    keyLabel: 'Mistral API key',
    keyPlaceholder: 'mistral_…',
    requiresKey: true,
    route: 'Browser → Mistral AI',
    models: [
      { id: 'mistral-large-3', label: 'Mistral Large 3 (675B Frontier Reasoning Flagship)' },
      { id: 'codestral-2501', label: 'Codestral 25.01 (Specialized Fast Code Generation)' },
      { id: 'mistral-small-4', label: 'Mistral Small 4 (Multimodal Vision & Reasoning)' },
      { id: 'ministral-8b-latest', label: 'Ministral 8B (Ultra Cost-Saving Edge)' },
      { id: 'pixtral-large-latest', label: 'Pixtral Large (124B Vision Multimodal)' },
      { id: 'mistral-large-latest', label: 'Mistral Large 2 (Flagship)' },
    ],
    defaultModel: 'mistral-large-3',
    instructions:
      'Use a key from console.mistral.ai. VileDocx connects directly to the Mistral API.',
  },
  kimi: {
    id: 'kimi',
    name: 'Moonshot AI (Kimi)',
    logo: '🌙',
    description: 'Kimi k1.5 & Kimi K3 long-context models',
    keyLabel: 'Moonshot API key',
    keyPlaceholder: 'sk-…',
    requiresKey: true,
    route: 'Browser → Moonshot AI',
    models: [
      { id: 'kimi-k1.5', label: 'Kimi k1.5 (Long-Context Multimodal Reasoning)' },
      { id: 'kimi-k3-preview', label: 'Kimi K3 (Next-Gen 2M Context)' },
      { id: 'moonshot-v1-128k', label: 'Moonshot v1 128k' },
      { id: 'moonshot-v1-8k', label: 'Moonshot v1 8k (Cost-Saving & Fast)' },
    ],
    defaultModel: 'kimi-k1.5',
    instructions:
      'Get an API key from platform.moonshot.cn. Direct browser connection to Moonshot AI.',
  },
  minimax: {
    id: 'minimax',
    name: 'MiniMax',
    logo: '⚑',
    description: 'MiniMax-Text-01 & Abab conversational models',
    keyLabel: 'MiniMax API key',
    keyPlaceholder: 'ey…',
    requiresKey: true,
    route: 'Browser → MiniMax',
    models: [
      { id: 'minimax-text-01', label: 'MiniMax-Text-01 (Frontier 4M Context)' },
      { id: 'minimax-m3', label: 'MiniMax M3 (Long-Context & Code)' },
      { id: 'abab6.5s-chat', label: 'MiniMax Abab 6.5s (Cost-Saving Fast)' },
    ],
    defaultModel: 'minimax-text-01',
    instructions:
      'Use an API key from api.minimax.chat. Direct browser-to-provider streaming.',
  },
  groq: {
    id: 'groq',
    name: 'Groq Cloud',
    logo: '⚡',
    description: 'Ultra-fast LPU inference (Llama, DeepSeek, Qwen)',
    keyLabel: 'Groq API key',
    keyPlaceholder: 'gsk_…',
    requiresKey: true,
    route: 'Browser → Groq Cloud',
    models: [
      { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B Instant (Ultra Cost-Saving · 800+ T/s)' },
      { id: 'qwen-2.5-coder-32b', label: 'Qwen 2.5 Coder 32B (Cost-Saving Code Specialist)' },
      { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B Versatile (Flagship)' },
      { id: 'deepseek-r1-distill-llama-70b', label: 'DeepSeek R1 Distill 70B (Reasoning)' },
    ],
    defaultModel: 'llama-3.1-8b-instant',
    instructions:
      'Get a key from console.groq.com. Instant sub-second token generation powered by Groq LPUs.',
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter (Universal)',
    logo: '🌐',
    description: 'One key to access 100+ AI models',
    keyLabel: 'OpenRouter API key',
    keyPlaceholder: 'sk-or-v1-…',
    requiresKey: true,
    route: 'Browser → OpenRouter',
    models: [
      { id: 'google/gemini-4-argon', label: 'Gemini 4 Argon (via OpenRouter)' },
      { id: 'google/gemini-4', label: 'Gemini 4 (via OpenRouter)' },
      { id: 'openai/gpt-6.1-sol', label: 'GPT-6.1 Sol (via OpenRouter)' },
      { id: 'openai/gpt-6-astra', label: 'GPT-6 Astra (via OpenRouter)' },
      { id: 'openai/gpt-6-luna', label: 'GPT-6 Luna (via OpenRouter)' },
      { id: 'anthropic/claude-fable-5-1', label: 'Claude Fable 5.1 (via OpenRouter)' },
      { id: 'anthropic/claude-5-5-sonnet', label: 'Claude Sonnet 5.5 (via OpenRouter)' },
      { id: 'anthropic/claude-5-5-opus', label: 'Claude Opus 5.5 (via OpenRouter)' },
      { id: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B (via OpenRouter)' },
      { id: 'meta-llama/llama-3.1-8b-instruct:free', label: 'Llama 3.1 8B (100% Free / Zero Cost)' },
      { id: 'deepseek/deepseek-chat', label: 'DeepSeek V3 (Ultra Cost-Saving · $0.14/M)' },
      { id: 'openrouter/auto', label: 'OpenRouter Auto (Optimal Routing)' },
      { id: 'anthropic/claude-3.7-sonnet', label: 'Claude 3.7 Sonnet (Flagship)' },
      { id: 'deepseek/deepseek-r1', label: 'DeepSeek R1 (Open Reasoning)' },
      { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini (Ultra Cost-Saving)' },
    ],
    defaultModel: 'meta-llama/llama-3.1-8b-instruct:free',
    instructions:
      'Get a key from openrouter.ai. Switch across any model instantly with zero setup hassle.',
  },
  ollama: {
    id: 'ollama',
    name: 'Ollama (Local AI)',
    logo: '🦙',
    description: '100% private, local models on your machine',
    keyLabel: 'API key (optional)',
    keyPlaceholder: 'Not required for local Ollama',
    requiresKey: false,
    route: 'Browser → Ollama (localhost)',
    baseUrl: 'http://localhost:11434',
    baseUrlLabel: 'Ollama base URL',
    models: [
      { id: 'llama3.3', label: 'Llama 3.3' },
      { id: 'deepseek-r1', label: 'DeepSeek R1 (Local)' },
      { id: 'qwen2.5-coder', label: 'Qwen 2.5 Coder' },
      { id: 'mistral', label: 'Mistral 7B' },
      { id: 'phi4', label: 'Microsoft Phi-4' },
      { id: 'gemma2', label: 'Google Gemma 2' },
    ],
    defaultModel: 'llama3.3',
    instructions:
      'Run Ollama locally (`ollama serve`). VileDocx connects to localhost:11434. Set `OLLAMA_ORIGINS=*` if CORS applies.',
  },
};

export const PROVIDER_LIST = Object.values(PROVIDERS);

export function getProvider(id: ProviderId): ProviderDef {
  return PROVIDERS[id] || PROVIDERS.gemini;
}

/**
 * Finds which provider a given model ID belongs to
 */
export function findProviderByModel(modelId: string): ProviderDef | undefined {
  return PROVIDER_LIST.find(p => p.models.some(m => m.id === modelId));
}
