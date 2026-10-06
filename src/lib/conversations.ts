import type { Message } from '../types';

export type Conversation = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  model?: string;
};

const CONVERSATIONS_KEY = 'viledocx:conversations:v1';
const ACTIVE_CONV_KEY = 'viledocx:active_conv:v1';

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY) || localStorage.getItem('aplx:conversations:v1');
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Sanitize any legacy "Aplx" mentions to "Docx"
        return parsed.map((conv: Conversation) => ({
          ...conv,
          messages: (conv.messages || []).map((m: Message) => ({
            ...m,
            content: m.content ? m.content.replace(/\bAplx\b/gi, 'Docx') : m.content,
          })),
        }));
      }
    }
  } catch {}

  const defaultConv: Conversation = {
    id: 'default',
    title: 'A new beginning',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [
      {
        id: 'welcome',
        role: 'model',
        time: 'now',
        content:
          "Welcome to **Docx**.\n\nI'm your private AI assistant — connect any supported provider in Settings (Gemini, ChatGPT, Groq, OpenRouter, or Ollama) and customize your space with themes, interactive pets, and smart token optimization.",
      },
    ],
  };
  saveConversations([defaultConv]);
  return [defaultConv];
}

export function saveConversations(conversations: Conversation[]) {
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  } catch {}
}

export function getActiveConversationId(): string {
  try {
    const id = localStorage.getItem(ACTIVE_CONV_KEY) || localStorage.getItem('aplx:active_conv:v1');
    if (id) return id;
  } catch {}
  return 'default';
}

export function setActiveConversationId(id: string) {
  try {
    localStorage.setItem(ACTIVE_CONV_KEY, id);
  } catch {}
}

export function generateTitleFromPrompt(prompt: string): string {
  const clean = prompt.replace(/[\n\r]+/g, ' ').trim();
  if (clean.length <= 32) return clean || 'New Chat';
  return clean.slice(0, 32).trim() + '…';
}
