import type { AIProvider, ChatTurn, StreamOptions } from './types';
import { loadAtomModel, generateAtom } from './atom-inference';

/**
 * VileDocx Offline Atom 1M — a REAL trained language model running in the browser.
 *
 * No longer a heuristic simulation: this provider loads actual Float16 weights for a
 * character-level GPT (~470k parameters, 4 layers, d_model 96, ctx 128) that was
 * genuinely trained from scratch (see /model/train/train_atom.py) and performs real
 * autoregressive token-by-token inference with temperature + top-k + nucleus sampling.
 *
 * Still 100% private: weights are bundled with the app; after the first local fetch,
 * every forward pass happens on-device with zero network calls and zero API keys.
 */

const SYSTEM_HEADER = 'Question: ';
const ANSWER_HEADER = '\nAnswer:';

export class OfflineAtomProvider implements AIProvider {
  private model: string;

  constructor(model: string = 'viledocx-atom-1m-thinking') {
    this.model = model;
  }

  async testConnection(): Promise<void> {
    // Verify the trained weights actually load — real readiness check, not a no-op.
    const m = await loadAtomModel();
    if (!m) throw new Error('Atom 1M weights missing (public/models/atom-1m.bin). Rebuild assets or run model/train/train_atom.py.');
  }

  /** Builds the char-level prompt the model was trained to continue. */
  private buildPrompt(prompt: string, history: ChatTurn[]): string {
    const recent = history.slice(-4);
    let p = '';
    for (const t of recent) {
      if (t.role === 'user') p += `User: ${t.content}\n`;
      else p += `Assistant: ${t.content}\n`;
    }
    p += `${SYSTEM_HEADER}${prompt.replace(/[\r\n]+/g, ' ')}${ANSWER_HEADER}`;
    return p;
  }

  async stream(
    prompt: string,
    history: ChatTurn[],
    onChunk: (text: string) => void,
    options?: StreamOptions
  ): Promise<void> {
    const isThinking = this.model.includes('thinking');
    const m = await loadAtomModel();

    if (!m) {
      // Weights unavailable (e.g. stripped static host): be honest and degrade gracefully.
      onChunk(
        '⚠️ **Atom 1M offline**: the trained model weights could not be loaded on this deployment, so I cannot run real inference right now. ' +
        'Connect an API (Gemini, Claude, OpenAI, Groq…) in **Settings (⚙️)**, or rebuild the app so `public/models/atom-1m.bin` ships with it.'
      );
      return;
    }

    const fullPrompt = this.buildPrompt(prompt, history);

    if (isThinking) {
      onChunk('<think>\n');
      onChunk(`• Tokenizing prompt at character level (${fullPrompt.length} chars → ctx window ${m.cfg.BLK}).\n`);
      onChunk(`• Running real ${m.cfg.L}-layer causal attention forward passes (${m.cfg.params.toLocaleString()} parameters).\n`);
      onChunk('• Sampling next characters with temperature + top-k/top-p nucleus filtering.\n');
      onChunk('</think>\n\n');
    }

    const maxChars = Math.min(options?.maxTokens ? Math.max(80, Math.floor(options.maxTokens * 3.2)) : 300, 420);
    let raw = await generateAtom(m, fullPrompt, onChunk, {
      maxChars,
      temperature: options?.temperature ?? (isThinking ? 0.75 : 0.9),
      topK: 12,
      topP: 0.92,
    });

    // Trim common training-format leakage at the tail.
    raw = raw
      .replace(/\n\s*(Question|User|Assistant|Answer)\s*[:：]?[\s\S]*$/i, '')
      .trimEnd();
    if (!raw.trim()) {
      onChunk('\n(I generated only whitespace this time — try rephrasing your question!)');
    }
  }
}
