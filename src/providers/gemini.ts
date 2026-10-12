import { GoogleGenAI } from '@google/genai';
import type { AIProvider, ChatTurn } from './types';

/** Browser-only provider. The user key is passed directly to Google; no VileDocx server exists in this request path. */
export class GeminiProvider implements AIProvider {
  constructor(private key: string, private model = 'gemini-3.5-flash') {}
  async testConnection() {
    const ai = new GoogleGenAI({ apiKey: this.key });
    await ai.models.generateContent({ model: this.model, contents: 'Reply with: connected' });
  }
  async stream(prompt: string, history: ChatTurn[], onChunk: (text: string) => void) {
    const ai = new GoogleGenAI({ apiKey: this.key });
    let systemInstruction: string | undefined = undefined;
    const cleanHistory: ChatTurn[] = [];

    for (let i = 0; i < history.length; i++) {
      const turn = history[i];
      if (turn.role === 'user' && turn.content.startsWith('[SYSTEM DIRECTIVE:')) {
        const text = turn.content.replace(/^\[SYSTEM DIRECTIVE:\s*/, '').replace(/\]$/, '');
        systemInstruction = systemInstruction ? `${systemInstruction}\n\n${text}` : text;
        if (history[i + 1]?.role === 'model' && history[i + 1]?.content.startsWith('Understood.')) {
          i++; // Skip acknowledgement turn
        }
      } else {
        cleanHistory.push(turn);
      }
    }

    const contents = [
      ...cleanHistory.map(t => ({ role: t.role, parts: [{ text: t.content }] })),
      { role: 'user' as const, parts: [{ text: prompt }] },
    ];

    const stream = await ai.models.generateContentStream({
      model: this.model,
      contents,
      ...(systemInstruction ? { config: { systemInstruction } } : {}),
    });
    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) onChunk(text);
    }
  }
}
