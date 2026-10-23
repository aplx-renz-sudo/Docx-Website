import { useEffect, useRef, useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Save,
  Check,
  ChevronLeft,
  ChevronDown,
  Copy,
  Megaphone,
  Menu,
  MessageSquarePlus,
  MoreHorizontal,
  Move,
  Orbit,
  Globe,
  RotateCcw,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
  WandSparkles,
  Telescope,
  BookOpen,
  Code2,
  KeyRound,
  Zap,
  Cat,
  Palette,
  BrainCircuit,
  Sliders,
  Download,
  Upload,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Paperclip,
  Search,
  Pencil,
  Command,
  Plus,
  HelpCircle,
  Gamepad2,
  Cpu,
  User,
  UserCheck,
  ExternalLink,
  Hammer,
  Scale,
  FileText,
  ShieldAlert,
  Lock,
  CheckCircle2,
  Activity,
  Terminal,
  Film,
  Image as ImageIcon,
  Users,
  Info,
} from 'lucide-react';
import { createProvider, isProviderReady } from './providers';
import type { ChatTurn } from './providers/types';
import { getProvider, type ProviderId } from './providers/registry';
import { clearLocalData, loadProviderConfig, saveProviderConfig, type ProviderConfig } from './lib/credential';
import { ChatModelSelect, ProviderSettings } from './components/ProviderSettings';
import { AboutPage } from './pages/AboutPage';
import { PetCompanion, type PetMood } from './components/PetCompanion';
import { PetArtwork } from './components/PetArtwork';
import { ThinkingIndicator } from './components/ThinkingIndicator';
import { TokenSaverBadge } from './components/TokenSaverBadge';
import { SwarmMetricsHeaderWidget } from './components/SwarmMetricsHeaderWidget';
import { CodeBlock } from './components/CodeBlock';
import { GalaxyLogo, GalaxyLogoMini } from './components/GalaxyLogo';
import { DocxIDEView } from './components/ide/DocxIDEView';
import { BuildModeView } from './components/BuildModeView';
import { MediaStudioView } from './components/MediaStudioView';
import { MultipleWorkersSettingsTab } from './components/MultipleWorkersSettingsTab';
import { PromptLibraryModal } from './components/PromptLibraryModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { OfflineAccountModal } from './components/OfflineAccountModal';
import { CelestialCatTreeHero } from './components/CelestialCatTreeHero';
import { InteractiveTourGuide } from './components/InteractiveTourGuide';
import { ApiKeyRequiredModal } from './components/ApiKeyRequiredModal';
import { InstallModal } from './components/InstallModal';
import { ConnectDeveloperModal } from './components/ConnectDeveloperModal';
import { ApiLimitModal } from './components/ApiLimitModal';
import { isApiLimitError, triggerApiLimitModal, subscribeToApiLimit } from './lib/apiLimitHandler';
import { detectLocalOfflineModels, getCachedLocalModels, type LocalDetectionResult } from './lib/localModelDetector';
import { LanguagesSettingsTab } from './components/LanguagesSettingsTab';
import { LanguageDropdown } from './components/LanguageDropdown';
import { getTranslation, getProviderLanguageDirective, getLanguageName, SUPPORTED_LANGUAGES, type LanguageCode } from './lib/i18n';
import {
  AppearanceSettings,
  TokenSaverSettings,
  PetSettings,
  ThinkingSettings,
  PersonaSettings,
  DataManagementSettings,
} from './components/CustomizerSettings';
import { PrivacyNoticeView } from './components/PrivacyNoticeView';
import { sounds } from './lib/audio';
import { loadTokenStats, saveTokenStats, optimizeTokens } from './lib/tokenSaver';
import {
  loadConversations,
  saveConversations,
  getActiveConversationId,
  setActiveConversationId,
  generateTitleFromPrompt,
  type Conversation,
} from './lib/conversations';
import { startSpeechRecognition, speakText, stopSpeaking, isSpeechRecognitionSupported } from './lib/speech';
import { loadUserProfile, saveUserProfile, isUserSetupComplete, removeUserProfile } from './lib/userProfile';
import { checkAntiDDoS, sanitizeInputPayload } from './lib/securityGuard';
import type { View, Message, Preferences, TokenStats, UserProfile, PetId, ThemeMode, ChatPositionsConfig } from './types';
import { defaultChatPositions } from './types';
import { ChatPositionsBar, SectionPositionHandle } from './components/ChatPositionsBar';

const preferenceKey = 'viledocx:preferences:v3';

const defaultPreferences: Preferences = {
  themeMode: 'halloween',
  theme: 'black',
  themeGradientTarget: 'both',
  customTheme: {
    enabled: false,
    gradientStart: '#000000',
    gradientEnd: '#141414',
    gradientAngle: 135,
    accentColor: '#ffffff',
    glowIntensity: 0,
    backgroundTint: '#000000',
    gradientTarget: 'both',
  },
  font: 'system',
  bubbleStyle: 'minimal',
  compact: false,
  sendOnEnter: true,
  motion: true,
  soundEffects: false,

  petId: 'none',
  petSize: 'medium',
  petPosition: 'bottom-right',
  petInteractive: false,

  thinkingStyle: 'minimal',
  showThinkingTimer: true,
  thinkingDelayMs: 0,

  tokenSaverMode: 'balanced',
  tokenSaverTargetPercent: 22,

  persona: 'helpful',
  customSystemPrompt: 'You are VileDocx, an advanced, private, and precise AI assistant.',
  temperature: 0.7,
  maxHistoryTurns: 12,
  streamSpeed: 'normal',
  language: 'en',

  multipleWorkers: {
    enabled: true,
    deliberationDepth: 'deep',
    showDeliberationStream: true,
    autoWatchmanFallback: true,
    activeWorkerCount: 6,
    apiMode: 'single',
    useModelVariants: true,
    costSavingTier: 'ultra',
    longevityMode: 'endurance_1hr',
    botApiConfigs: {},
    keyPool: [],
  },
};

const now = () => new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(new Date());

function Mark({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code: ({ className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match && !String(children).includes('\n');
          if (isInline) {
            return (
              <code className="font-mono text-xs bg-[#121b2d] border border-[#8ea8ff26] px-1.5 py-0.5 rounded text-[#d6e4ff]" {...props}>
                {children}
              </code>
            );
          }
          return <CodeBlock language={match ? match[1] : ''} code={String(children).replace(/\n$/, '')} />;
        },
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [providerConfig, setProviderConfig] = useState<ProviderConfig>(loadProviderConfig);

  // User Profile (Offline Account)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(loadUserProfile);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [guideDismissed, setGuideDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('viledocx:guide_dismissed') === 'true' || localStorage.getItem('aplx:guide_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  // Multi-conversation state
  const [conversations, setConversations] = useState<Conversation[]>(loadConversations);
  const [activeConvId, setActiveConvId] = useState<string>(getActiveConversationId);
  const [searchHistory, setSearchHistory] = useState('');
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editConvTitle, setEditConvTitle] = useState('');

  const [sidebar, setSidebar] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > 760;
    }
    return true;
  });
  const [settingsTab, setSettingsTab] = useState<
    'provider' | 'tokensaver' | 'workers' | 'appearance' | 'pets' | 'thinking' | 'persona' | 'languages' | 'privacy' | 'about'
  >('provider');
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [petMood, setPetMood] = useState<PetMood>('idle');
  const [tokenStats, setTokenStats] = useState<TokenStats>(loadTokenStats);

  // Modal states
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showPromptLib, setShowPromptLib] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showMoreSidebarOptions, setShowMoreSidebarOptions] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

  // Local Offline Model Auto-Detection & Key Enforcement State
  const [localDetection, setLocalDetection] = useState<LocalDetectionResult | null>(getCachedLocalModels);
  const [missingKeyModal, setMissingKeyModal] = useState<{
    isOpen: boolean;
    providerId: ProviderId;
    providerName: string;
  }>({
    isOpen: false,
    providerId: 'gemini',
    providerName: 'Google Gemini',
  });

  // API Rate Limit & Quota "Touch Grass" Modal State
  const [apiLimitModal, setApiLimitModal] = useState<{
    isOpen: boolean;
    providerName?: string;
    details?: string;
  }>({
    isOpen: false,
  });

  useEffect(() => {
    const unsubscribe = subscribeToApiLimit(detail => {
      setApiLimitModal({
        isOpen: true,
        providerName: detail.providerName || getProvider(providerConfig.provider).name,
        details: detail.details,
      });
    });
    return unsubscribe;
  }, [providerConfig.provider]);

  // Auto-detect local offline models on mount
  useEffect(() => {
    let isMounted = true;
    detectLocalOfflineModels(providerConfig.baseUrls?.ollama || providerConfig.baseUrl).then(res => {
      if (isMounted) {
        setLocalDetection(res);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const [preferences, setPreferences] = useState<Preferences>(() => {
    try {
      const saved = localStorage.getItem(preferenceKey) || localStorage.getItem('aplx:preferences:v3') || localStorage.getItem('aplx:preferences:v2');
      const savedLang = (localStorage.getItem('viledocx:language') || 'en') as LanguageCode;
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultPreferences,
          ...parsed,
          language: (savedLang || parsed.language || 'en') as LanguageCode,
        };
      }
      if (savedLang) {
        return { ...defaultPreferences, language: savedLang };
      }
    } catch {}
    return defaultPreferences;
  });

  const lang: LanguageCode = preferences.language || 'en';
  const t = getTranslation(lang);

  useEffect(() => {
    const activeLang = preferences.language || 'en';
    document.documentElement.lang = activeLang;
    document.body.setAttribute('data-lang', activeLang);
    try {
      localStorage.setItem('viledocx:language', activeLang);
    } catch {}
  }, [preferences.language]);

  const [ddosAlert, setDdosAlert] = useState<string | null>(null);
  const [isPositionMode, setIsPositionMode] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const saveToastTimer = useRef<number | null>(null);

  const showSaveToast = (msg: string) => {
    setSaveToast(msg);
    if (saveToastTimer.current) clearTimeout(saveToastTimer.current);
    saveToastTimer.current = window.setTimeout(() => {
      setSaveToast(null);
    }, 3000);
  };

  const CHAT_POSITIONS_KEY = 'viledocx_chat_positions_v1';

  const [savedPositions, setSavedPositions] = useState<ChatPositionsConfig>(() => {
    try {
      const raw = localStorage.getItem(CHAT_POSITIONS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...defaultChatPositions, ...parsed };
      }
    } catch {}
    return defaultChatPositions;
  });

  const [draftPositions, setDraftPositions] = useState<ChatPositionsConfig>(savedPositions);

  const activePositions = isPositionMode ? draftPositions : savedPositions;
  const hasUnsavedPositions = useMemo(() => {
    return JSON.stringify(draftPositions) !== JSON.stringify(savedPositions);
  }, [draftPositions, savedPositions]);

  const handleSavePositions = () => {
    try {
      localStorage.setItem(CHAT_POSITIONS_KEY, JSON.stringify(draftPositions));
      setSavedPositions(draftPositions);
      showSaveToast("Positions saved to your device!");
      if (preferences.soundEffects) sounds.playComplete();
    } catch (e) {
      console.error("Failed to save positions", e);
    }
  };

  const handleResetPositions = () => {
    setDraftPositions(defaultChatPositions);
    showSaveToast("Reset to default layout positions. Click 'Save' to keep!");
  };

  const composerWidthClass = useMemo(() => {
    switch (activePositions.composerWidth) {
      case 'compact':
        return 'max-w-[640px]';
      case 'wide':
        return 'max-w-[960px]';
      case 'full':
        return 'max-w-none w-full px-2 sm:px-6';
      case 'normal':
      default:
        return 'max-w-[768px]';
    }
  }, [activePositions.composerWidth]);

  const composerAlignClass = useMemo(() => {
    switch (activePositions.composerAlign) {
      case 'left':
        return 'mr-auto ml-0 sm:ml-4';
      case 'right':
        return 'ml-auto mr-0 sm:mr-4';
      case 'center':
      default:
        return 'mx-auto';
    }
  }, [activePositions.composerAlign]);

  const stop = useRef(false);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLElement>(null);
  const typingTimer = useRef<number | null>(null);
  const speechRecognizer = useRef<{ stop: () => void } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered conversations based on search
  const filteredConversations = useMemo(() => {
    if (!searchHistory.trim()) return conversations;
    const q = searchHistory.toLowerCase();
    return conversations.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.messages.some(m => m.content.toLowerCase().includes(q))
    );
  }, [conversations, searchHistory]);

  // Current active conversation
  const currentConversation = useMemo(() => {
    return conversations.find(c => c.id === activeConvId) || conversations[0];
  }, [conversations, activeConvId]);

  const messages = currentConversation?.messages || [];

  const updatePreferences = (next: Preferences) => {
    setPreferences(next);
    try {
      localStorage.setItem(preferenceKey, JSON.stringify(next));
    } catch {}
  };

  const goSettings = (tab: typeof settingsTab = 'provider') => {
    setSettingsTab(tab);
    setView('settings');
  };

  const persistProvider = (config: ProviderConfig) => {
    setProviderConfig(config);
    saveProviderConfig(config);
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowPromptLib(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        goSettings('provider');
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleCreateNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [conversations]);

  const handleInputChange = (val: string) => {
    setInput(val);
    if (val.trim()) {
      setPetMood('typing');
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = window.setTimeout(() => {
        setPetMood('idle');
      }, 1500);
    }
  };

  const updateCurrentMessages = (updater: (prev: Message[]) => Message[]) => {
    setConversations(prev => {
      const updated = prev.map(c => {
        if (c.id === currentConversation.id) {
          const newMsgs = updater(c.messages);
          return {
            ...c,
            messages: newMsgs,
            updatedAt: Date.now(),
          };
        }
        return c;
      });
      saveConversations(updated);
      return updated;
    });
  };

  // Move message position up or down in chat sequence (User-side only)
  const handleMoveMessage = (messageId: string, direction: 'up' | 'down') => {
    updateCurrentMessages(prev => {
      const idx = prev.findIndex(m => m.id === messageId);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(idx, 1);
      updated.splice(targetIdx, 0, moved);
      return updated;
    });
    if (preferences.soundEffects) sounds.playComplete();
    showSaveToast(`Message moved ${direction === 'up' ? 'up' : 'down'} • Saved on device`);
  };

  // Jump message directly to 1-based position
  const handleSetMessagePosition = (messageId: string, targetPos1Based: number) => {
    updateCurrentMessages(prev => {
      const idx = prev.findIndex(m => m.id === messageId);
      if (idx === -1) return prev;
      const targetIdx = Math.max(0, Math.min(targetPos1Based - 1, prev.length - 1));
      if (idx === targetIdx) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(idx, 1);
      updated.splice(targetIdx, 0, moved);
      return updated;
    });
    if (preferences.soundEffects) sounds.playComplete();
    showSaveToast(`Repositioned to #${targetPos1Based} • Saved on device`);
  };

  // Save content edit user-side only (does NOT re-trigger API or wipe history)
  const handleSaveMessageContent = (messageId: string, newContent: string) => {
    updateCurrentMessages(prev =>
      prev.map(m =>
        m.id === messageId
          ? {
              ...m,
              content: newContent,
              edited: true,
              editedAt: Date.now(),
            }
          : m
      )
    );
    if (preferences.soundEffects) sounds.playComplete();
    showSaveToast('✓ Message edit saved on your device (Client-only)');
  };

  // Delete an individual message turn from conversation
  const handleDeleteMessage = (messageId: string) => {
    updateCurrentMessages(prev => prev.filter(m => m.id !== messageId));
    if (preferences.soundEffects) sounds.playComplete();
    showSaveToast('Message removed from local chat');
  };

  const handleCreateNewChat = () => {
    const newId = `conv-${Date.now()}`;
    const newConv: Conversation = {
      id: newId,
      title: 'New conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [
        {
          id: 'welcome',
          role: 'model',
          time: now(),
          content: `Welcome to **VileDocx**.\n\nWhat would you like to explore or build today?`,
        },
      ],
    };
    const updated = [newConv, ...conversations];
    setConversations(updated);
    saveConversations(updated);
    setActiveConvId(newId);
    setActiveConversationId(newId);
    setView('chat');
    setSidebar(false);
    setPetMood('idle');
    stopSpeaking();
  };

  const handleSwitchConversation = (id: string) => {
    setActiveConvId(id);
    setActiveConversationId(id);
    setSidebar(false);
    stopSpeaking();
  };

  const handleDeleteConversation = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const remaining = conversations.filter(c => c.id !== id);
    setConversations(remaining);
    saveConversations(remaining);
    if (remaining.length === 0) {
      setActiveConvId('');
      setActiveConversationId('');
    } else if (activeConvId === id) {
      const nextId = remaining[0].id;
      setActiveConvId(nextId);
      setActiveConversationId(nextId);
    }
  };

  const handleRemoveAccount = () => {
    removeUserProfile();
    setUserProfile(null);
    // Profile is cleanly removed; keep conversations intact so user can create a new profile immediately or anytime
    if (preferences.soundEffects) sounds.playClick();
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    const updated = conversations.map(c => (c.id === id ? { ...c, title: newTitle.trim() || 'Untitled' } : c));
    setConversations(updated);
    saveConversations(updated);
    setEditingConvId(null);
  };

  // Launch button handler: checks if offline account setup is complete
  const handleLaunchApp = () => {
    if (!isUserSetupComplete()) {
      setShowAccountModal(true);
    } else {
      setView('chat');
    }
  };

  const handleAccountComplete = (profile: UserProfile, startTour: boolean) => {
    setUserProfile(profile);
    saveUserProfile(profile);
    setShowAccountModal(false);
    setView('chat');
    setGuideDismissed(true);
    try {
      localStorage.setItem('viledocx:guide_dismissed', 'true');
    } catch {}
    if (startTour) {
      setShowTour(true);
    }
  };

  // Voice dictation toggle
  const toggleVoiceInput = () => {
    if (isRecordingVoice) {
      speechRecognizer.current?.stop();
      setIsRecordingVoice(false);
    } else {
      const recognizer = startSpeechRecognition(
        transcript => {
          setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
        },
        () => setIsRecordingVoice(false),
        () => setIsRecordingVoice(false)
      );
      if (recognizer) {
        speechRecognizer.current = recognizer;
        setIsRecordingVoice(true);
      } else {
        alert('Speech recognition is not supported in this browser.');
      }
    }
  };

  // Text-to-Speech Speak toggle
  const toggleReadAloud = (msg: Message) => {
    if (speakingMsgId === msg.id) {
      stopSpeaking();
      setSpeakingMsgId(null);
    } else {
      setSpeakingMsgId(msg.id);
      speakText(msg.content, () => setSpeakingMsgId(null));
    }
  };

  // File context ingestion
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      if (content) {
        setAttachmentName(file.name);
        setInput(prev => `[Context from file: ${file.name}]\n\`\`\`\n${content.slice(0, 8000)}\n\`\`\`\n\n${prev}`);
      }
    };
    reader.readAsText(file);
  };

  const send = async (text = input, replaceId?: string) => {
    const rawText = text.trim();
    const { clean: rawPrompt } = sanitizeInputPayload(rawText);
    if (!rawPrompt || streaming) return;

    // Anti-DDoS & Flood Protection Shield
    const ddosStatus = checkAntiDDoS('chat_prompt');
    if (!ddosStatus.allowed) {
      setDdosAlert(ddosStatus.message || 'Anti-DDoS Shield: Rate limit reached. Please wait a moment.');
      setTimeout(() => setDdosAlert(null), 5000);
      return;
    }

    if (!isUserSetupComplete()) {
      setShowAccountModal(true);
      return;
    }

    if (!isProviderReady(providerConfig)) {
      const activeDef = getProvider(providerConfig.provider);
      if (activeDef.requiresKey && (!providerConfig.apiKey || !providerConfig.apiKey.trim())) {
        setMissingKeyModal({
          isOpen: true,
          providerId: providerConfig.provider,
          providerName: activeDef.name,
        });
        return;
      }
      goSettings('provider');
      return;
    }

    if (preferences.soundEffects) sounds.playSend();
    setAttachmentName(null);

    // Auto-update conversation title if it's currently generic
    if (currentConversation.title === 'New conversation' || currentConversation.title === 'A new beginning') {
      const autoTitle = generateTitleFromPrompt(rawPrompt);
      setConversations(prev => {
        const up = prev.map(c => (c.id === currentConversation.id ? { ...c, title: autoTitle } : c));
        saveConversations(up);
        return up;
      });
    }

    // 1. Optimize tokens & history via active Token Saver with model awareness
    let currentHistory: ChatTurn[] = [];
    const baseMessages = replaceId ? messages.filter(m => m.id !== replaceId) : messages;
    currentHistory = baseMessages.filter(m => m.content).map(({ role, content }) => ({ role, content }));

    const optimization = optimizeTokens(
      rawPrompt,
      currentHistory,
      preferences.tokenSaverMode,
      preferences.maxHistoryTurns,
      providerConfig.model
    );

    // Update global token stats & per-model stats
    if (preferences.tokenSaverMode !== 'off') {
      const prevModelStats = tokenStats.byModel?.[providerConfig.model] || { processed: 0, saved: 0 };
      const newStats: TokenStats = {
        totalTokensProcessed: tokenStats.totalTokensProcessed + optimization.originalTokens,
        totalTokensSaved: tokenStats.totalTokensSaved + optimization.tokensSaved,
        totalMessagesSent: tokenStats.totalMessagesSent + 1,
        byModel: {
          ...(tokenStats.byModel || {}),
          [providerConfig.model]: {
            processed: prevModelStats.processed + optimization.originalTokens,
            saved: prevModelStats.saved + optimization.tokensSaved,
          },
        },
      };
      setTokenStats(newStats);
      saveTokenStats(newStats);
    }

    const user: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: rawPrompt,
      time: now(),
    };

    const assistantId = crypto.randomUUID();
    const assistant: Message = {
      id: assistantId,
      role: 'model',
      content: '',
      time: 'now',
      tokensSaved: optimization.tokensSaved,
      modelUsed: providerConfig.model,
    };

    updateCurrentMessages(prev => {
      const base = replaceId ? prev.filter(m => m.id !== replaceId) : prev;
      return [...base, user, assistant];
    });

    setInput('');
    setStreaming(true);
    setIsThinking(true);
    setPetMood('thinking');
    stop.current = false;

    if (preferences.thinkingDelayMs > 0) {
      await new Promise(r => setTimeout(r, preferences.thinkingDelayMs));
    }

    try {
      let finalHistory = optimization.optimizedHistory;
      const activeLang: LanguageCode = preferences.language || 'en';
      const langDirective = getProviderLanguageDirective(activeLang);

      const combinedDirectives: string[] = [];
      if (preferences.customSystemPrompt && preferences.customSystemPrompt.trim()) {
        combinedDirectives.push(preferences.customSystemPrompt.trim());
      }
      combinedDirectives.push(langDirective);

      finalHistory = [
        { role: 'user', content: `[SYSTEM DIRECTIVE: ${combinedDirectives.join('\n\n')}]` },
        {
          role: 'model',
          content: `Understood. I will adhere strictly to these parameters and formulate all responses in ${getLanguageName(activeLang)}.`,
        },
        ...finalHistory,
      ];

      let effectivePrompt = optimization.optimizedPrompt;
      if (activeLang !== 'en') {
        effectivePrompt = `[LANGUAGE DIRECTIVE: Deliver your entire response strictly in ${getLanguageName(activeLang)}. Do not answer in English.]\n\n${effectivePrompt}`;
      }

      await createProvider({
        provider: providerConfig.provider,
        apiKey: providerConfig.apiKey,
        model: providerConfig.model,
        baseUrl: providerConfig.baseUrl,
      }).stream(effectivePrompt, finalHistory, chunk => {
        if (!stop.current) {
          setIsThinking(false);
          updateCurrentMessages(m =>
            m.map(x => (x.id === assistant.id ? { ...x, content: x.content + chunk } : x))
          );
        }
      });

      if (preferences.soundEffects) sounds.playReceive();
      setPetMood('happy');
      setTimeout(() => setPetMood('idle'), 4000);
    } catch (err: unknown) {
      setIsThinking(false);
      const isLimit = isApiLimitError(err);
      if (isLimit) {
        triggerApiLimitModal({
          providerName: getProvider(providerConfig.provider).name,
          details: err instanceof Error ? err.message : undefined,
        });
      }
      updateCurrentMessages(m =>
        m.map(x =>
          x.id === assistant.id
            ? {
                ...x,
                content: isLimit
                  ? '🌱 Quota reached! "Uh oh! Seems like your API has reached its limit! Seems like you were working hard, good job! But, go touch grass now and also don\'t forget to drink water!"'
                  : 'Unable to complete request. Please verify your API key and quota in Settings (Gear icon), or test connection.',
              }
            : x
        )
      );
      setPetMood('sleeping');
    } finally {
      setStreaming(false);
      setIsThinking(false);
    }
  };

  const regenerate = (id: string) => {
    const idx = messages.findIndex(m => m.id === id);
    if (idx <= 0) return;
    const userMsg = messages[idx - 1];
    if (userMsg?.role === 'user') {
      send(userMsg.content, id);
    }
  };

  const exportChat = (format: 'json' | 'markdown' | 'text') => {
    let content = '';
    let mimeType = 'text/plain';
    let ext = 'txt';

    if (format === 'json') {
      content = JSON.stringify(conversations, null, 2);
      mimeType = 'application/json';
      ext = 'json';
    } else if (format === 'markdown') {
      content = `# ${currentConversation.title}\n\n` +
        messages
          .map(m => `### ${m.role === 'user' ? 'User' : 'VileDocx'} (${m.time})\n\n${m.content}\n\n---`)
          .join('\n\n');
      mimeType = 'text/markdown';
      ext = 'md';
    } else {
      content = messages
        .map(m => `[${m.time}] ${m.role === 'user' ? 'User' : 'VileDocx'}:\n${m.content}`)
        .join('\n\n---\n\n');
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `viledocx-${currentConversation.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importChat = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].messages) {
        setConversations(parsed);
        saveConversations(parsed);
        setActiveConvId(parsed[0].id);
        setActiveConversationId(parsed[0].id);
        alert('Conversations imported successfully!');
      } else {
        alert('Invalid VileDocx chat export format.');
      }
    } catch {
      alert('Could not parse JSON file.');
    }
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to erase all chats, keys, and reset settings?')) {
      clearLocalData();
      localStorage.removeItem(preferenceKey);
      localStorage.removeItem('viledocx:user_profile'); localStorage.removeItem('aplx:user_profile');
      window.location.reload();
    }
  };

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    if (streaming) {
      el.scrollTop = el.scrollHeight;
    } else {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages.length, streaming, isThinking]);

  const currentThemeMode: ThemeMode = preferences.themeMode || 'halloween';

  // Dynamic Theme CSS Custom Properties & Gradients
  const themeClass = useMemo(() => {
    const modeClass = `theme-mode-${currentThemeMode}`;
    const extraClass =
      currentThemeMode === 'candy'
        ? 'light-mode candy-mode'
        : currentThemeMode === 'dark'
        ? 'dark-mode dark-theme'
        : 'halloween-mode halloween-theme';
    if (preferences.customTheme?.enabled) return `custom-theme-active ${modeClass} ${extraClass}`;
    return `theme-${preferences.theme} ${modeClass} ${extraClass}`;
  }, [preferences.theme, preferences.customTheme, currentThemeMode]);

  const customThemeStyles = useMemo(() => {
    const PRESET_MAP: Record<string, { start: string; mid: string; accent: string }> = {
      black: { start: '#000000', mid: '#141414', accent: '#ffffff' },
      midnight: { start: '#0a0a0a', mid: '#181818', accent: '#f5f5f5' },
      cyberpunk: { start: '#050505', mid: '#121212', accent: '#ffffff' },
      emerald: { start: '#09090b', mid: '#18181b', accent: '#e4e4e7' },
      nebula: { start: '#000000', mid: '#111111', accent: '#ffffff' },
      solar: { start: '#0a0a0a', mid: '#161616', accent: '#f4f4f5' },
      crimson: { start: '#000000', mid: '#0f0f0f', accent: '#ffffff' },
      polar: { start: '#090909', mid: '#171717', accent: '#ffffff' },
    };

    let gradientStart = '#000000';
    let gradientEnd = '#141414';
    let accentColor = '#ffffff';
    let target = preferences.themeGradientTarget || 'both';

    if (preferences.customTheme?.enabled) {
      const ct = preferences.customTheme;
      gradientStart = ct.gradientStart || '#000000';
      gradientEnd = ct.gradientEnd || '#141414';
      accentColor = ct.accentColor || '#ffffff';
      target = ct.gradientTarget || target || 'both';
    } else if (currentThemeMode === 'candy') {
      gradientStart = '#fff0f5';
      gradientEnd = '#fff8e7';
      accentColor = '#ec4899';
    } else {
      const p = PRESET_MAP[preferences.theme] || PRESET_MAP.black;
      gradientStart = p.start;
      gradientEnd = p.mid;
      accentColor = p.accent;
    }

    const gradientBgCss = `radial-gradient(ellipse at 50% 15%, ${gradientEnd} 0%, ${gradientStart} 70%, #000000 100%)`;
    const landingGradientCss = `radial-gradient(circle at 45% 30%, ${gradientEnd} 0%, ${gradientStart} 50%, transparent 85%)`;

    const styles: Record<string, string> = {
      '--app-custom-gradient-start': gradientStart,
      '--app-custom-gradient-end': gradientEnd,
      '--app-custom-accent': accentColor,
      '--theme-glow': currentThemeMode === 'candy' ? `rgba(236, 72, 153, 0.2)` : `rgba(255, 255, 255, 0.15)`,
    };

    if (target === 'background' || target === 'both') {
      styles['--active-bg-gradient'] = gradientBgCss;
    }
    if (target === 'landing' || target === 'both') {
      styles['--landing-bg-gradient'] = landingGradientCss;
    }

    return styles as React.CSSProperties;
  }, [preferences.customTheme, preferences.theme, preferences.themeGradientTarget, currentThemeMode]);

  return (
    <div
      className={`app font-${preferences.font} bubble-${preferences.bubbleStyle} ${themeClass} lang-${lang} ${
        preferences.compact ? 'compact' : ''
      } ${preferences.motion ? 'motion-on' : ''}`}
      style={customThemeStyles}
    >
      <SpaceBackground motion={preferences.motion} />

      {/* Floating Pet Companion if positioned as corner/floating */}
      {view === 'chat' && preferences.petPosition === 'bottom-right' && (
        <PetCompanion
          petId={preferences.petId}
          position="bottom-right"
          size={preferences.petSize}
          mood={petMood}
          soundEnabled={preferences.soundEffects}
          interactive={preferences.petInteractive}
          themeMode={currentThemeMode}
        />
      )}

      {/* Offline Account Modal */}
      <OfflineAccountModal
        isOpen={showAccountModal}
        onComplete={handleAccountComplete}
        onClose={() => setShowAccountModal(false)}
        onRemoveAccount={handleRemoveAccount}
        onGoToPrivacy={() => {
          setShowAccountModal(false);
          setView('privacy');
          setTimeout(() => {
            const el = document.getElementById('legal-notice');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 150);
        }}
        existingProfile={userProfile}
        soundEnabled={preferences.soundEffects}
      />

      {/* Interactive Video Game Tour Guide */}
      <InteractiveTourGuide
        isOpen={showTour}
        onClose={() => setShowTour(false)}
        petId={preferences.petId}
        soundEnabled={preferences.soundEffects}
      />

      {/* Prompt Library Modal */}
      <PromptLibraryModal
        isOpen={showPromptLib}
        onClose={() => setShowPromptLib(false)}
        onSelectPrompt={p => {
          setInput(p);
          setShowPromptLib(false);
        }}
      />
      <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <InstallModal isOpen={showInstallModal} onClose={() => setShowInstallModal(false)} />
      <ConnectDeveloperModal isOpen={showConnectModal} onClose={() => setShowConnectModal(false)} />

      {/* Missing Provider API Key Modal */}
      <ApiKeyRequiredModal
        isOpen={missingKeyModal.isOpen}
        onClose={() => setMissingKeyModal(prev => ({ ...prev, isOpen: false }))}
        providerId={missingKeyModal.providerId}
        providerConfig={providerConfig}
        onGoToSettings={provId => {
          setMissingKeyModal(prev => ({ ...prev, isOpen: false }));
          goSettings('provider');
        }}
        onSwitchToLocal={modelId => {
          setMissingKeyModal(prev => ({ ...prev, isOpen: false }));
          const targetModel = modelId || localDetection?.recommendedModel?.id || 'llama3.3';
          persistProvider({
            ...providerConfig,
            provider: 'ollama',
            model: targetModel,
            baseUrl: localDetection?.baseUrl || 'http://localhost:11434',
          });
        }}
        localDetection={localDetection}
      />

      {/* API Rate Limit & Quota "Touch Grass & Drink Water" Modal */}
      <ApiLimitModal
        isOpen={apiLimitModal.isOpen}
        onClose={() => setApiLimitModal(prev => ({ ...prev, isOpen: false }))}
        onOpenSettings={() => {
          setApiLimitModal(prev => ({ ...prev, isOpen: false }));
          goSettings('provider');
        }}
        providerName={apiLimitModal.providerName}
        details={apiLimitModal.details}
      />

      {view === 'landing' && (
        <div key="view-landing" className="workspace-container animate-workspace-slide-in">
          <Landing
            launch={handleLaunchApp}
            onEnterIDE={() => setView('ide')}
            settings={() => goSettings('provider')}
            privacy={() => setView('privacy')}
            about={() => setView('about')}
            petId={preferences.petId}
            soundEnabled={preferences.soundEffects}
            onOpenGuide={() => setShowTour(true)}
            preferences={preferences}
            onSelectLanguage={code => updatePreferences({ ...preferences, language: code })}
            onSwitchThemeMode={mode => updatePreferences({ ...preferences, themeMode: mode })}
          />
        </div>
      )}

      {view === 'chat' && (
        <div key="view-chat" className={`workspace-container chat-workspace animate-workspace-slide-in ${sidebar ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
          <aside className={`sidebar ${sidebar ? 'open' : 'closed'}`}>
            <div className="brand flex items-center justify-between">
              <button
                type="button"
                onClick={() => setView('landing')}
                className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity group text-left bg-transparent border-0 p-0 text-inherit"
                title="Docx - Go to Landing Page"
                aria-label="Go to Landing Page"
              >
                <span className="brand-mark group-hover:scale-105 transition-transform">D</span>
                <div className="flex flex-col">
                  <span className="group-hover:text-white transition-colors font-bold tracking-tight text-sm leading-tight">DOCX</span>
                  <span className="text-[9px] font-mono text-zinc-400 leading-none">Universal AI Dock</span>
                </div>
              </button>
              
              <div className="flex items-center gap-1.5">
                {/* Compact Clickable Avatar Button */}
                <button
                  type="button"
                  onClick={() => setShowAccountModal(true)}
                  className="profile-avatar-btn playful-pop group border border-white/10 hover:border-white/30 bg-[#1e1e1e] transition-all cursor-pointer"
                  title={userProfile ? `${userProfile.name} (Click to manage profile)` : 'Click to create Offline Profile'}
                  aria-label="Account profile"
                >
                  <div className="w-[26px] h-[26px] rounded-full bg-white/20 p-[1.5px] shadow-sm aspect-square flex-none overflow-hidden">
                    <div className="w-full h-full rounded-full bg-[#121212] flex items-center justify-center overflow-hidden text-xs aspect-square">
                      {userProfile?.avatarType === 'custom' && userProfile.avatar ? (
                        <img
                          src={userProfile.avatar}
                          alt="Avatar"
                          className="w-full h-full object-cover aspect-square rounded-full block"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-xs leading-none select-none text-white">
                          {userProfile?.avatar === 'hacker'
                            ? '👾'
                            : userProfile?.avatar === 'wizard'
                            ? '🧙‍♂️'
                            : userProfile?.avatar === 'alchemist'
                            ? '🔮'
                            : userProfile?.avatar === 'architect'
                            ? '⚡'
                            : userProfile?.avatar === 'cat'
                            ? '🐱'
                            : userProfile?.avatar === 'fox'
                            ? '🦊'
                            : userProfile?.avatar === 'robot'
                            ? '🤖'
                            : '🧑‍🚀'}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Status dot */}
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#121212] ${
                      userProfile ? 'bg-white' : 'bg-zinc-400'
                    }`}
                  />
                </button>

                <button
                  type="button"
                  className={`close playful-pop p-1.5 rounded-lg transition-colors cursor-pointer ${
                    currentThemeMode === 'candy'
                      ? 'bg-white hover:bg-pink-50 text-slate-700 hover:text-pink-600 border border-pink-200 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => setSidebar(false)}
                  title="Collapse sidebar (fill workspace)"
                  aria-label="Collapse sidebar (fill workspace)"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <button
              className={`new-chat playful-pop ${
                currentThemeMode === 'candy'
                  ? 'candy-shifting-btn font-bold text-white shadow-md'
                  : ''
              }`}
              onClick={handleCreateNewChat}
            >
              <MessageSquarePlus size={17} className={currentThemeMode === 'candy' ? 'text-white' : ''} />
              <span>{t.newConversation}</span>
            </button>

            {/* Go back to landing page */}
            <a
              href="https://docx.freebuff.app"
              target="_blank"
              rel="noopener noreferrer"
              className={`playful-pop my-1 px-3 py-2 rounded-lg transition-all text-xs font-semibold flex items-center justify-between ${
                currentThemeMode === 'candy'
                  ? 'bg-white hover:bg-pink-50 text-slate-800 hover:text-pink-600 border border-pink-200 shadow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-zinc-200 hover:text-white border border-white/10 hover:border-white/20'
              }`}
              title="Go back to landing page (https://docx.freebuff.app)"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={14} className={currentThemeMode === 'candy' ? 'text-pink-500' : 'text-white'} />
                <span>{t.landingPageArrow}</span>
              </div>
              <span className={`text-[11px] font-mono ${currentThemeMode === 'candy' ? 'text-pink-400' : 'text-zinc-400'}`}>↗</span>
            </a>

            {/* Conversation Search (Monochrome Theme / Candy White) */}
            <div className="px-1 my-2">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                  currentThemeMode === 'candy'
                    ? 'bg-white border border-pink-200 text-slate-800 shadow-sm focus-within:border-pink-400'
                    : 'bg-[#181818] border border-white/10 text-zinc-300 focus-within:border-white/30'
                }`}
              >
                <Search size={13} className={currentThemeMode === 'candy' ? 'text-pink-500' : 'text-zinc-500'} />
                <input
                  type="text"
                  value={searchHistory}
                  onChange={e => setSearchHistory(e.target.value)}
                  placeholder={t.searchChats}
                  className={`bg-transparent text-xs outline-none w-full ${
                    currentThemeMode === 'candy'
                      ? 'text-slate-900 placeholder:text-slate-400'
                      : 'text-white placeholder:text-zinc-500'
                  }`}
                />
              </div>
            </div>

            <div className={`nav-label ${currentThemeMode === 'candy' ? 'text-pink-600 font-semibold' : ''}`}>
              {t.conversationsCount} ({filteredConversations.length})
            </div>

            <div className="overflow-y-auto max-h-[38vh] space-y-1 pr-1">
              {filteredConversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => handleSwitchConversation(conv.id)}
                  className={`group relative flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-all playful-pop ${
                    currentThemeMode === 'candy'
                      ? conv.id === activeConvId
                        ? 'bg-white text-pink-600 border-2 border-pink-400 shadow-sm font-semibold'
                        : 'bg-white/90 text-slate-700 hover:bg-pink-50 hover:text-pink-600 border border-pink-100 shadow-xs'
                      : conv.id === activeConvId
                      ? 'bg-[#151c2e] text-white border border-[#2d3b5b]'
                      : 'text-[#8ea0c2] hover:bg-[#0f1422] hover:text-white'
                  }`}
                >
                  {editingConvId === conv.id ? (
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        handleRenameConversation(conv.id, editConvTitle);
                      }}
                      className="flex items-center w-full"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={editConvTitle}
                        onChange={e => setEditConvTitle(e.target.value)}
                        onBlur={() => handleRenameConversation(conv.id, editConvTitle)}
                        className="bg-[#0b0e17] text-xs text-white p-1 rounded border border-[#8ea8ff] outline-none w-full"
                      />
                    </form>
                  ) : (
                    <>
                      <span className="truncate pr-2 font-medium">{conv.title}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            setEditingConvId(conv.id);
                            setEditConvTitle(conv.title);
                          }}
                          className="p-1 text-[#6f82a6] hover:text-white rounded"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={e => handleDeleteConversation(conv.id, e)}
                          className="p-1 text-[#6f82a6] hover:text-rose-400 rounded"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="side-bottom">
              {!showMoreSidebarOptions ? (
                <button
                  type="button"
                  className="sidebar-options-toggle-btn flex items-center justify-between w-full cursor-pointer"
                  onClick={() => setShowMoreSidebarOptions(true)}
                  title="Open options (...)"
                >
                  <div className="flex items-center gap-2">
                    <MoreHorizontal size={17} className="text-[#8ea8ff]" />
                    <span>...</span>
                  </div>
                  <span className="text-[11px] text-[#86868b] font-medium tracking-wide">{t.options}</span>
                </button>
              ) : (
                <div className="flex flex-col gap-1 w-full animate-fade-in">
                  {/* Downward button to hide these buttons again */}
                  <button
                    type="button"
                    className="sidebar-options-toggle-btn flex items-center justify-between w-full cursor-pointer bg-white/[0.06] hover:bg-white/[0.1] text-[#a5b4fc] border border-white/[0.08]"
                    onClick={() => setShowMoreSidebarOptions(false)}
                    title="Hide options"
                  >
                    <div className="flex items-center gap-2">
                      <ChevronDown size={17} className="text-zinc-400" />
                      <span>{t.hideOptions}</span>
                    </div>
                    <ChevronDown size={15} className="text-zinc-400" />
                  </button>

                  <div className="flex flex-col gap-1 max-h-[46vh] overflow-y-auto pr-0.5">
                    <button className="playful-pop" onClick={() => setView('media')}>
                      <Film size={17} className="text-zinc-300" /> {t.mediaStudio}
                    </button>
                    <button className="playful-pop" onClick={() => setView('ide')}>
                      <Code2 size={17} className="text-blue-400" /> {t.ideMode || 'Docx-IDE'}
                    </button>
                    <button className="playful-pop" onClick={() => goSettings('workers')}>
                      <Users size={17} className="text-zinc-300" /> {t.multipleWorkers}
                    </button>
                    <button className="playful-pop" onClick={() => setShowTour(true)}>
                      <Gamepad2 size={17} className="text-zinc-300" /> {t.interactiveGuideItem}
                    </button>
                    <button className="playful-pop" onClick={() => setShowPromptLib(true)}>
                      <Sparkles size={17} className="text-zinc-300" /> {t.promptLibrary}
                    </button>
                    <button className="playful-pop" onClick={() => goSettings('tokensaver')}>
                      <Zap size={17} className="text-zinc-300" /> {t.tokenSaverActive}
                    </button>
                    <button className="playful-pop" onClick={() => goSettings('appearance')}>
                      <Palette size={17} /> {t.themesStyling}
                    </button>
                    <button className="playful-pop" onClick={() => goSettings('pets')}>
                      <Cat size={17} /> {t.companionPets}
                    </button>
                    <button className="playful-pop" onClick={() => setShowShortcuts(true)}>
                      <Command size={17} /> {t.shortcuts}
                    </button>
                    <button className="playful-pop" onClick={() => goSettings('languages')}>
                      <Globe size={17} /> {t.languages}
                    </button>
                    <button className="playful-pop" onClick={() => goSettings('provider')}>
                      <Settings size={17} /> {t.allSettingsItem}
                    </button>
                    <button className="playful-pop" onClick={() => setView('privacy')}>
                      <ShieldCheck size={17} /> {t.privacySecurity}
                    </button>
                    <button className="playful-pop" onClick={() => setView('about')}>
                      <Orbit size={17} /> {t.aboutVileDocx}
                    </button>
                    <button className="playful-pop" onClick={() => setShowConnectModal(true)}>
                      <Sparkles size={17} className="text-[#a5b4fc]" /> {t.connectDeveloper}
                    </button>
                    <button
                      type="button"
                      className="playful-pop flex items-center justify-center gap-1.5 w-full py-1 text-xs text-[#86868b] hover:text-white cursor-pointer"
                      onClick={() => setShowMoreSidebarOptions(false)}
                      title="Hide options"
                    >
                      <ChevronDown size={14} />
                      <span>{t.hideOptions}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Connect with the developer button */}
              <button
                type="button"
                id="connect-developer-sidebar-btn"
                className="connect-dev-btn playful-pop w-full text-left cursor-pointer flex items-center justify-between"
                onClick={() => setShowConnectModal(true)}
                title="Connect with the developer (Instagram: r3nz0r, Discord: r3nz0r_1hah, GitHub: aplx-renz-sudo)"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-[#a5b4fc]" />
                  <span className="font-medium text-[#e0e7ff]">{t.connectDeveloper}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-medium">r3nz</span>
              </button>

              {/* Install VileDocx button placed directly below Options */}
              <button
                type="button"
                id="install-viledocx-sidebar-btn"
                className="github-side playful-pop w-full text-left cursor-pointer flex items-center justify-between"
                onClick={() => setShowInstallModal(true)}
                title="Install VileDocx CLI or Website"
              >
                <div className="flex items-center gap-2">
                  <Download size={14} className="text-[#8ea8ff]" />
                  <span>{t.installVileDocx}</span>
                </div>
              </button>

              <div className="web-status">
                <span /> Docx Web <small>{getProvider(providerConfig.provider).name}</small>
              </div>
            </div>
          </aside>

          {sidebar && (
            <div
              className="mobile-sidebar-backdrop"
              onClick={() => setSidebar(false)}
              aria-hidden="true"
            />
          )}

          <main className={`chat ${sidebar ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
            {/* Sticky Model & Actions Header */}
            <header>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className={`icon playful-pop inline-flex items-center justify-center p-2 rounded-lg transition-colors cursor-pointer ${
                    currentThemeMode === 'candy'
                      ? 'bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 shadow-sm'
                      : 'hover:bg-white/10 text-white'
                  }`}
                  onClick={() => setSidebar(prev => !prev)}
                  title={sidebar ? "Collapse sidebar (fill workspace)" : "Open sidebar"}
                  aria-label={sidebar ? "Collapse sidebar (fill workspace)" : "Open sidebar"}
                >
                  <Menu size={18} />
                </button>
                <label className="model">
                  <span />
                  <ChatModelSelect
                    config={providerConfig}
                    detectedLocalModels={localDetection}
                    onRequireKeyPrompt={(provName, provId) => {
                      setMissingKeyModal({
                        isOpen: true,
                        providerId: provId,
                        providerName: provName,
                      });
                    }}
                    onModelChange={(m, provId) => {
                      const def = getProvider(provId);
                      const key =
                        providerConfig.apiKeys?.[provId] ||
                        (provId === providerConfig.provider ? providerConfig.apiKey : '');
                      const baseUrl =
                        providerConfig.baseUrls?.[provId] ||
                        def.baseUrl ||
                        'http://localhost:11434';
                      persistProvider({
                        ...providerConfig,
                        provider: provId,
                        model: m,
                        apiKey: key,
                        baseUrl,
                      });
                    }}
                  />
                </label>

                {/* Auto-detected Offline Models Chip (1-Click Switch) */}
                {localDetection?.isAvailable && localDetection.models.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const best = localDetection.recommendedModel || localDetection.models[0];
                      if (best) {
                        persistProvider({
                          ...providerConfig,
                          provider: 'ollama',
                          model: best.id,
                          baseUrl: localDetection.baseUrl || 'http://localhost:11434',
                        });
                      }
                    }}
                    className={`playful-pop hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-sm ${
                      currentThemeMode === 'candy'
                        ? 'bg-white border border-pink-200 text-slate-800 hover:bg-pink-50 hover:text-pink-600'
                        : 'bg-white/5 border border-white/10 hover:border-white/25 text-zinc-200'
                    }`}
                    title={`⚡ ${localDetection.models.length} local models detected (${localDetection.provider === 'ollama' ? 'Ollama' : 'LM Studio'}). Click to switch to offline model.`}
                  >
                    <Cpu size={13} className={currentThemeMode === 'candy' ? 'text-pink-500' : 'text-white'} />
                    <span>⚡ {localDetection.models.length} Offline Model{localDetection.models.length > 1 ? 's' : ''} Ready</span>
                  </button>
                )}
              </div>

              <div className="header-actions items-center flex gap-2">
                <a
                  href="https://docx.freebuff.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    currentThemeMode === 'candy'
                      ? 'bg-white border border-pink-200 text-slate-800 hover:bg-pink-50 hover:text-pink-600 shadow-sm'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 hover:text-white'
                  }`}
                  title="Go back to landing page (https://docx.freebuff.app)"
                >
                  <Sparkles size={13} className={currentThemeMode === 'candy' ? 'text-pink-500' : 'text-white'} />
                  <span>Landing page -&gt;</span>
                </a>

                {/* Minimalist Profile Picture Avatar in Header */}
                <button
                  type="button"
                  onClick={() => setShowAccountModal(true)}
                  className={`profile-avatar-btn playful-pop group transition-all cursor-pointer flex-none ${
                    currentThemeMode === 'candy'
                      ? 'border border-pink-300 bg-white shadow-sm'
                      : 'border border-white/10 hover:border-white/30 bg-[#1e1e1e]'
                  }`}
                  title={userProfile ? `${userProfile.name} • Click to manage profile & avatar` : 'Offline Account • Click to customize'}
                  aria-label="Manage Account Profile"
                >
                  <div className="w-[26px] h-[26px] rounded-full bg-white/20 p-[1.5px] shadow-sm aspect-square flex-none overflow-hidden">
                    <div className="w-full h-full rounded-full bg-[#121212] flex items-center justify-center overflow-hidden text-xs aspect-square">
                      {userProfile?.avatarType === 'custom' && userProfile.avatar ? (
                        <img
                          src={userProfile.avatar}
                          alt="Avatar"
                          className="w-full h-full object-cover aspect-square rounded-full block"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-xs leading-none select-none text-white">
                          {userProfile?.avatar === 'hacker'
                            ? '👾'
                            : userProfile?.avatar === 'wizard'
                            ? '🧙‍♂️'
                            : userProfile?.avatar === 'alchemist'
                            ? '🔮'
                            : userProfile?.avatar === 'architect'
                            ? '⚡'
                            : userProfile?.avatar === 'cat'
                            ? '🐱'
                            : userProfile?.avatar === 'fox'
                            ? '🦊'
                            : userProfile?.avatar === 'robot'
                            ? '🤖'
                            : '🧑‍🚀'}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border ${
                      currentThemeMode === 'candy' ? 'border-white bg-pink-500' : 'border-[#121212] ' + (userProfile ? 'bg-white' : 'bg-zinc-400')
                    }`}
                  />
                </button>

                <TokenSaverBadge
                  mode={preferences.tokenSaverMode}
                  stats={tokenStats}
                  onOpenSettings={() => goSettings('tokensaver')}
                  onResetStats={setTokenStats}
                />
                <SwarmMetricsHeaderWidget
                  providerConfig={providerConfig}
                  preferences={preferences}
                  onUpdatePreferences={setPreferences}
                  onOpenSettings={() => goSettings('workers')}
                />
                <button
                  className={`icon playful-pop ${
                    currentThemeMode === 'candy'
                      ? 'bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 shadow-sm'
                      : ''
                  }`}
                  title="Prompt Library (Ctrl+K)"
                  onClick={() => setShowPromptLib(true)}
                >
                  <Sparkles size={18} className={currentThemeMode === 'candy' ? 'text-pink-500' : ''} />
                </button>

                {/* Quick Theme Mode Toggle Button */}
                <button
                  type="button"
                  onClick={() => {
                    const modes: ThemeMode[] = ['dark', 'halloween', 'candy'];
                    const nextIndex = (modes.indexOf(currentThemeMode) + 1) % modes.length;
                    updatePreferences({ ...preferences, themeMode: modes[nextIndex] });
                    if (preferences.soundEffects) sounds.playComplete();
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-mono font-medium border transition-all cursor-pointer flex items-center gap-1.5 playful-pop ${
                    currentThemeMode === 'candy'
                      ? 'bg-white border-2 border-pink-400 text-pink-600 hover:bg-pink-50 shadow-sm'
                      : currentThemeMode === 'dark'
                      ? 'bg-white/[0.06] border-white/15 text-zinc-200 hover:bg-white/[0.12]'
                      : 'bg-[#190a30] border-orange-500/30 text-orange-200 hover:bg-[#250d48]'
                  }`}
                  title={`Current Theme: ${
                    currentThemeMode === 'dark' ? 'Dark Mode' : currentThemeMode === 'halloween' ? 'Halloween Edition' : 'Candy (White) Light Mode'
                  } (Click to switch)`}
                  aria-label="Switch Theme Mode"
                >
                  <span>{currentThemeMode === 'dark' ? '🌙 Dark' : currentThemeMode === 'halloween' ? '🎃 Halloween' : '🍬 Candy'}</span>
                </button>

                {/* Edit Positions in Main Chat Area Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (!isPositionMode) {
                      setDraftPositions(savedPositions);
                    }
                    setIsPositionMode(prev => !prev);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-mono font-medium border transition-all cursor-pointer flex items-center gap-1.5 playful-pop ${
                    isPositionMode
                      ? currentThemeMode === 'candy'
                        ? 'bg-pink-600 text-white border-pink-600 shadow-sm ring-2 ring-pink-300'
                        : currentThemeMode === 'halloween'
                        ? 'bg-orange-600 text-black border-orange-500 shadow-sm ring-2 ring-orange-300'
                        : 'bg-white text-black border-white shadow-sm ring-2 ring-white/40'
                      : currentThemeMode === 'candy'
                      ? 'bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 shadow-xs'
                      : currentThemeMode === 'halloween'
                      ? 'bg-[#190a30] border-orange-500/30 text-orange-200 hover:bg-[#250d48]'
                      : 'bg-white/[0.06] border-white/15 text-zinc-200 hover:bg-white/[0.12]'
                  }`}
                  title={isPositionMode ? "Finish Editing Chat Positions" : "Edit Positions in Chat Area (Saved user-side)"}
                  aria-label="Edit Chat Positions"
                >
                  <Move size={13} className={isPositionMode ? 'animate-pulse' : ''} />
                  <span className="hidden sm:inline">{isPositionMode ? 'Done' : 'Edit Positions'}</span>
                </button>

                <LanguageDropdown
                  preferences={preferences}
                  onSelectLanguage={code => {
                    updatePreferences({ ...preferences, language: code });
                  }}
                  compact
                />
                {conversations.length > 0 && (
                  <button
                    className={`icon playful-pop ${
                      currentThemeMode === 'candy'
                        ? 'bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 shadow-sm'
                        : ''
                    }`}
                    title="Clear conversation"
                    onClick={handleCreateNewChat}
                  >
                    <Trash2 size={18} className={currentThemeMode === 'candy' ? 'text-pink-500' : ''} />
                  </button>
                )}
                <button
                  className={`icon playful-pop ${
                    currentThemeMode === 'candy'
                      ? 'bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 shadow-sm'
                      : ''
                  }`}
                  title={t.settings || 'Settings'}
                  onClick={() => goSettings('provider')}
                >
                  <Settings size={18} className={currentThemeMode === 'candy' ? 'text-pink-500' : ''} />
                </button>
              </div>
            </header>

            {/* Position Editor Toolbar if Active */}
            {isPositionMode && (
              <ChatPositionsBar
                currentPositions={savedPositions}
                draftPositions={draftPositions}
                onChangeDraft={setDraftPositions}
                onSave={handleSavePositions}
                onReset={handleResetPositions}
                onClose={() => setIsPositionMode(false)}
                hasUnsavedChanges={hasUnsavedPositions}
                themeMode={currentThemeMode}
              />
            )}

            {conversations.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in my-auto">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${
                    currentThemeMode === 'candy'
                      ? 'bg-white border-2 border-pink-300 text-pink-500 shadow-pink-100'
                      : 'bg-white/5 border border-white/10 text-white'
                  }`}
                >
                  <MessageSquarePlus size={32} />
                </div>
                <h3 className={`text-lg font-bold mb-2 ${currentThemeMode === 'candy' ? 'text-slate-900' : 'text-white'}`}>
                  {t.noActiveConvTitle}
                </h3>
                <p className={`text-xs max-w-sm mb-6 leading-relaxed ${currentThemeMode === 'candy' ? 'text-slate-600' : 'text-zinc-400'}`}>
                  {t.noActiveConvDesc}
                </p>
                <button
                  type="button"
                  onClick={handleCreateNewChat}
                  className={`primary playful-pop inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shadow-lg cursor-pointer ${
                    currentThemeMode === 'candy'
                      ? 'candy-shifting-btn text-white'
                      : 'bg-white text-black hover:bg-zinc-200'
                  }`}
                >
                  <MessageSquarePlus size={18} />
                  <span>{t.startAConversation}</span>
                </button>
              </div>
            ) : (
              (() => {
                const composerBlock = (
                  <div
                    key="composer-block"
                    className={`relative ${
                      activePositions.composerPosition === 'floating'
                        ? 'composer-floating-wrap'
                        : activePositions.composerPosition === 'top'
                        ? 'border-b border-white/10 z-20'
                        : ''
                    }`}
                  >
                    {isPositionMode && (
                      <div
                        className="w-full mx-auto px-4 pt-1"
                        style={{
                          maxWidth:
                            activePositions.composerWidth === 'full'
                              ? '100%'
                              : activePositions.composerWidth === 'wide'
                              ? '960px'
                              : activePositions.composerWidth === 'compact'
                              ? '640px'
                              : '768px',
                        }}
                      >
                        <SectionPositionHandle
                          sectionTitle={`Composer Input Bar (${activePositions.composerPosition.toUpperCase()})`}
                          sectionKey="composer"
                          canMoveUp={activePositions.composerPosition !== 'top'}
                          canMoveDown={activePositions.composerPosition === 'top'}
                          onMoveUp={() => {
                            setDraftPositions({
                              ...draftPositions,
                              composerPosition: 'top',
                              layoutOrder: ['header', 'composer', 'messages'],
                            });
                          }}
                          onMoveDown={() => {
                            setDraftPositions({
                              ...draftPositions,
                              composerPosition: 'bottom',
                              layoutOrder: ['header', 'messages', 'composer'],
                            });
                          }}
                          themeMode={currentThemeMode}
                          extraControls={
                            <div className="flex items-center gap-1 text-[10px]">
                              <span className="opacity-70">Dock:</span>
                              <button
                                type="button"
                                onClick={() => setDraftPositions({ ...draftPositions, composerPosition: 'top', layoutOrder: ['header', 'composer', 'messages'] })}
                                className={`px-1.5 py-0.5 rounded cursor-pointer ${activePositions.composerPosition === 'top' ? 'bg-white/20 font-bold' : 'hover:bg-white/10 opacity-70'}`}
                              >
                                Top
                              </button>
                              <button
                                type="button"
                                onClick={() => setDraftPositions({ ...draftPositions, composerPosition: 'bottom', layoutOrder: ['header', 'messages', 'composer'] })}
                                className={`px-1.5 py-0.5 rounded cursor-pointer ${activePositions.composerPosition === 'bottom' ? 'bg-white/20 font-bold' : 'hover:bg-white/10 opacity-70'}`}
                              >
                                Bottom
                              </button>
                              <button
                                type="button"
                                onClick={() => setDraftPositions({ ...draftPositions, composerPosition: 'floating' })}
                                className={`px-1.5 py-0.5 rounded cursor-pointer ${activePositions.composerPosition === 'floating' ? 'bg-white/20 font-bold' : 'hover:bg-white/10 opacity-70'}`}
                              >
                                Float
                              </button>
                            </div>
                          }
                        />
                      </div>
                    )}

                    {/* Composer-docked Pet */}
                    {preferences.petPosition === 'composer' && (
                      <PetCompanion
                        petId={preferences.petId}
                        position="composer"
                        size={preferences.petSize}
                        mood={petMood}
                        soundEnabled={preferences.soundEffects}
                        interactive={preferences.petInteractive}
                        themeMode={currentThemeMode}
                      />
                    )}

                    {/* Attachment Pill Indicator */}
                    {attachmentName && (
                      <div className="max-w-[820px] mx-auto mb-1 px-4 flex items-center gap-2 text-xs text-[#8ea8ff]">
                        <span className="bg-[#141b2e] px-2 py-0.5 rounded border border-[#273554] flex items-center gap-1.5">
                          <Paperclip size={12} /> Attached: {attachmentName}
                          <button
                            onClick={() => setAttachmentName(null)}
                            className="text-[#6d80a6] hover:text-white ml-1 cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      </div>
                    )}

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".txt,.md,.js,.ts,.tsx,.py,.json,.csv,.sql,.html,.css"
                    />

                    {/* Anti-DDoS Security Banner */}
                    {ddosAlert && (
                      <div className="mb-2.5 p-2.5 px-4 rounded-xl bg-white/10 border border-white/20 text-white text-xs flex items-center justify-between gap-2 shadow-lg animate-bounce">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={16} className="text-white flex-none" />
                          <span className="font-medium">{ddosAlert}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDdosAlert(null)}
                          className="text-zinc-400 hover:text-white cursor-pointer"
                          title="Dismiss"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    )}

                    <Composer
                      value={input}
                      change={handleInputChange}
                      send={() => send()}
                      stop={() => {
                        stop.current = true;
                        setStreaming(false);
                        setIsThinking(false);
                        stopSpeaking();
                      }}
                      streaming={streaming}
                      sendOnEnter={preferences.sendOnEnter}
                      onOpenPrompts={() => setShowPromptLib(true)}
                      onOpenHelp={() => setShowTour(true)}
                      onToggleVoice={toggleVoiceInput}
                      isRecordingVoice={isRecordingVoice}
                      onAttachFile={() => fileInputRef.current?.click()}
                      onOpenTokenSaver={() => goSettings('tokensaver')}
                      themeMode={currentThemeMode}
                      widthClass={composerWidthClass}
                      alignClass={composerAlignClass}
                      isFloating={activePositions.composerPosition === 'floating'}
                      onEnterIDE={() => setView('ide')}
                    />
                  </div>
                );

                const messagesBlock = (
                  <div key="messages-block" className="flex-1 min-h-0 flex flex-col overflow-hidden">
                    {isPositionMode && (
                      <div
                        className="w-full mx-auto px-4 pt-1 flex-none"
                        style={{
                          maxWidth:
                            activePositions.messagesWidth === 'full'
                              ? '100%'
                              : activePositions.messagesWidth === 'wide'
                              ? '960px'
                              : activePositions.messagesWidth === 'compact'
                              ? '640px'
                              : '768px',
                        }}
                      >
                        <SectionPositionHandle
                          sectionTitle="Chat Messages Stream"
                          sectionKey="messages"
                          canMoveUp={activePositions.composerPosition === 'top'}
                          canMoveDown={activePositions.composerPosition !== 'top'}
                          onMoveUp={() => {
                            setDraftPositions({
                              ...draftPositions,
                              composerPosition: 'bottom',
                              layoutOrder: ['header', 'messages', 'composer'],
                            });
                          }}
                          onMoveDown={() => {
                            setDraftPositions({
                              ...draftPositions,
                              composerPosition: 'top',
                              layoutOrder: ['header', 'composer', 'messages'],
                            });
                          }}
                          themeMode={currentThemeMode}
                          extraControls={
                            <span className="text-[10px] opacity-70">
                              Width: {activePositions.messagesWidth} • Align: {activePositions.messagesAlign}
                            </span>
                          }
                        />
                      </div>
                    )}

                    <section
                      className={`messages flex-1 overflow-y-auto ${
                        activePositions.messagesFlow === 'left' ? 'messages-flow-left' : ''
                      }`}
                      ref={messagesContainerRef}
                      style={{
                        maxWidth:
                          activePositions.messagesWidth === 'full'
                            ? '100%'
                            : activePositions.messagesWidth === 'wide'
                            ? '960px'
                            : activePositions.messagesWidth === 'compact'
                            ? '640px'
                            : '768px',
                        margin:
                          activePositions.messagesAlign === 'left'
                            ? '0 auto 0 0'
                            : activePositions.messagesAlign === 'right'
                            ? '0 0 0 auto'
                            : '0 auto',
                      }}
                    >
                      {messages
                        .filter(m => m.role !== 'model' || m.content || (isThinking && streaming))
                        .map((m, idx) => (
                          <MessageView
                            key={m.id}
                            message={m}
                            userProfile={userProfile}
                            regenerate={() => regenerate(m.id)}
                            isThinking={isThinking && streaming && m.role === 'model' && !m.content}
                            onSpeak={() => toggleReadAloud(m)}
                            isSpeaking={speakingMsgId === m.id}
                            onEditPrompt={newPrompt => send(newPrompt, m.id)}
                            themeMode={currentThemeMode}
                            isPositionMode={isPositionMode}
                            onMoveUp={() => handleMoveMessage(m.id, 'up')}
                            onMoveDown={() => handleMoveMessage(m.id, 'down')}
                            canMoveUp={idx > 0}
                            canMoveDown={idx < messages.length - 1}
                          />
                        ))}

                      {messages.length === 1 && (
                        <PromptDeck
                          choose={send}
                          showGuideBanner={!userProfile && !guideDismissed}
                          onOpenGuide={() => setShowTour(true)}
                          onDismissGuide={() => {
                            setGuideDismissed(true);
                            try {
                              localStorage.setItem('viledocx:guide_dismissed', 'true');
                            } catch {}
                          }}
                        />
                      )}
                      <div ref={messagesEnd} className="h-0 w-0 pointer-events-none opacity-0" aria-hidden="true" />
                    </section>
                  </div>
                );

                return activePositions.composerPosition === 'top' ? (
                  <>
                    {composerBlock}
                    {messagesBlock}
                  </>
                ) : (
                  <>
                    {messagesBlock}
                    {composerBlock}
                  </>
                );
              })()
            )}
          </main>
        </div>
      )}

      {view === 'settings' && (
        <div key="view-settings" className="workspace-container animate-workspace-slide-in">
          <FullSettingsModal
            tab={settingsTab}
            setTab={setSettingsTab}
            providerConfig={providerConfig}
            onProviderChange={persistProvider}
            preferences={preferences}
            setPreferences={updatePreferences}
            tokenStats={tokenStats}
            onResetTokenStats={() => setTokenStats(loadTokenStats())}
            onExportChat={exportChat}
            onImportChat={importChat}
            onClearAllData={clearAllData}
            back={() => setView('chat')}
            onAbout={() => setView('about')}
            onPrivacy={() => setView('privacy')}
            onNavigateToBuild={() => setView('ide')}
            onConnectDeveloper={() => setShowConnectModal(true)}
            onOpenPositionEditor={() => {
              setView('chat');
              setIsPositionMode(true);
            }}
          />
        </div>
      )}

      {view === 'privacy' && (
        <div key="view-privacy" className="workspace-container animate-workspace-slide-in">
          <Privacy
            back={() => setView('landing')}
            settings={() => goSettings('provider')}
            about={() => setView('about')}
          />
        </div>
      )}

      {view === 'about' && (
        <div key="view-about" className="workspace-container animate-workspace-slide-in">
          <AboutPage
            launch={handleLaunchApp}
            home={() => setView('landing')}
            settings={() => goSettings('provider')}
            motion={preferences.motion}
          />
        </div>
      )}

      {(view === 'ide' || view === 'build') && (
        <div key="view-ide" className="w-screen h-screen overflow-hidden">
          <DocxIDEView
            providerConfig={providerConfig}
            onLeave={() => setView('chat')}
            onOpenSettings={(tab?: string) => goSettings((tab as any) || 'provider')}
            themeMode={currentThemeMode}
          />
        </div>
      )}

      {view === 'media' && (
        <div key="view-media" className="workspace-container animate-workspace-slide-in">
          <MediaStudioView
            providerConfig={providerConfig}
            onLeave={() => setView('chat')}
            onOpenSettings={() => goSettings('provider')}
            themeMode={currentThemeMode}
          />
        </div>
      )}
      {/* User-side Save Notification Toast */}
      {saveToast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl animate-fade-in border ${
            currentThemeMode === 'candy'
              ? 'bg-white border-pink-300 text-pink-700 shadow-pink-200'
              : currentThemeMode === 'halloween'
              ? 'bg-[#1e0d30] border-orange-500/50 text-orange-200 shadow-orange-950/50'
              : 'bg-[#181818] border-white/20 text-white shadow-black/80'
          }`}
        >
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-none">
            <Check size={13} />
          </div>
          <span className="text-xs font-semibold">{saveToast}</span>
        </div>
      )}
    </div>
  );
}

function SpaceBackground({ motion }: { motion: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!motion) return;
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 18;
      const y = (e.clientY / window.innerHeight - 0.5) * 18;
      el.style.setProperty('--star-x', `${x}px`);
      el.style.setProperty('--star-y', `${y}px`);
      el.classList.add('near');
    };
    const onLeave = () => el.classList.remove('near');
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, [motion]);
  return (
    <div ref={ref} className="space" aria-hidden="true">
      <i />
      <b />
    </div>
  );
}

function Landing({
  launch,
  onEnterIDE,
  settings,
  privacy,
  about,
  onOpenGuide,
  preferences,
  onSelectLanguage,
  onSwitchThemeMode,
}: {
  launch: () => void;
  onEnterIDE?: () => void;
  settings: () => void;
  privacy: () => void;
  about: () => void;
  petId?: string;
  soundEnabled?: boolean;
  onOpenGuide?: () => void;
  preferences?: Preferences;
  onSelectLanguage?: (code: LanguageCode) => void;
  onSwitchThemeMode?: (mode: ThemeMode) => void;
}) {
  const currentLang: LanguageCode = preferences?.language || 'en';
  const t = getTranslation(currentLang);
  const themeMode: ThemeMode = preferences?.themeMode || 'halloween';

  const handleModeToggle = (mode: ThemeMode) => {
    onSwitchThemeMode?.(mode);
    if (preferences?.soundEffects) sounds.playComplete();
  };

  const isCandy = themeMode === 'candy';
  const isDark = themeMode === 'dark';
  const isHalloween = themeMode === 'halloween';

  return (
    <main
      className={`landing w-full min-h-screen flex flex-col justify-between items-center px-4 sm:px-8 py-6 text-center animate-fade-in-up relative overflow-hidden ${
        isCandy
          ? 'candy-landing bg-white text-slate-800'
          : isDark
          ? 'dark-landing bg-[#090d16] text-white'
          : 'halloween-landing'
      }`}
    >
      {/* Top Banner / Marquee */}
      {isHalloween && (
        <div className="w-full max-w-5xl mx-auto mb-4 py-2 px-4 rounded-xl bg-gradient-to-r from-orange-600/25 via-purple-600/30 to-orange-600/25 border border-orange-500/35 backdrop-blur-md flex items-center justify-center gap-2.5 text-xs font-mono text-orange-200 shadow-lg shadow-orange-950/30">
          <span className="animate-bounce text-sm">🎃</span>
          <span className="font-bold text-orange-300">V3 - LIMITED EDITION UPDATE (BETA)</span>
          <span className="text-orange-500">•</span>
          <span className="text-orange-100">SPOOKY HALLOWEEN THEME ACTIVE</span>
          <span className="text-orange-500">•</span>
          <span className="hidden sm:inline text-orange-200">ALL COMPANIONS WEAR FESTIVE PUMPKINS!</span>
          <span className="animate-bounce text-sm">👻</span>
        </div>
      )}

      {isCandy && (
        <div className="w-full max-w-5xl mx-auto mb-4 py-2 px-4 rounded-xl bg-gradient-to-r from-pink-500/15 via-amber-300/25 to-pink-500/15 border border-pink-300/60 backdrop-blur-md flex items-center justify-center gap-2.5 text-xs font-mono text-pink-700 shadow-lg shadow-pink-100/50">
          <span className="animate-bounce text-sm">🍬</span>
          <span className="font-bold text-pink-800">CANDY (WHITE) LIGHT MODE ACTIVE</span>
          <span className="text-pink-400">•</span>
          <span className="text-pink-700">SWEET PINKISH-YELLOW GRADIENTS</span>
          <span className="text-pink-400">•</span>
          <span className="hidden sm:inline text-pink-600">CLEAN WHITE SURFACES & RADIANT PASTELS</span>
          <span className="animate-bounce text-sm">✨</span>
        </div>
      )}

      {/* Floating Atmosphere Decor Left */}
      {isHalloween && (
        <div className="absolute top-28 left-4 sm:left-10 pointer-events-none select-none z-10 hidden md:block animate-pumpkin-float">
          <div className="p-3.5 rounded-2xl bg-[#1d0a33]/80 border border-orange-500/35 backdrop-blur-md shadow-xl shadow-orange-950/40 flex flex-col items-center">
            <span className="text-3xl filter drop-shadow-[0_0_12px_rgba(255,120,0,0.95)] animate-candle-flicker">🎃</span>
            <span className="text-[10px] font-mono text-orange-300 mt-1 font-bold">Trick or Treat!</span>
          </div>
        </div>
      )}

      {isCandy && (
        <div className="absolute top-28 left-4 sm:left-10 pointer-events-none select-none z-10 hidden md:block animate-pumpkin-float">
          <div className="p-3.5 rounded-2xl bg-white/95 border border-pink-200/90 backdrop-blur-md shadow-xl shadow-pink-100 flex flex-col items-center">
            <span className="text-3xl animate-pulse">🍬</span>
            <span className="text-[10px] font-mono text-pink-700 mt-1 font-bold">Sweet & Private!</span>
          </div>
        </div>
      )}

      {/* Floating Atmosphere Decor Right */}
      {isHalloween && (
        <div className="absolute top-36 right-4 sm:right-10 pointer-events-none select-none z-10 hidden md:block animate-ghost-drift">
          <div className="p-3.5 rounded-2xl bg-[#1d0a33]/80 border border-purple-500/35 backdrop-blur-md shadow-xl shadow-purple-950/40 flex flex-col items-center">
            <span className="text-3xl filter drop-shadow-[0_0_12px_rgba(168,85,247,0.85)]">👻</span>
            <span className="text-[10px] font-mono text-purple-300 mt-1 font-bold">Boo! Crypt Safe</span>
          </div>
        </div>
      )}

      {isCandy && (
        <div className="absolute top-36 right-4 sm:right-10 pointer-events-none select-none z-10 hidden md:block animate-ghost-drift">
          <div className="p-3.5 rounded-2xl bg-white/95 border border-amber-200/90 backdrop-blur-md shadow-xl shadow-amber-100 flex flex-col items-center">
            <span className="text-3xl">🧁</span>
            <span className="text-[10px] font-mono text-amber-700 mt-1 font-bold">Sugar Rush! Safe</span>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <nav
        className={`w-full max-w-5xl mx-auto flex items-center justify-between pb-6 border-b relative z-20 ${
          isCandy ? 'border-pink-200/60' : isDark ? 'border-white/10' : 'border-orange-500/20'
        }`}
      >
        <div className="wordmark flex items-center gap-3">
          <div className="relative">
            <GalaxyLogoMini size={28} />
            <span className="absolute -top-1.5 -right-1 text-[10px] animate-pulse">
              {isHalloween ? '🎃' : isCandy ? '🍬' : '⚡'}
            </span>
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span
                className={`font-extrabold text-base tracking-tight font-mono ${
                  isCandy ? 'text-slate-900' : 'text-white'
                }`}
              >
                {t.appName}
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow-sm ${
                  isCandy
                    ? 'bg-pink-500 text-white shadow-pink-500/20'
                    : isDark
                    ? 'bg-white text-black'
                    : 'bg-orange-500 text-black shadow-orange-500/30'
                }`}
              >
                {isCandy ? '🍬 CANDY' : isDark ? '🌙 DARK' : t.versionBadge}
              </span>
            </div>
            <span
              className={`text-[10px] font-mono ${
                isCandy ? 'text-slate-500' : isDark ? 'text-zinc-400' : 'text-orange-300/80'
              }`}
            >
              {t.appSubtitle}
            </span>
          </div>
        </div>

        <div className="landing-nav-links flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          {/* Quick Theme Mode Toggle on Landing Bar */}
          <div
            className={`flex items-center p-0.5 rounded-xl border text-[11px] font-mono shadow-sm ${
              isCandy
                ? 'bg-pink-50/80 border-pink-200 text-slate-700'
                : isDark
                ? 'bg-white/[0.06] border-white/15 text-zinc-300'
                : 'bg-[#190a30]/80 border-orange-500/30 text-orange-200'
            }`}
          >
            <button
              type="button"
              onClick={() => handleModeToggle('dark')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer font-semibold ${
                isDark ? 'bg-white text-black shadow-sm' : 'hover:opacity-80'
              }`}
              title="Switch to Dark Mode"
            >
              🌙 Dark
            </button>
            <button
              type="button"
              onClick={() => handleModeToggle('halloween')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer font-semibold ${
                isHalloween ? 'bg-orange-500 text-black shadow-sm' : 'hover:opacity-80'
              }`}
              title="Switch to Halloween Mode"
            >
              🎃 Halloween
            </button>
            <button
              type="button"
              onClick={() => handleModeToggle('candy')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer font-semibold ${
                isCandy
                  ? 'bg-gradient-to-r from-pink-500 to-amber-400 text-white shadow-sm'
                  : 'hover:opacity-80'
              }`}
              title="Switch to Candy (White) Light Mode"
            >
              🍬 Candy
            </button>
          </div>

          {preferences && onSelectLanguage && (
            <LanguageDropdown
              preferences={preferences}
              onSelectLanguage={onSelectLanguage}
            />
          )}
          <button
            onClick={about}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
              isCandy
                ? 'text-slate-700 hover:text-slate-900 bg-pink-50/60 hover:bg-pink-100 border-pink-200'
                : isDark
                ? 'text-zinc-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border-white/15'
                : 'text-orange-200 hover:text-white bg-orange-950/30 hover:bg-orange-900/40 border-orange-500/30'
            }`}
          >
            {t.about}
          </button>
          <button
            onClick={privacy}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
              isCandy
                ? 'text-slate-700 hover:text-slate-900 bg-pink-50/60 hover:bg-pink-100 border-pink-200'
                : isDark
                ? 'text-zinc-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border-white/15'
                : 'text-orange-200 hover:text-white bg-orange-950/30 hover:bg-orange-900/40 border-orange-500/30'
            }`}
          >
            {t.privacy}
          </button>
          <button
            onClick={() => onEnterIDE ? onEnterIDE() : launch()}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 border ${
              isCandy
                ? 'text-pink-700 hover:text-pink-900 bg-pink-100/80 hover:bg-pink-100 border-pink-300 shadow-xs'
                : isDark
                ? 'text-blue-300 hover:text-white bg-blue-950/40 hover:bg-blue-900/50 border-blue-500/35 shadow-xs'
                : 'text-purple-200 hover:text-white bg-purple-950/50 hover:bg-purple-900/60 border-purple-500/40 shadow-xs'
            }`}
          >
            <Code2 size={13} className={isCandy ? 'text-pink-600' : 'text-blue-400'} />
            <span>Enter IDE</span>
          </button>
          <button
            onClick={launch}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 border ${
              isCandy
                ? 'text-white bg-gradient-to-r from-pink-500 to-amber-400 hover:from-pink-400 hover:to-amber-300 border-pink-400 shadow-md shadow-pink-500/25'
                : isDark
                ? 'text-black bg-white hover:bg-zinc-200 border-white/60 shadow-md shadow-white/10'
                : 'text-black bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-300 hover:to-amber-300 border border-orange-400 shadow-md shadow-orange-500/30'
            }`}
          >
            <span>{t.launch}</span>
            <ArrowUp size={13} style={{ transform: 'rotate(45deg)' }} />
          </button>
        </div>
      </nav>

      {/* Main Hero */}
      <div className="hero flex flex-col items-center justify-center text-center max-w-4xl w-full mx-auto my-auto py-10 sm:py-16 relative z-10">
        {/* Core Visual */}
        <div className="mb-6 flex justify-center items-center relative">
          <div
            className={`absolute inset-0 rounded-full filter blur-2xl pointer-events-none ${
              isCandy ? 'bg-pink-400/20' : isDark ? 'bg-blue-500/10' : 'bg-orange-500/20'
            }`}
          />
          <GalaxyLogo size={190} />
          <div
            className={`absolute -bottom-2 right-8 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono shadow-lg border ${
              isCandy
                ? 'bg-white border-pink-300 text-pink-700 shadow-pink-100'
                : isDark
                ? 'bg-[#121622] border-white/20 text-zinc-200'
                : 'bg-[#1e0a35] border-orange-500/50 text-orange-300'
            }`}
          >
            <span>{isHalloween ? '🎃' : isCandy ? '🍬' : '⚡'}</span>
            <span className="font-bold">
              {isHalloween ? 'Halloween Edition' : isCandy ? 'Candy Edition' : 'Production Workspace'}
            </span>
          </div>
        </div>

        {/* Editorial Pill Kicker */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono mb-5 shadow-lg ${
            isCandy
              ? 'bg-pink-50 border border-pink-200 text-pink-700 shadow-pink-100/50'
              : isDark
              ? 'bg-white/[0.06] border border-white/15 text-zinc-300 shadow-black/50'
              : 'bg-orange-950/60 border border-orange-500/45 text-orange-200 shadow-orange-950/50'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full animate-pulse ${
              isCandy
                ? 'bg-pink-500 shadow-[0_0_8px_#ec4899]'
                : isDark
                ? 'bg-blue-400 shadow-[0_0_8px_#38bdf8]'
                : 'bg-orange-400 shadow-[0_0_8px_#ff7a00]'
            }`}
          />
          <span className={`font-bold tracking-wide ${isCandy ? 'text-pink-900' : 'text-white'}`}>
            {isHalloween ? '🎃 ' : isCandy ? '🍬 ' : ''}{t.appName}
          </span>
          <span className={isCandy ? 'text-pink-300' : isDark ? 'text-zinc-500' : 'text-orange-500'}>•</span>
          <span className={`font-semibold ${isCandy ? 'text-pink-700' : isDark ? 'text-zinc-300' : 'text-orange-200'}`}>
            {isCandy ? 'CANDY (WHITE) LIGHT MODE' : isDark ? 'CLASSIC DARK MODE' : t.kickerBadge}
          </span>
        </div>

        {/* Headline */}
        <h1
          className={`text-4xl sm:text-6xl font-extrabold tracking-tight mb-4 leading-[1.08] max-w-3xl ${
            isCandy ? 'text-slate-900' : 'text-white'
          }`}
        >
          {t.heroHeadlinePart1}
          <span
            className={
              isCandy
                ? 'bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 bg-clip-text text-transparent'
                : isDark
                ? 'bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-orange-400 via-amber-200 to-purple-300 bg-clip-text text-transparent'
            }
          >
            {t.heroHeadlinePart2}
          </span>
        </h1>

        {/* Subheading */}
        <p
          className={`text-sm sm:base max-w-2xl leading-relaxed mb-4 ${
            isCandy ? 'text-slate-600' : isDark ? 'text-zinc-300' : 'text-orange-100/90'
          }`}
        >
          {t.heroSubhead}
        </p>

        {/* Acronym Clarification Notice */}
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs mb-6 shadow-sm max-w-xl mx-auto border ${
            isCandy
              ? 'bg-pink-50/80 border-pink-200 text-pink-800'
              : isDark
              ? 'bg-white/[0.05] border-white/10 text-zinc-300'
              : 'bg-purple-950/40 border-purple-500/30 text-purple-200'
          }`}
        >
          <Info
            size={13}
            className={`flex-shrink-0 ${isCandy ? 'text-pink-500' : isDark ? 'text-zinc-400' : 'text-purple-300'}`}
          />
          <span>{t.acronymNotice}</span>
        </div>

        {/* Centered Disclaimer Box */}
        <div
          className={`w-full max-w-2xl mx-auto mb-8 p-4 sm:p-5 rounded-2xl border shadow-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left transition-all ${
            isCandy
              ? 'bg-white/95 border-pink-200/90 shadow-pink-100/60 hover:border-pink-300 text-slate-800'
              : isDark
              ? 'bg-[#111624]/90 border-white/15 shadow-black/60 hover:border-white/25 text-zinc-200'
              : 'bg-[#160829]/95 border-orange-500/35 shadow-orange-950/50 hover:border-orange-500/50'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner border ${
              isCandy
                ? 'bg-pink-50 border-pink-200 text-pink-500'
                : isDark
                ? 'bg-zinc-800 border-white/10 text-blue-400'
                : 'bg-orange-950/80 border-orange-500/40 text-orange-400'
            }`}
          >
            {isHalloween ? (
              <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(255,120,0,0.85)]">🎃</span>
            ) : isCandy ? (
              <span className="text-2xl">🍬</span>
            ) : (
              <ShieldCheck size={24} />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span
                className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase ${
                  isCandy
                    ? 'bg-pink-500 text-white'
                    : isDark
                    ? 'bg-white text-black'
                    : 'bg-orange-500 text-black'
                }`}
              >
                {isHalloween ? '🎃 SPOOKY LIMITED EDITION' : isCandy ? '🍬 CANDY LIGHT EDITION' : 'CLIENT-SIDE ENCRYPTED'}
              </span>
              <span
                className={`text-xs font-mono font-semibold ${
                  isCandy ? 'text-slate-700' : isDark ? 'text-zinc-300' : 'text-orange-200'
                }`}
              >
                {t.versionNotice}
              </span>
            </div>
            <p
              className={`text-xs sm:text-sm font-mono leading-relaxed ${
                isCandy ? 'text-slate-700' : isDark ? 'text-zinc-300' : 'text-orange-100'
              }`}
            >
              <strong
                className={`font-bold ${
                  isCandy ? 'text-pink-600' : isDark ? 'text-white' : 'text-orange-300'
                }`}
              >
                {t.versionBadge}
              </strong>{' '}
              - {t.disclaimerBody}
            </p>
            <div
              className={`pt-2 border-t text-xs font-sans flex items-center justify-center sm:justify-start gap-1.5 leading-relaxed ${
                isCandy
                  ? 'border-pink-100 text-slate-500'
                  : isDark
                  ? 'border-white/10 text-zinc-400'
                  : 'border-orange-500/20 text-orange-300/80'
              }`}
            >
              <Info
                size={13}
                className={`flex-shrink-0 ${
                  isCandy ? 'text-pink-500' : isDark ? 'text-zinc-400' : 'text-orange-400'
                }`}
              />
              <span>({t.acronymNotice})</span>
            </div>
          </div>
        </div>

        {/* Purple Cartoon Style Tree with Sleeping Celestial Cat and Roots wrapping the 3 Buttons */}
        <CelestialCatTreeHero
          onLaunch={launch}
          onSettings={settings}
          onOpenGuide={onOpenGuide}
          onEnterIDE={onEnterIDE}
          launchLabel={t.launchWorkspace}
          settingsLabel={t.configureApiKeys}
          guideLabel={t.interactiveGuide}
          enterIDELabel={t.enterIDE || 'Enter IDE'}
          themeMode={themeMode}
        />

        {/* Architectural Trust Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-left w-full">
          <div
            className={`p-4 rounded-xl transition-colors shadow-md border ${
              isCandy
                ? 'bg-white/95 border-pink-200/80 hover:border-pink-400 shadow-pink-100/50'
                : isDark
                ? 'bg-[#101422]/90 border-white/10 hover:border-white/25 shadow-black/50'
                : 'bg-[#140722]/85 border-orange-500/25 hover:border-orange-500/50'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 border ${
                isCandy
                  ? 'bg-pink-100/70 border-pink-200 text-pink-600'
                  : isDark
                  ? 'bg-zinc-800/80 border-white/15 text-blue-400'
                  : 'bg-orange-950/60 border-orange-500/40 text-orange-400'
              }`}
            >
              <Orbit size={16} />
            </div>
            <h3 className={`text-xs font-bold mb-1 ${isCandy ? 'text-slate-900' : isDark ? 'text-white' : 'text-orange-200'}`}>
              {t.featDirectTitle}
            </h3>
            <p className={`text-[11px] leading-relaxed ${isCandy ? 'text-slate-600' : isDark ? 'text-zinc-400' : 'text-orange-100/70'}`}>
              {t.featDirectDesc}
            </p>
          </div>

          <div
            className={`p-4 rounded-xl transition-colors shadow-md border ${
              isCandy
                ? 'bg-white/95 border-purple-200/80 hover:border-purple-400 shadow-purple-100/50'
                : isDark
                ? 'bg-[#101422]/90 border-white/10 hover:border-white/25 shadow-black/50'
                : 'bg-[#140722]/85 border-purple-500/25 hover:border-purple-500/50'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 border ${
                isCandy
                  ? 'bg-purple-100/70 border-purple-200 text-purple-600'
                  : isDark
                  ? 'bg-zinc-800/80 border-white/15 text-purple-400'
                  : 'bg-purple-950/60 border-purple-500/40 text-purple-300'
              }`}
            >
              <Users size={16} />
            </div>
            <h3 className={`text-xs font-bold mb-1 ${isCandy ? 'text-slate-900' : isDark ? 'text-white' : 'text-purple-200'}`}>
              {t.featSwarmTitle}
            </h3>
            <p className={`text-[11px] leading-relaxed ${isCandy ? 'text-slate-600' : isDark ? 'text-zinc-400' : 'text-purple-100/70'}`}>
              {t.featSwarmDesc}
            </p>
          </div>

          <div
            className={`p-4 rounded-xl transition-colors shadow-md border ${
              isCandy
                ? 'bg-white/95 border-emerald-200/80 hover:border-emerald-400 shadow-emerald-100/50'
                : isDark
                ? 'bg-[#101422]/90 border-white/10 hover:border-white/25 shadow-black/50'
                : 'bg-[#140722]/85 border-emerald-500/25 hover:border-emerald-500/50'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 border ${
                isCandy
                  ? 'bg-emerald-100/70 border-emerald-200 text-emerald-600'
                  : isDark
                  ? 'bg-zinc-800/80 border-white/15 text-emerald-400'
                  : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
              }`}
            >
              <ShieldCheck size={16} />
            </div>
            <h3 className={`text-xs font-bold mb-1 ${isCandy ? 'text-slate-900' : isDark ? 'text-white' : 'text-emerald-200'}`}>
              {t.featClientTitle}
            </h3>
            <p className={`text-[11px] leading-relaxed ${isCandy ? 'text-slate-600' : isDark ? 'text-zinc-400' : 'text-emerald-100/70'}`}>
              {t.featClientDesc}
            </p>
          </div>

          <div
            className={`p-4 rounded-xl transition-colors shadow-md border ${
              isCandy
                ? 'bg-white/95 border-amber-200/80 hover:border-amber-400 shadow-amber-100/50'
                : isDark
                ? 'bg-[#101422]/90 border-white/10 hover:border-white/25 shadow-black/50'
                : 'bg-[#140722]/85 border-amber-500/25 hover:border-amber-500/50'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 border ${
                isCandy
                  ? 'bg-amber-100/70 border-amber-200 text-amber-600'
                  : isDark
                  ? 'bg-zinc-800/80 border-white/15 text-amber-400'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-400'
              }`}
            >
              <Zap size={16} />
            </div>
            <h3 className={`text-xs font-bold mb-1 ${isCandy ? 'text-slate-900' : isDark ? 'text-white' : 'text-amber-200'}`}>
              {t.featSaverTitle}
            </h3>
            <p className={`text-[11px] leading-relaxed ${isCandy ? 'text-slate-600' : isDark ? 'text-zinc-400' : 'text-amber-100/70'}`}>
              {t.featSaverDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className={`w-full max-w-5xl mx-auto mt-auto pt-8 pb-4 text-xs font-mono flex flex-wrap items-center justify-between gap-4 border-t relative z-10 ${
          isCandy
            ? 'border-pink-200/60 text-slate-500'
            : isDark
            ? 'border-white/10 text-zinc-400'
            : 'border-orange-500/20 text-orange-300/70'
        }`}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-semibold ${isCandy ? 'text-slate-900' : 'text-white'}`}>DOCX WEB</span>
          <span>•</span>
          <span
            className={`font-semibold ${
              isCandy ? 'text-pink-600' : isDark ? 'text-white' : 'text-orange-400'
            }`}
          >
            {isHalloween ? '🎃 HALLOWEEN LIMITED EDITION' : isCandy ? '🍬 CANDY (WHITE) LIGHT MODE' : '🌙 CLASSIC DARK MODE'}
          </span>
          <span>•</span>
          <span>{t.versionTag}</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <a
            href="https://github.com/aplx-renz-sudo/Docx-web-app"
            target="_blank"
            rel="noreferrer"
            className={`transition-colors ${
              isCandy
                ? 'text-pink-600 hover:text-pink-800'
                : isDark
                ? 'text-zinc-400 hover:text-white'
                : 'text-orange-300/80 hover:text-white'
            }`}
          >
            GITHUB REPOSITORY ↗
          </a>
        </div>
      </footer>
    </main>
  );
}

function PromptDeck({
  choose,
  showGuideBanner,
  onOpenGuide,
  onDismissGuide,
}: {
  choose: (prompt: string) => void;
  showGuideBanner?: boolean;
  onOpenGuide?: () => void;
  onDismissGuide?: () => void;
}) {
  const prompts = [
    ['Plan a project', 'Turn an idea into a clear plan.', Telescope],
    ['Explain a concept', 'Learn something with useful examples.', BookOpen],
    ['Write some code', 'Build, debug, or refactor together.', Code2],
    ['Explore an idea', 'Think through the possibilities.', WandSparkles],
  ] as const;
  return (
    <div className="space-y-4">
      {showGuideBanner && onOpenGuide && (
        <div className="p-4 rounded-xl bg-[#181818] border border-white/10 flex items-center justify-between gap-4 relative animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white flex-none">
              <Terminal size={18} />
            </div>
            <div>
              <b className="text-xs sm:text-sm text-white block">New to Docx? Start Interactive Walkthrough</b>
              <span className="text-[11px] text-zinc-400">Learn about direct multi-model switching, 6-worker swarms, and token savings.</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-none">
            <button
              type="button"
              onClick={onOpenGuide}
              className="playful-pop px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-black hover:bg-zinc-200 cursor-pointer"
            >
              Start Guide →
            </button>
            {onDismissGuide && (
              <button
                type="button"
                onClick={onDismissGuide}
                className="playful-pop p-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer"
                title="Dismiss banner"
                aria-label="Dismiss banner"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      )}
      <div className="prompt-deck">
        {prompts.map(([title, body, Icon]) => (
          <button onClick={() => choose(`${title}: ${body}`)} key={title} className="playful-pop">
            <Icon size={17} />
            <b>{title}</b>
            <span>{body}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageView({
  message,
  userProfile,
  regenerate,
  isThinking,
  onSpeak,
  isSpeaking,
  onEditPrompt,
  themeMode = 'halloween',
  isPositionMode,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  message: Message;
  userProfile?: UserProfile | null;
  regenerate: () => void;
  isThinking?: boolean;
  onSpeak: () => void;
  isSpeaking?: boolean;
  onEditPrompt?: (text: string) => void;
  themeMode?: ThemeMode;
  isPositionMode?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftEdit, setDraftEdit] = useState(message.content);

  const copy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1300);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftEdit.trim()) return;
    setIsEditing(false);
    onEditPrompt?.(draftEdit);
  };

  const renderAvatar = () => {
    if (message.role === 'user') {
      if (userProfile?.avatarType === 'custom' && userProfile.avatar) {
        return (
          <img
            src={userProfile.avatar}
            alt="You"
            className="w-full h-full object-cover rounded-full aspect-square"
            referrerPolicy="no-referrer"
          />
        );
      }
      if (userProfile?.avatar) {
        const p = userProfile.avatar;
        return (
          <span className="text-sm select-none">
            {p === 'hacker' ? '👾' : p === 'wizard' ? '🧙‍♂️' : p === 'alchemist' ? '🔮' : p === 'architect' ? '⚡' : p === 'cat' ? '🐱' : p === 'fox' ? '🦊' : p === 'robot' ? '🤖' : '🧑‍🚀'}
          </span>
        );
      }
      return 'Y';
    }
    return <GalaxyLogoMini size={18} />;
  };

  return (
    <article className={'message ' + message.role}>
      <div className="avatar">{renderAvatar()}</div>
      <div className="message-body">
        <div className="message-meta flex items-center justify-between">
          <div>
            {message.role === 'user' ? (userProfile?.name || 'You') : 'VileDocx'}{' '}
            <time>{message.time}</time>
          </div>
        </div>

        {isThinking ? (
          <ThinkingIndicator modelName="VileDocx" themeMode={themeMode} />
        ) : isEditing ? (
          <form onSubmit={handleSaveEdit} className="my-2 space-y-2">
            <textarea
              rows={3}
              value={draftEdit}
              onChange={e => setDraftEdit(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#2f2f2f] border border-white/[0.15] text-sm text-[#ececec] outline-none font-sans"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="playful-pop px-3 py-1 bg-white text-black rounded-md text-xs font-bold"
              >
                Save & Resend
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="playful-pop px-3 py-1 bg-[#333333] text-[#b4b4b4] rounded-md text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : message.content ? (
          <div className={message.role === 'user' ? 'user-bubble-content' : 'model-content'}>
            <Mark text={message.content} />
          </div>
        ) : null}

        {/* Message Action Tools */}
        {message.content && !isThinking && (
          <div className="message-tools flex flex-wrap items-center gap-1.5 mt-2">
            {isPositionMode && (
              <div
                className={`message-position-tools flex items-center gap-1 py-0.5 px-2 rounded-md text-[11px] font-mono mr-1 border ${
                  themeMode === 'candy'
                    ? 'bg-pink-50 border-pink-200 text-pink-700'
                    : 'bg-white/10 border-white/15 text-zinc-200'
                }`}
              >
                <span className="opacity-70 text-[10px]">Pos:</span>
                <button
                  type="button"
                  disabled={!canMoveUp}
                  onClick={onMoveUp}
                  className="px-1.5 py-0.5 rounded hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-0.5 text-xs"
                  title="Move message up in conversation"
                >
                  <ArrowUp size={11} /> Up
                </button>
                <button
                  type="button"
                  disabled={!canMoveDown}
                  onClick={onMoveDown}
                  className="px-1.5 py-0.5 rounded hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-0.5 text-xs"
                  title="Move message down in conversation"
                >
                  <ArrowDown size={11} /> Down
                </button>
              </div>
            )}

            <button onClick={copy} title="Copy text" className="playful-pop">
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </button>

            {message.role === 'model' && (
              <>
                <button onClick={regenerate} title="Regenerate response" className="playful-pop">
                  <RotateCcw size={13} />
                  Retry
                </button>
                <button onClick={onSpeak} title="Read aloud (Text to Speech)" className="playful-pop">
                  {isSpeaking ? <VolumeX size={13} className="text-amber-400" /> : <Volume2 size={13} />}
                  {isSpeaking ? 'Stop' : 'Listen'}
                </button>
              </>
            )}

            {message.role === 'user' && (
              <button onClick={() => setIsEditing(true)} title="Edit prompt" className="playful-pop">
                <Pencil size={13} />
                Edit
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function Composer({
  value,
  change,
  send,
  stop,
  streaming,
  sendOnEnter,
  onOpenPrompts,
  onOpenHelp,
  onToggleVoice,
  isRecordingVoice,
  onAttachFile,
  onOpenTokenSaver,
  onEnterIDE,
  themeMode,
  widthClass,
  alignClass,
  isFloating,
}: {
  value: string;
  change: (x: string) => void;
  send: () => void;
  stop: () => void;
  streaming: boolean;
  sendOnEnter: boolean;
  onOpenPrompts: () => void;
  onOpenHelp: () => void;
  onToggleVoice: () => void;
  isRecordingVoice: boolean;
  onAttachFile: () => void;
  onOpenTokenSaver: () => void;
  onEnterIDE?: () => void;
  themeMode?: ThemeMode;
  widthClass?: string;
  alignClass?: string;
  isFloating?: boolean;
}) {
  const area = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 130)}px`;
  }, [value]);

  const isCandy = themeMode === 'candy';

  return (
    <div
      className={`composer-wrap ${
        isFloating ? 'composer-floating-wrap pb-4' : ''
      } ${
        isCandy
          ? 'bg-gradient-to-t from-white via-white/95 to-transparent border-t border-pink-200/40'
          : ''
      }`}
    >
      <div
        className={`composer ${widthClass || 'max-w-[768px]'} ${alignClass || 'mx-auto'} ${
          isFloating ? 'shadow-2xl ring-1 ring-white/10' : ''
        } ${
          isCandy
            ? 'bg-white border-2 border-pink-300 shadow-xl shadow-pink-100/60 focus-within:border-pink-400 focus-within:shadow-pink-200/60'
            : ''
        }`}
        style={{
          maxWidth: widthClass?.includes('max-w-none')
            ? '100%'
            : widthClass?.includes('960px')
            ? '960px'
            : widthClass?.includes('640px')
            ? '640px'
            : '768px',
          margin: alignClass?.includes('mr-auto')
            ? '0 auto 0 0'
            : alignClass?.includes('ml-auto')
            ? '0 0 0 auto'
            : 'auto',
        }}
      >
        {/* Helper Action Quick Ribbon */}
        <div className="composer-ribbon">
          <div className="composer-ribbon-left">
            <button
              type="button"
              onClick={onOpenHelp}
              className={`ribbon-pill ribbon-pill-guide playful-pop ${
                isCandy
                  ? 'bg-white border border-pink-200 hover:border-pink-300 hover:bg-pink-50 text-slate-700 hover:text-pink-600 shadow-xs'
                  : ''
              }`}
              title="Interactive Help & Guide Walkthrough"
            >
              <HelpCircle size={13} className={isCandy ? 'text-pink-500' : 'text-zinc-300'} />
              <span>Guide & Help</span>
            </button>
            <button
              type="button"
              onClick={onOpenPrompts}
              className={`ribbon-pill ribbon-pill-prompts playful-pop ${
                isCandy
                  ? 'bg-white border border-pink-200 hover:border-pink-300 hover:bg-pink-50 text-slate-700 hover:text-pink-600 shadow-xs'
                  : ''
              }`}
              title="Prompt Template Library (Ctrl+K)"
            >
              <Sparkles size={13} className={isCandy ? 'text-pink-500' : 'text-zinc-300'} />
              <span>Prompt Library</span>
            </button>
            {onEnterIDE && (
              <button
                type="button"
                onClick={onEnterIDE}
                className={`ribbon-pill ribbon-pill-ide playful-pop ${
                  isCandy
                    ? 'bg-gradient-to-r from-pink-500 to-amber-400 text-white font-bold border border-pink-400 shadow-xs'
                    : 'bg-blue-600/20 hover:bg-blue-600/35 text-blue-300 hover:text-white border border-blue-500/40 font-semibold'
                }`}
                title="Enter Docx-IDE Development Environment"
              >
                <Code2 size={13} className={isCandy ? 'text-white' : 'text-blue-400'} />
                <span>Enter IDE</span>
              </button>
            )}
          </div>
          <div className="composer-ribbon-right">
            <button
              type="button"
              onClick={onOpenTokenSaver}
              className={`ribbon-pill ribbon-pill-tokensaver playful-pop ${
                isCandy
                  ? 'bg-white border border-pink-200 hover:border-pink-300 hover:bg-pink-50 text-slate-700 hover:text-pink-600 shadow-xs'
                  : ''
              }`}
              title="Token Saver Optimizer Active"
            >
              <Zap size={12} className={isCandy ? 'text-pink-500' : 'text-zinc-300'} />
              <span>Token Saver Active</span>
            </button>
          </div>
        </div>

        <div className="flex items-end gap-2">
          {/* Quick Tools */}
          <div className="flex items-center gap-1 pb-1">
            <button
              type="button"
              onClick={onAttachFile}
              title="Attach file (text/code/json)"
              className={`playful-pop p-1.5 rounded-lg transition-colors cursor-pointer ${
                isCandy
                  ? 'bg-white hover:bg-pink-50 text-pink-500 hover:text-pink-600 border border-pink-200 shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Paperclip size={16} />
            </button>
            <button
              type="button"
              onClick={onOpenPrompts}
              title="Open Prompt Library (Ctrl+K)"
              className={`playful-pop p-1.5 rounded-lg transition-colors cursor-pointer ${
                isCandy
                  ? 'bg-white hover:bg-pink-50 text-pink-500 hover:text-pink-600 border border-pink-200 shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkles size={16} />
            </button>
            <button
              type="button"
              onClick={onToggleVoice}
              title={isRecordingVoice ? 'Stop voice recording' : 'Dictate with voice'}
              className={`playful-pop p-1.5 rounded-lg transition-colors cursor-pointer ${
                isRecordingVoice
                  ? isCandy
                    ? 'bg-pink-500 text-white animate-pulse border border-pink-500'
                    : 'bg-white/20 text-white animate-pulse'
                  : isCandy
                  ? 'bg-white hover:bg-pink-50 text-pink-500 hover:text-pink-600 border border-pink-200 shadow-xs'
                  : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {isRecordingVoice ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          </div>

          <textarea
            ref={area}
            value={value}
            onChange={e => change(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey && sendOnEnter) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Message VileDocx…"
            rows={1}
            className={`flex-1 ${isCandy ? 'text-slate-900 placeholder:text-slate-400' : 'text-[#ececec]'}`}
          />

          {streaming ? (
            <button
              className={`send stop playful-pop ${
                isCandy
                  ? 'bg-white border-2 border-rose-500 text-rose-500 hover:bg-rose-50 shadow-md'
                  : ''
              }`}
              onClick={stop}
              aria-label="Stop generating"
            >
              <span className={isCandy ? 'bg-rose-500' : ''} />
            </button>
          ) : (
            <button
              className={`send playful-pop ${
                isCandy
                  ? value.trim()
                    ? 'bg-white border-2 border-pink-500 text-pink-600 hover:bg-pink-50 shadow-md shadow-pink-200/50 cursor-pointer'
                    : 'bg-white border border-pink-200 text-pink-300 opacity-60 cursor-not-allowed'
                  : ''
              }`}
              disabled={!value.trim()}
              onClick={send}
              aria-label="Send message"
            >
              <ArrowUp size={18} />
            </button>
          )}
        </div>
      </div>
      <p className={isCandy ? 'text-slate-500' : ''}>
        {sendOnEnter ? 'Enter sends · Shift + Enter adds a line' : 'Enter adds a line · Use ↑ to send'}
      </p>
    </div>
  );
}

function FullSettingsModal({
  tab,
  setTab,
  providerConfig,
  onProviderChange,
  preferences,
  setPreferences,
  tokenStats,
  onResetTokenStats,
  onExportChat,
  onImportChat,
  onClearAllData,
  back,
  onAbout,
  onPrivacy,
  onNavigateToBuild,
  onConnectDeveloper,
  onOpenPositionEditor,
}: {
  tab: 'provider' | 'tokensaver' | 'workers' | 'appearance' | 'pets' | 'thinking' | 'persona' | 'languages' | 'privacy' | 'about';
  setTab: (x: typeof tab) => void;
  providerConfig: ProviderConfig;
  onProviderChange: (c: ProviderConfig) => void;
  preferences: Preferences;
  setPreferences: (x: Preferences) => void;
  tokenStats: TokenStats;
  onResetTokenStats: () => void;
  onExportChat: (format: 'json' | 'markdown' | 'text') => void;
  onImportChat: (jsonStr: string) => void;
  onClearAllData: () => void;
  back: () => void;
  onAbout: () => void;
  onPrivacy?: () => void;
  onNavigateToBuild?: () => void;
  onConnectDeveloper?: () => void;
  onOpenPositionEditor?: () => void;
}) {
  const SECTIONS = [
    {
      title: 'AI Engines & Efficiency',
      items: [
        { id: 'provider' as const, label: 'AI Provider & Models', icon: Sparkles, badge: '8 APIs', color: 'text-zinc-200' },
        { id: 'tokensaver' as const, label: 'Token Saver Engine', icon: Zap, badge: '⚡ ~22%', color: 'text-zinc-200' },
        { id: 'workers' as const, label: 'Multiple Workers (Alpha)', icon: Users, badge: 'Build Mode Only', color: 'text-zinc-200' },
      ],
    },
    {
      title: 'Look & Companions',
      items: [
        { id: 'appearance' as const, label: 'Themes & Customizer', icon: Palette, badge: '8 Themes', color: 'text-zinc-200' },
        { id: 'pets' as const, label: 'Companion Pets', icon: Cat, badge: 'Interactive', color: 'text-zinc-200' },
        { id: 'thinking' as const, label: 'Thinking Deliberation', icon: BrainCircuit, badge: '5 Styles', color: 'text-zinc-200' },
        { id: 'persona' as const, label: 'AI Persona & Creativity', icon: Sliders, badge: '7 Modes', color: 'text-zinc-200' },
        { id: 'languages' as const, label: 'Languages', icon: Globe, badge: '4 Langs', color: 'text-zinc-200' },
      ],
    },
    {
      title: 'Security & Platform',
      items: [
        { id: 'privacy' as const, label: 'Data & Privacy Hub', icon: ShieldCheck, badge: '100% Client', color: 'text-zinc-200' },
        { id: 'about' as const, label: 'About & Ecosystem', icon: Orbit, badge: 'V3 - LIMITED EDITION UPDATE (BETA)', color: 'text-zinc-200' },
      ],
    },
  ];

  return (
    <main className="settings-page animate-fade-in">
      <header className="settings-header">
        <button className="back playful-pop" onClick={back}>
          <ChevronLeft size={18} />
          <span>Back to Workspace</span>
        </button>
        <div className="wordmark flex items-center gap-2.5">
          <GalaxyLogoMini size={22} />
          <span>VILEDOCX</span>
          <span className="text-[11px] font-mono font-medium text-[#8ea8ff] bg-[#14203d] border border-[#233560] px-2.5 py-0.5 rounded-full tracking-wider whitespace-nowrap">
            SETTINGS HUB
          </span>
        </div>
        <div className="web-pill flex items-center gap-2">
          <span>SECURE & OFFLINE</span> <i />
        </div>
      </header>
      <div className="settings-layout">
        <aside className="settings-nav">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#1b2848]">
            <div className="text-xs font-bold text-white tracking-wider flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#8ea8ff] shadow-sm shadow-[#8ea8ff]" />
              <span>PREFERENCES</span>
            </div>
            <span className="text-[10px] font-mono text-[#7d93be] bg-[#11192e] px-2 py-0.5 rounded border border-[#203055]">
              Local Storage
            </span>
          </div>

          <div className="space-y-4">
            {SECTIONS.map((sec, idx) => (
              <div key={idx}>
                <div className="settings-nav-section-title">{sec.title}</div>
                <div className="space-y-1">
                  {sec.items.map(t => {
                    const Icon = t.icon;
                    const isSelected = tab === t.id;
                    return (
                      <button
                        key={t.id}
                        className={`settings-tab-btn playful-pop ${isSelected ? 'selected' : ''}`}
                        onClick={() => setTab(t.id)}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-none ${isSelected ? 'bg-white/20' : 'bg-white/[0.05] border border-white/[0.08]'}`}>
                            <Icon size={13} className={`${t.color}`} />
                          </div>
                          <span className="truncate">{t.label}</span>
                        </div>
                        {t.badge && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium flex-none ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-[#121a30] text-[#7f94be] border border-[#202e4f]'
                            }`}
                          >
                            {t.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Luxury System Status Micro-Panel */}
          <div className="mt-6 pt-4 border-t border-[#182544] space-y-2 text-[11px] text-[#798eb4]">
            <div className="flex items-center justify-between">
              <span>Client Routing</span>
              <span className="text-emerald-400 font-mono font-semibold">● Direct API</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Data Retention</span>
              <span className="text-[#a4b8df] font-mono">Browser-Only</span>
            </div>
          </div>
        </aside>

        <section className="settings-content">
          <div className="rounded-[32px] bg-[#090e1b]/75 border border-white/[0.1] p-8 sm:p-11 md:p-12 shadow-2xl shadow-black/80 backdrop-blur-xl transition-all">
            {tab === 'provider' && (
              <ProviderSettings
                config={providerConfig}
                onChange={onProviderChange}
                onSave={() => {
                  if (preferences.soundEffects) sounds.playComplete();
                  alert('AI Provider & Model settings saved successfully!');
                }}
              />
            )}

            {tab === 'tokensaver' && (
              <TokenSaverSettings
                preferences={preferences}
                setPreferences={setPreferences}
                tokenStats={tokenStats}
                onResetTokenStats={onResetTokenStats}
              />
            )}

            {tab === 'workers' && (
              <MultipleWorkersSettingsTab
                preferences={preferences}
                onUpdatePreferences={updater => setPreferences(updater(preferences))}
                onNavigateToBuild={onNavigateToBuild}
              />
            )}

            {tab === 'appearance' && (
              <AppearanceSettings
                preferences={preferences}
                setPreferences={setPreferences}
                onOpenPositionEditor={onOpenPositionEditor}
              />
            )}

            {tab === 'pets' && (
              <PetSettings
                preferences={preferences}
                setPreferences={setPreferences}
              />
            )}

            {tab === 'thinking' && (
              <ThinkingSettings
                preferences={preferences}
                setPreferences={setPreferences}
              />
            )}

            {tab === 'persona' && (
              <PersonaSettings
                preferences={preferences}
                setPreferences={setPreferences}
              />
            )}

            {tab === 'languages' && (
              <LanguagesSettingsTab
                preferences={preferences}
                setPreferences={setPreferences}
              />
            )}

            {tab === 'privacy' && (
              <DataManagementSettings
                onExportChat={onExportChat}
                onImportChat={onImportChat}
                onClearAllData={onClearAllData}
                onViewPrivacy={onPrivacy}
              />
            )}

            {tab === 'about' && (
              <div className="space-y-8">
                <div>
                  <div className="section-kicker">ABOUT</div>
                  <h2 className="text-2xl font-bold text-white tracking-tight mt-1">VileDocx Web</h2>
                  <p className="lead text-sm text-[#8da0c4] mt-1">The browser-based, private member of the VileDocx ecosystem.</p>
                </div>
                <div className="about-grid">
                  <div>
                    <small>VERSION</small>
                    <b>V3 - LIMITED EDITION UPDATE (BETA) Edition</b>
                  </div>
                  <div>
                    <small>BUILT BY</small>
                    <b>R3nz</b>
                  </div>
                  <div>
                    <small>MODE</small>
                    <b>Client-Side · Direct Routing</b>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button type="button" className="about-story-btn playful-pop" onClick={onAbout}>
                    <BookOpen size={15} />
                    <span>Read the full story</span>
                    <ChevronLeft size={14} style={{ transform: 'rotate(180deg)' }} />
                  </button>
                  <button type="button" className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-semibold text-[#dce6ff] inline-flex items-center gap-2 cursor-pointer transition-all active:scale-95" onClick={back}>
                    <ChevronLeft size={15} />
                    <span>Return to Workspace</span>
                  </button>
                </div>

                <div className="credits">
                  <div className="section-kicker">CREDITS</div>
                  <h3>Built with the help of</h3>
                  <p>
                    R3nz (developer) , Github copilot, Claude Sonnet and Haiku and Opus models, CodeX (GPT-5.6), Kimi K3, GPT-4, minimax-m3, Grok, Le chat Mistral, Gemini, and many more AIs!
                  </p>
                  <button
                    type="button"
                    onClick={onConnectDeveloper}
                    className="about-github-btn playful-pop cursor-pointer border border-indigo-500/30 hover:border-indigo-400 bg-indigo-950/30 hover:bg-indigo-900/40 text-indigo-200 mt-2 mb-2 w-full flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles size={15} className="text-indigo-400" />
                      <span>Connect with the developer</span>
                    </div>
                    <span className="text-[11px] font-mono text-indigo-300">Instagram · Discord · GitHub ↗</span>
                  </button>
                  <a href="https://github.com/aplx-renz-sudo/Docx-web-app" target="_blank" rel="noreferrer" className="about-github-btn playful-pop">
                    <ExternalLink size={15} />
                    <span>Explore & install VileDocx on GitHub</span>
                    <span className="text-xs text-[#8ea8ff]">↗</span>
                  </a>
                </div>
                <p className="fine">
                  VileDocx Desktop supports offline + online workflows. VileDocx Web runs purely in your browser and connects only to the provider credentials you configure.
                </p>
                <div
                  style={{
                    marginTop: '16px',
                    padding: '12px 18px',
                    borderRadius: '12px',
                    background: 'rgba(245, 158, 11, 0.14)',
                    border: '1.5px solid rgba(251, 191, 36, 0.85)',
                    boxShadow: '0 0 20px rgba(251, 191, 36, 0.35), inset 0 0 8px rgba(251, 191, 36, 0.12)',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: '#fef08a',
                    letterSpacing: '0.05em',
                    textShadow: '0 0 10px rgba(250, 204, 21, 0.6)',
                  }}
                >
                  VileDocx - V3 - LIMITED EDITION UPDATE (BETA) edition. Running on VileDocx Engine (code base). Status - UNRELEASED
                </div>
                <div
                  style={{
                    marginTop: '8px',
                    textAlign: 'center',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: '#86868b',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  WEBSITE FOR VILEDOCX :- CURRENT VERSION, V3 - LIMITED EDITION UPDATE (BETA)
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Privacy({ back, settings, about }: { back: () => void; settings: () => void; about: () => void }) {
  return <PrivacyNoticeView back={back} settings={settings} about={about} />;
}
