import type { AIProvider, ChatTurn } from './types';

export class OllamaProvider implements AIProvider {
  constructor(private baseUrl: string, private model: string) {}

  private url(path: string) {
    return `${this.baseUrl.replace(/\/$/, '')}${path}`;
  }

  async testConnection() {
    const res = await fetch(this.url('/api/tags'));
    if (!res.ok) throw new Error(`Ollama unreachable (${res.status})`);
  }

  async stream(prompt: string, history: ChatTurn[], onChunk: (text: string) => void) {
    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [];

    for (let i = 0; i < history.length; i++) {
      const turn = history[i];
      if (turn.role === 'user' && turn.content.startsWith('[SYSTEM DIRECTIVE:')) {
        const extracted = turn.content.replace(/^\[SYSTEM DIRECTIVE:\s*/, '').replace(/\]$/, '');
        messages.push({ role: 'system', content: extracted });
        if (history[i + 1]?.role === 'model' && history[i + 1]?.content.startsWith('Understood.')) {
          i++; // skip acknowledgement
        }
      } else {
        messages.push({
          role: turn.role === 'model' ? ('assistant' as const) : ('user' as const),
          content: turn.content,
        });
      }
    }

    messages.push({ role: 'user' as const, content: prompt });

    const res = await fetch(this.url('/api/chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.model, messages, stream: true }),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => res.statusText);
      throw new Error(err || `Ollama request failed (${res.status})`);
    }
    const reader = res.body?.getReader();
    if (!reader) throw new Error('No response stream');

    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          const text = json.message?.content;
          if (text) onChunk(text);
        } catch { /* skip */ }
      }
    }
  }
}
