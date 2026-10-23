import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Wand2,
  Bug,
  BookOpen,
  FileCode2,
  Check,
  RotateCcw,
  Bot,
  User,
  GitCompare,
  ArrowRight,
  AlertCircle,
  Copy,
  Terminal,
} from 'lucide-react';
import type { IDEProject, IDEFile, CopilotMessage } from './ideTypes';
import type { ProviderConfig } from '../../lib/credential';
import { createProvider } from '../../providers';

interface CopilotSidebarProps {
  project: IDEProject;
  activeFile?: IDEFile;
  providerConfig: ProviderConfig;
  onApplyProposedDiff: (filePath: string, newContent: string) => void;
  onOpenDiffEditor: (filePath: string, oldCode: string, newCode: string) => void;
  onOpenSettings: () => void;
}

export const CopilotSidebar: React.FC<CopilotSidebarProps> = ({
  project,
  activeFile,
  providerConfig,
  onApplyProposedDiff,
  onOpenDiffEditor,
  onOpenSettings,
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'init',
      role: 'assistant',
      content: `Hello! I am **Docx-IDE Copilot**, powered by your configured **${providerConfig.model}** model.\n\nI can analyze your active files, explain algorithms, refactor code, fix runtime errors, and write unit tests. Select an action below or ask a question!`,
      timestamp: Date.now(),
    },
  ]);

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSendPrompt = async (promptText: string, actionType?: string) => {
    const query = promptText.trim();
    if (!query || isStreaming) return;

    setErrorMsg(null);
    setInput('');

    const userMsg: CopilotMessage = {
      id: 'user_' + Date.now(),
      role: 'user',
      content: query,
      timestamp: Date.now(),
    };

    const assistantMsgId = 'assistant_' + Date.now();
    const assistantMsg: CopilotMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    try {
      const activeFileContext = activeFile
        ? `\n\nActive File (${activeFile.path}):\n\`\`\`${activeFile.language}\n${activeFile.content.slice(0, 8000)}\n\`\`\``
        : '';

      const projectSummary = `Project: ${project.name} (Files: ${Object.keys(project.files).join(', ')})`;

      const systemDirective = `You are Docx-IDE Copilot, an expert AI programming assistant embedded directly in VileDocx IDE.
Provide high quality, concise, and functional code advice.
${projectSummary}
${activeFileContext}

If you propose code changes to an active file, format the final updated file content inside a codeblock clearly marked:
\`\`\`${activeFile?.language || 'typescript'}
// [UPDATED_FILE_CONTENT]
... your complete updated code here ...
\`\`\`
Always ensure your code is complete, syntactically valid, and ready to apply.`;

      const provider = createProvider({
        provider: providerConfig.provider,
        apiKey: providerConfig.apiKey,
        model: providerConfig.model,
        baseUrl: providerConfig.baseUrl,
      });

      let accumulated = '';
      await provider.stream(
        query,
        [{ role: 'user', content: systemDirective }],
        chunk => {
          accumulated += chunk;
          setMessages(prev =>
            prev.map(m => (m.id === assistantMsgId ? { ...m, content: accumulated } : m))
          );
        }
      );

      // Check if code block contains updated code for active file
      if (activeFile && accumulated.includes('```')) {
        const match = accumulated.match(/```(?:[a-zA-Z0-9_-]+)?\n([\s\S]*?)```/);
        if (match && match[1] && match[1].length > 10) {
          const proposedCode = match[1].trim();
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    proposedDiff: {
                      path: activeFile.path,
                      oldCode: activeFile.content,
                      newCode: proposedCode,
                      description: actionType ? `Copilot proposed ${actionType}` : 'Copilot proposed file modification',
                    },
                  }
                : m
            )
          );
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate response.';
      setErrorMsg(message);
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: `⚠️ **Copilot Connection Notice**: ${message}\n\nPlease verify your API key and model settings in **Provider Settings**.`,
              }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleQuickAction = (action: string) => {
    if (!activeFile) {
      setErrorMsg('Please open a file in the editor first to run this action.');
      return;
    }
    switch (action) {
      case 'explain':
        handleSendPrompt(`Please explain how ${activeFile.name} works and breakdown its core components.`, 'explanation');
        break;
      case 'refactor':
        handleSendPrompt(`Please refactor ${activeFile.name} to optimize clean code architecture, readability, and performance. Output the complete updated file.`, 'refactor');
        break;
      case 'bugs':
        handleSendPrompt(`Analyze ${activeFile.name} for potential bugs, edge cases, race conditions, or syntax issues, and propose fixes.`, 'bug fixes');
        break;
      case 'tests':
        handleSendPrompt(`Generate comprehensive unit tests for the functions and components in ${activeFile.name}.`, 'unit tests');
        break;
      case 'docs':
        handleSendPrompt(`Add clean JSDoc and explanatory inline comments throughout ${activeFile.name}. Output the updated file.`, 'documentation');
        break;
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0d1117] text-slate-200 border-l border-[#30363d] overflow-hidden">
      {/* Copilot Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#161b22] border-b border-[#30363d] text-xs select-none flex-none">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-pink-500 to-amber-400 flex items-center justify-center text-white shadow-sm shadow-pink-500/30">
            <Sparkles size={12} />
          </div>
          <div>
            <span className="font-bold text-white tracking-wide">Docx Copilot</span>
            <span className="text-[10px] text-zinc-400 font-mono block leading-none">
              {providerConfig.model}
            </span>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#21262d] text-zinc-300 hover:text-white border border-[#30363d] transition-colors cursor-pointer"
          title="Configure API Provider"
        >
          {providerConfig.provider}
        </button>
      </div>

      {/* Quick Action Ribbon */}
      <div className="p-2 border-b border-[#21262d] bg-[#0d1117] flex items-center gap-1.5 overflow-x-auto text-[11px] select-none flex-none">
        <button
          onClick={() => handleQuickAction('explain')}
          className="px-2 py-1 rounded bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-zinc-300 hover:text-white whitespace-nowrap flex items-center gap-1 transition-colors cursor-pointer"
          title="Explain current active file"
        >
          <BookOpen size={11} className="text-pink-400" />
          <span>Explain</span>
        </button>
        <button
          onClick={() => handleQuickAction('refactor')}
          className="px-2 py-1 rounded bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-zinc-300 hover:text-white whitespace-nowrap flex items-center gap-1 transition-colors cursor-pointer"
          title="Refactor and optimize active file"
        >
          <Wand2 size={11} className="text-amber-400" />
          <span>Refactor</span>
        </button>
        <button
          onClick={() => handleQuickAction('bugs')}
          className="px-2 py-1 rounded bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-zinc-300 hover:text-white whitespace-nowrap flex items-center gap-1 transition-colors cursor-pointer"
          title="Detect and fix bugs"
        >
          <Bug size={11} className="text-rose-400" />
          <span>Fix Bugs</span>
        </button>
        <button
          onClick={() => handleQuickAction('tests')}
          className="px-2 py-1 rounded bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-zinc-300 hover:text-white whitespace-nowrap flex items-center gap-1 transition-colors cursor-pointer"
          title="Generate unit tests"
        >
          <FileCode2 size={11} className="text-cyan-400" />
          <span>Tests</span>
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-xs">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1 ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 px-1 font-mono">
              {msg.role === 'user' ? (
                <>
                  <span>You</span>
                  <User size={10} />
                </>
              ) : (
                <>
                  <Bot size={10} className="text-pink-400" />
                  <span className="text-pink-300 font-semibold">Copilot</span>
                </>
              )}
            </div>

            <div
              className={`p-3 rounded-xl max-w-[94%] leading-relaxed whitespace-pre-wrap break-words ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                  : 'bg-[#161b22] border border-[#30363d] text-slate-200'
              }`}
            >
              {msg.content}

              {/* Proposed Code Diff Review Card */}
              {msg.proposedDiff && (
                <div className="mt-3 p-2.5 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                      <FileCode2 size={11} /> {msg.proposedDiff.path}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {msg.proposedDiff.description}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() =>
                        onOpenDiffEditor(
                          msg.proposedDiff!.path,
                          msg.proposedDiff!.oldCode,
                          msg.proposedDiff!.newCode
                        )
                      }
                      className="px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-zinc-200 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <GitCompare size={12} className="text-cyan-400" />
                      <span>Review Diff</span>
                    </button>

                    <button
                      disabled={msg.proposedDiff.applied}
                      onClick={() => {
                        onApplyProposedDiff(msg.proposedDiff!.path, msg.proposedDiff!.newCode);
                        setMessages(prev =>
                          prev.map(m =>
                            m.id === msg.id && m.proposedDiff
                              ? { ...m, proposedDiff: { ...m.proposedDiff, applied: true } }
                              : m
                          )
                        );
                      }}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        msg.proposedDiff.applied
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40 cursor-default'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      <Check size={12} />
                      <span>{msg.proposedDiff.applied ? 'Applied' : 'Apply to File'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isStreaming && (
          <div className="flex items-center gap-2 text-xs text-pink-400 font-mono p-2 animate-pulse">
            <Sparkles size={13} className="animate-spin" />
            <span>Copilot is reasoning and generating...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input box */}
      <div className="p-2.5 bg-[#161b22] border-t border-[#30363d] flex-none">
        {errorMsg && (
          <div className="mb-2 p-1.5 rounded bg-rose-950/80 border border-rose-500/30 text-rose-300 text-[11px] flex items-center justify-between">
            <span className="truncate">{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-zinc-400 hover:text-white ml-1 text-xs">
              ×
            </button>
          </div>
        )}

        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendPrompt(input);
          }}
          className="flex items-end gap-1.5 bg-[#0d1117] rounded-xl border border-[#30363d] p-1.5 focus-within:border-pink-500 transition-colors"
        >
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendPrompt(input);
              }
            }}
            placeholder="Ask Copilot or explain code... (Enter to send)"
            rows={2}
            className="w-full bg-transparent text-xs text-slate-100 placeholder-zinc-500 outline-none resize-none px-1 py-0.5 leading-relaxed"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="p-2 rounded-lg bg-pink-600 hover:bg-pink-500 disabled:opacity-30 disabled:hover:bg-pink-600 text-white transition-all cursor-pointer flex-none"
            title="Send to Copilot"
          >
            <Send size={13} />
          </button>
        </form>
      </div>
    </div>
  );
};
