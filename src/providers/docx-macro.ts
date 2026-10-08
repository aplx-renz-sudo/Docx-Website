import { LoggerWithoutDebug, Wllama } from '@wllama/wllama/esm/index.js';
import type { ChatCompletionMessage } from '@wllama/wllama/esm/index.js';
// Vite inlines the compat worker as a string and emits its wasm as a local asset.
import compatWorkerCode from '@wllama/wllama-compat/wasm/wllama.js?raw';
import compatWasmUrl from '@wllama/wllama-compat/wasm/wllama.wasm?url';
import type { AIProvider, ChatTurn } from './types';

/**
 * Docx Macro 135M: the real SmolLM-135M-Instruct weights that ship inside this
 * folder, executed in the browser by llama.cpp compiled to WebAssembly (wllama).
 * Nothing to install: the GGUF is served from public/models/ and the wasm from
 * public/wllama/, so a plain static host is enough.
 */

const MODEL_URL = '/models/docx-macro-135m.gguf';
const WASM_URL = '/wllama/wllama.wasm';

// A 135M model follows short instructions best. A self-describing prompt just
// makes it parrot that description back instead of answering.
const SYSTEM_PROMPT = 'You are a helpful assistant. Answer in one short paragraph.';

// The model was trained with a 2048 token window. Characters are a cheap proxy for tokens.
const HISTORY_CHAR_BUDGET = 4200;
const MAX_NEW_TOKENS = 200;

let enginePromise: Promise<Wllama> | null = null;

const MemoryCtor = WebAssembly.Memory as unknown as new (
  descriptor: Record<string, unknown>
) => WebAssembly.Memory;

/** wllama's default build needs memory64, which older browsers (and Electron 33) lack. */
function supportsMemory64(): boolean {
  try {
    new MemoryCtor({ initial: 1n, maximum: 2n, address: 'i64' });
    return true;
  } catch {
    return false;
  }
}

/** JSPI is the other feature the default build leans on for async weight reads. */
function supportsJspi(): boolean {
  return typeof (WebAssembly as unknown as { promising?: unknown }).promising === 'function';
}

function preferredThreads(): number {
  const cores = typeof navigator === 'undefined' ? 1 : navigator.hardwareConcurrency || 1;
  // Multi-thread needs cross-origin isolation; wllama falls back to single thread on its own.
  return Math.max(1, Math.min(4, Math.floor(cores / 2)));
}

function createEngine(): Wllama {
  const engine = new Wllama({ default: WASM_URL }, { logger: LoggerWithoutDebug });

  if (supportsMemory64() && supportsJspi()) {
    engine.setCompat(null);
  } else {
    // Self-hosted compat build: slower, but it runs where the default build cannot.
    engine.setCompat(
      { wasm: compatWasmUrl, worker: { code: compatWorkerCode } },
      'firefox_safari'
    );
  }

  return engine;
}

/**
 * Load the bundled model once per tab. Progress goes to the console on purpose:
 * anything streamed to the chat would be stored as assistant output and then fed
 * back as history, which makes such a small model mimic it instead of answering.
 */
async function getEngine(): Promise<Wllama> {
  if (enginePromise) return enginePromise;

  const startedAt = Date.now();
  enginePromise = (async () => {
    const engine = createEngine();
    let milestone = 0;

    await engine.loadModelFromUrl(MODEL_URL, {
      n_ctx: 2048,
      n_threads: preferredThreads(),
      // CPU only, so machines without WebGPU still work and never hit a GPU init failure.
      n_gpu_layers: 0,
      useCache: true,
      progressCallback: ({ loaded, total }) => {
        if (!total) return;
        const pct = Math.floor((loaded / total) * 100);
        if (pct >= milestone + 25) {
          milestone = pct - (pct % 25);
          console.info(`[Docx Macro 135M] reading local weights: ${milestone}%`);
        }
      },
    });

    console.info(
      `[Docx Macro 135M] ready in ${((Date.now() - startedAt) / 1000).toFixed(1)}s, running on this device.`
    );
    return engine;
  })();

  try {
    return await enginePromise;
  } catch (err) {
    // Do not cache a failed engine, otherwise the next try would replay the same error.
    enginePromise = null;
    throw err;
  }
}

/** Drop status lines a build before this one could have leaked into older transcripts. */
function stripEngineNoise(content: string): string {
  return content
    .split('\n')
    .filter(line => !line.startsWith('> Docx Macro 135M') && !/^> fetching local weights:/.test(line))
    .join('\n')
    .trim();
}

function buildMessages(prompt: string, history: ChatTurn[]): ChatCompletionMessage[] {
  const messages: ChatCompletionMessage[] = [{ role: 'system', content: SYSTEM_PROMPT }];

  const kept: ChatTurn[] = [];
  let used = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    const turn = history[i];
    if (!turn?.content) continue;
    const content = stripEngineNoise(turn.content);
    if (!content) continue;
    used += content.length;
    if (used > HISTORY_CHAR_BUDGET) break;
    kept.unshift({ role: turn.role, content });
  }

  for (const turn of kept) {
    messages.push({ role: turn.role === 'model' ? 'assistant' : 'user', content: turn.content });
  }
  messages.push({ role: 'user', content: prompt });
  return messages;
}

export class DocxMacroProvider implements AIProvider {
  constructor(private model: string = 'docx-macro-135m') {}

  async testConnection(): Promise<void> {
    await getEngine();
  }

  async stream(prompt: string, history: ChatTurn[], onChunk: (text: string) => void): Promise<void> {
    const engine = await getEngine();
    const messages = buildMessages(prompt, history);

    await engine.createChatCompletion({
      messages,
      stream: true,
      max_tokens: MAX_NEW_TOKENS,
      // Sampler values below are what a measured sweep produced: this pair is
      // fastest and stops the model looping on one sentence, which plain greedy
      // decoding does constantly at 135M parameters.
      temperature: 0.8,
      top_p: 0.95,
      top_k: 50,
      penalty_repeat: 1.1,
      penalty_last_n: 128,
      // No stop list needed: llama.cpp halts on the EOG token, the ChatML
      // <|im_end|> this checkpoint was trained with.
      onData: chunk => {
        const text = chunk.choices?.[0]?.delta?.content;
        if (text) onChunk(text);
      },
    });
  }
}

/** Warm the engine up ahead of the first message, e.g. from the settings screen. */
export function preloadDocxMacro(): Promise<void> {
  return getEngine().then(() => undefined);
}
