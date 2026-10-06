export type ChatTurn = { role: 'user' | 'model'; content: string };

/**
 * Optional per-request generation controls. Used by the SWARM engine to hand each bot
 * its own isolated context/output budget so no single bot can blow through the shared
 * API key's rate limit. Providers that don't support a control simply ignore it.
 */
export type StreamOptions = { maxTokens?: number; temperature?: number };

export interface AIProvider { stream(prompt: string, history: ChatTurn[], onChunk: (text: string) => void, options?: StreamOptions): Promise<void>; testConnection(): Promise<void>; }
