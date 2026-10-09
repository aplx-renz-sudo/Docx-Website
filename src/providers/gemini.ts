import { GoogleGenAI } from '@google/genai';
import type { AIProvider, ChatTurn } from './types';

/**
 * Browser-only provider. The user key is passed directly to Google; no VileDocx server
 * exists in this request path.
 *
 * The key comes exclusively from the user's browser-local storage (credential.ts).
 * Any GEMINI_API_KEY / GEMINI_NEXT_GEN_API_KEY environment variable on the host is
 * intentionally ignored — keys are never read from the filesystem or build env.
 */
export class GeminiProvider implements AIProvider {
  constructor(private key: string, private model = 'gemini-3.5-flash') {
    // Guard: fail loudly if the caller accidentally passed an env-var-derived key.
    // Real user keys enter through the UI and are stored in localStorage/sessionStorage
    // by credential.ts — they never originate from process.env or a .env file.
    if (typeof window === 'undefined' && this.key) {
      throw new Error(
        'GeminiProvider must only be used in the browser. API keys are stored locally by the user, never injected from the server environment.'
      );
    }
  }
  async testConnection() {
    const ai = new GoogleGenAI({ apiKey: this.key });
    await ai.models.generateContent({ model: this.model, contents: 'Reply with: connected' });
  }
  async stream(prompt: string, history: ChatTurn[], onChunk: (text: string) => void) {
    const ai = new GoogleGenAI({ apiKey: this.key });
    const contents = [
      ...history.map(t => ({ role: t.role, parts: [{ text: t.content }] })),
      { role: 'user' as const, parts: [{ text: prompt }] },
    ];
    const stream = await ai.models.generateContentStream({ model: this.model, contents });
    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) onChunk(text);
    }
  }
}
