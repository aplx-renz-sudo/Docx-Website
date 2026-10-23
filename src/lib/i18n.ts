export type LanguageCode = 'en' | 'de' | 'hi' | 'zh';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
  fontBadge?: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    name: 'English (US)',
    nativeName: 'English (US)',
    flag: '🇺🇸',
    region: 'United States',
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    region: 'Deutschland',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    region: 'भारत (India)',
    fontBadge: 'Devanagari',
  },
  {
    code: 'zh',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    flag: '🇨🇳',
    region: '中国 (China)',
    fontBadge: 'CJK Fonts',
  },
];

export const TRANSLATIONS = {
  en: {
    // Brand & App
    appName: 'DOCX',
    appFullName: 'VileDocx Web',
    versionTag: 'V3 - LIMITED EDITION UPDATE (BETA)',
    versionBadge: 'V3 - LIMITED EDITION UPDATE (BETA)',
    versionNotice: 'V3 - LIMITED EDITION UPDATE (BETA)',
    systemNotice: 'SYSTEM NOTICE',
    appSubtitle: 'Universal AI Engineering Dock',
    kickerBadge: 'V3 - LIMITED EDITION UPDATE (BETA) ENGINEERING WORKSTATION',
    statusDot: 'Universal AI Dock',

    // Landing Hero
    heroHeadlinePart1: 'The Private AI Dock for ',
    heroHeadlinePart2: 'All Your Models.',
    heroSubhead:
      'Docx is a zero-telemetry, client-first developer workstation for 8+ leading AI providers. Connect Gemini, GPT-4o, Claude 3.7, Groq, Mistral, and local Ollama directly from your browser — no middleman proxies, no subscription bloat.',
    acronymNotice: 'Vile stands for — "Virtual Interface & Linking Environment", and not the actual definition',
    disclaimerBody: 'V3 - LIMITED EDITION UPDATE (BETA) version - Maximum fixes made in the SWARM mode, You can use it with caution.',

    // Navigation & Actions
    launch: 'Launch',
    launchWorkspace: 'Launch Workspace',
    configureApiKeys: 'Configure API Keys',
    interactiveGuide: 'Interactive Guide',
    about: 'About',
    privacy: 'Privacy',
    settings: 'Settings',
    languages: 'Languages',
    allSettings: 'All Settings',
    backToWorkspace: 'Back to Workspace',
    returnToWorkspace: 'Return to Workspace',
    backToLanding: 'Go to Landing Page',
    landingPageArrow: 'Landing page ->',
    newConversation: 'New conversation',
    searchChats: 'Search chats...',
    conversationsCount: 'CONVERSATIONS',
    options: 'Options',
    hideOptions: 'Hide options',
    connectDeveloper: 'Connect with developer',
    installVileDocx: 'Install VileDocx ↗',
    secureOffline: 'SECURE & OFFLINE',
    localStorage: 'Local Storage',
    preferences: 'PREFERENCES',

    // Features / Architecture Matrix
    featDirectTitle: 'Direct Model Routing',
    featDirectDesc: 'Calls provider endpoints directly from your browser with zero middleman proxies.',
    featSaverTitle: 'Token Saver (~22%)',
    featSaverDesc: 'Sliding-window context pruning that preserves ~22% of token bandwidth while keeping model recall sharp.',
    featSwarmTitle: 'Multi-Worker Swarms',
    featSwarmDesc: '6-worker architectural debate + Watchman arbiter. V3 - LIMITED EDITION UPDATE (BETA) mode available for development testing.',
    featClientTitle: 'Client-Side Isolation',
    featClientDesc: 'All conversations, custom keys, and settings remain strictly isolated in your local storage.',

    // Sidebar items
    mediaStudio: 'Media Studio (Images & Video)',
    buildMode: 'Docx-IDE',
    ideMode: 'Docx-IDE',
    enterIDE: 'Enter IDE',
    multipleWorkers: 'Multiple Workers (Alpha)',
    interactiveGuideItem: 'Interactive Guide',
    promptLibrary: 'Prompt Library',
    tokenSaverActive: 'Token Saver Active',
    themesStyling: 'Themes & Styling',
    companionPets: 'Companion Pets',
    shortcuts: 'Shortcuts',
    allSettingsItem: 'All Settings',
    privacySecurity: 'Privacy & security',
    aboutVileDocx: 'About VileDocx',

    // Chat Area
    noActiveConvTitle: 'No Active Conversation',
    noActiveConvDesc: 'You deleted all conversations. Click below to start a fresh, private discussion with your chosen AI models.',
    startAConversation: 'Start a conversation!',
    welcomeModelGreeting: "Welcome to **Docx**.\n\nI'm your private AI assistant — connect any supported provider in Settings (Gemini, ChatGPT, Groq, OpenRouter, or Ollama) and customize your space with themes, interactive pets, and smart token optimization.",
    messagePlaceholder: 'Message Docx... (Enter to send, Shift+Enter for newline)',
    offlineModelsReady: 'Offline Model Ready',
    offlineModelsReadyPlural: 'Offline Models Ready',
    guideAndHelp: 'Guide & Help',
    promptDeck: 'Prompt Ideas',
    attachFile: 'Attach context',
    voiceInput: 'Voice dictation',
    stopVoice: 'Stop dictation',
    tokenSaverBadge: 'Token Saver',
    clearChat: 'Clear conversation',
    renameChat: 'Rename conversation',
    deleteChat: 'Delete conversation',
    readAloud: 'Read aloud',
    stopReading: 'Stop reading',
    regenerate: 'Regenerate response',
    copyText: 'Copy text',
    copied: 'Copied!',
    thinking: 'Thinking...',
    tokensSaved: 'tokens saved',
    attachedFilePrefix: 'Attached:',

    // Languages Tab
    langTabTitle: 'Interface Language',
    langTabSubtitle: 'Choose your preferred language across the entire VileDocx workstation. All views, sidebar menus, and prompts will adapt instantly.',
    langActive: 'Active',
    langSwitchSuccess: 'Language updated successfully to',
    cjkFontNotice: 'CJK font rendering enabled for Chinese (PingFang SC, Microsoft YaHei, Noto Sans SC).',
    devanagariFontNotice: 'Noto Sans Devanagari font rendering enabled for Hindi typography.',

    // Settings Navigation
    secAiEngines: 'AI Engines & Efficiency',
    secLookCompanions: 'Look & Companions',
    secPlatform: 'Security & Platform',
    secLocalization: 'Localization & Language',
    tabProvider: 'AI Provider & Models',
    tabTokensaver: 'Token Saver Engine',
    tabWorkers: 'Multiple Workers (Alpha)',
    tabAppearance: 'Themes & Customizer',
    tabPets: 'Companion Pets',
    tabThinking: 'Thinking Deliberation',
    tabPersona: 'AI Persona & Creativity',
    tabLanguages: 'Languages',
    tabPrivacy: 'Data & Privacy Hub',
    tabAbout: 'About & Ecosystem',
  },

  de: {
    // Brand & App
    appName: 'DOCX',
    appFullName: 'VileDocx Web',
    versionTag: 'V3 - LIMITED EDITION UPDATE (BETA)',
    versionBadge: 'V3 - LIMITED EDITION UPDATE (BETA)',
    versionNotice: 'V3 - LIMITED EDITION UPDATE (BETA)',
    systemNotice: 'SYSTEMHINWEIS',
    appSubtitle: 'Universelles KI-Entwicklerdock',
    kickerBadge: 'V3 - LIMITED EDITION UPDATE (BETA) ENTWICKLER-WORKSTATION',
    statusDot: 'Universelles KI-Dock',

    // Landing Hero
    heroHeadlinePart1: 'Das private KI-Dock für ',
    heroHeadlinePart2: 'all Ihre Modelle.',
    heroSubhead:
      'Docx ist eine telemetriefreie, clientbasierte Entwickler-Workstation für über 8 führende KI-Anbieter. Verbinden Sie Gemini, GPT-4o, Claude 3.7, Groq, Mistral und lokales Ollama direkt aus Ihrem Browser – ohne Zwischenhändler und ohne Abo-Ballast.',
    acronymNotice: 'Vile steht für — "Virtual Interface & Linking Environment" (Virtuelle Schnittstellen- und Verknüpfungsumgebung), nicht für die wörtliche Definition.',
    disclaimerBody: 'V3 - LIMITED EDITION UPDATE (BETA) Version – Maximale Fehlerbehebungen im SWARM-Modus vorgenommen. Mit Vorsicht verwenden.',

    // Navigation & Actions
    launch: 'Starten',
    launchWorkspace: 'Arbeitsbereich starten',
    configureApiKeys: 'API-Schlüssel konfigurieren',
    interactiveGuide: 'Interaktiver Leitfaden',
    about: 'Über uns',
    privacy: 'Datenschutz',
    settings: 'Einstellungen',
    languages: 'Sprachen',
    allSettings: 'Alle Einstellungen',
    backToWorkspace: 'Zurück zum Arbeitsbereich',
    returnToWorkspace: 'Zum Arbeitsbereich zurückkehren',
    backToLanding: 'Zur Startseite',
    landingPageArrow: 'Startseite ->',
    newConversation: 'Neue Konversation',
    searchChats: 'Chats durchsuchen...',
    conversationsCount: 'KONVERSATIONEN',
    options: 'Optionen',
    hideOptions: 'Optionen ausblenden',
    connectDeveloper: 'Mit Entwickler verbinden',
    installVileDocx: 'VileDocx installieren ↗',
    secureOffline: 'SICHER & OFFLINE',
    localStorage: 'Lokaler Speicher',
    preferences: 'EINSTELLUNGEN',

    // Features / Architecture Matrix
    featDirectTitle: 'Direktes Modell-Routing',
    featDirectDesc: 'Ruft Endpunkte direkt aus Ihrem Browser ohne jegliche Proxy-Zwischenstationen auf.',
    featSaverTitle: 'Token-Sparer (~22%)',
    featSaverDesc: 'Kontext-Pruning im Schiebefenster spart ca. 22% Token-Bandbreite bei scharfer Modellpräzision.',
    featSwarmTitle: 'Multi-Worker-Swarms',
    featSwarmDesc: 'Architektonische 6-Worker-Debatte + Watchman-Schlichter. V3 - LIMITED EDITION UPDATE (BETA) Modus für Entwicklungstests.',
    featClientTitle: 'Client-Seitige Isolierung',
    featClientDesc: 'Alle Gespräche, Schlüssel und Einstellungen bleiben strikt im lokalen Browser-Speicher isoliert.',

    // Sidebar items
    mediaStudio: 'Media Studio (Bilder & Video)',
    buildMode: 'Docx-IDE',
    ideMode: 'Docx-IDE',
    enterIDE: 'IDE öffnen',
    multipleWorkers: 'Multiple Workers (Alpha)',
    interactiveGuideItem: 'Interaktiver Leitfaden',
    promptLibrary: 'Prompt-Bibliothek',
    tokenSaverActive: 'Token-Sparer Aktiv',
    themesStyling: 'Themes & Gestaltung',
    companionPets: 'Begleiter-Haustiere',
    shortcuts: 'Tastenkürzel',
    allSettingsItem: 'Alle Einstellungen',
    privacySecurity: 'Datenschutz & Sicherheit',
    aboutVileDocx: 'Über VileDocx',

    // Chat Area
    noActiveConvTitle: 'Keine aktive Konversation',
    noActiveConvDesc: 'Sie haben alle Chats gelöscht. Klicken Sie unten, um eine frische, private Diskussion mit Ihren KI-Modellen zu starten.',
    startAConversation: 'Konversation starten!',
    welcomeModelGreeting: 'Willkommen bei **Docx**.\n\nIch bin Ihr privater KI-Assistent – verbinden Sie jeden unterstützten Anbieter in den Einstellungen (Gemini, ChatGPT, Groq, OpenRouter oder Ollama) und passen Sie Ihren Bereich mit Themes und Token-Optimierung an.',
    messagePlaceholder: 'Nachricht an Docx... (Enter zum Senden, Umschalt+Enter für neue Zeile)',
    offlineModelsReady: 'Offline-Modell bereit',
    offlineModelsReadyPlural: 'Offline-Modelle bereit',
    guideAndHelp: 'Hilfe & Guide',
    promptDeck: 'Prompt-Vorschläge',
    attachFile: 'Kontext anhängen',
    voiceInput: 'Spracheingabe',
    stopVoice: 'Spracheingabe stoppen',
    tokenSaverBadge: 'Token-Sparer',
    clearChat: 'Konversation leeren',
    renameChat: 'Konversation umbenennen',
    deleteChat: 'Konversation löschen',
    readAloud: 'Vorlesen',
    stopReading: 'Vorlesen stoppen',
    regenerate: 'Antwort neu generieren',
    copyText: 'Text kopieren',
    copied: 'Kopiert!',
    thinking: 'Denkt nach...',
    tokensSaved: 'Tokens gespart',
    attachedFilePrefix: 'Angehängt:',

    // Languages Tab
    langTabTitle: 'Oberflächensprache',
    langTabSubtitle: 'Wählen Sie Ihre bevorzugte Sprache für die gesamte VileDocx-Workstation. Alle Ansichten, Menüs und Eingabefelder passen sich sofort an.',
    langActive: 'Aktiv',
    langSwitchSuccess: 'Sprache erfolgreich geändert auf',
    cjkFontNotice: 'CJK-Schriften für Chinesisch optimiert.',
    devanagariFontNotice: 'Devanagari-Schriften für Hindi optimiert.',

    // Settings Navigation
    secAiEngines: 'KI-Engines & Effizienz',
    secLookCompanions: 'Aussehen & Begleiter',
    secPlatform: 'Sicherheit & Plattform',
    secLocalization: 'Lokalisierung & Sprachen',
    tabProvider: 'KI-Anbieter & Modelle',
    tabTokensaver: 'Token-Spar-Engine',
    tabWorkers: 'Multiple Workers (Alpha)',
    tabAppearance: 'Themes & Customizer',
    tabPets: 'Begleiter-Haustiere',
    tabThinking: 'Denk-Deliberation',
    tabPersona: 'KI-Persona & Kreativität',
    tabLanguages: 'Sprachen',
    tabPrivacy: 'Daten & Datenschutz',
    tabAbout: 'Über uns & Ökosystem',
  },

  hi: {
    // Brand & App
    appName: 'DOCX',
    appFullName: 'VileDocx Web',
    versionTag: 'V3 - LIMITED EDITION UPDATE (BETA)',
    versionBadge: 'V3 - LIMITED EDITION UPDATE (BETA)',
    versionNotice: 'V3 - LIMITED EDITION UPDATE (BETA) अपडेट',
    systemNotice: 'सिस्टम सूचना',
    appSubtitle: 'सार्वभौमिक AI इंजीनियरिंग डॉक',
    kickerBadge: 'V3 - LIMITED EDITION UPDATE (BETA) इंजीनियरिंग वर्कस्टेशन',
    statusDot: 'सार्वभौमिक AI डॉक',

    // Landing Hero
    heroHeadlinePart1: 'आपके सभी मॉडलों के लिए ',
    heroHeadlinePart2: 'निजी AI डॉक।',
    heroSubhead:
      'Docx एक शून्य-टेलीमेट्री, क्लाइंट-प्रथम डेवलपर वर्कस्टेशन है जो 8+ प्रमुख AI प्रदाताओं का समर्थन करता है। अपने ब्राउज़र से सीधे Gemini, GPT-4o, Claude 3.7, Groq, Mistral और स्थानीय Ollama को कनेक्ट करें — बिना किसी प्रॉक्सी या सदस्यता भार के।',
    acronymNotice: 'Vile का अर्थ है — "Virtual Interface & Linking Environment" (वर्चुअल इंटरफेस और लिंकिंग पर्यावरण), कोई नकारात्मक शब्द नहीं।',
    disclaimerBody: 'V3 - LIMITED EDITION UPDATE (BETA) संस्करण - SWARM मोड में अधिकतम सुधार किए गए हैं, सावधानी के साथ उपयोग करें।',

    // Navigation & Actions
    launch: 'लॉन्च करें',
    launchWorkspace: 'वर्कस्पेस लॉन्च करें',
    configureApiKeys: 'API कीज़ कॉन्फ़िगर करें',
    interactiveGuide: 'इंटरैक्टिव गाइड',
    about: 'के बारे में',
    privacy: 'गोपनीयता',
    settings: 'सेटिंग्स',
    languages: 'भाषाएं (Languages)',
    allSettings: 'सभी सेटिंग्स',
    backToWorkspace: 'वर्कस्पेस पर वापस जाएं',
    returnToWorkspace: 'वर्कस्पेस पर लौटें',
    backToLanding: 'लैंडिंग पेज पर जाएं',
    landingPageArrow: 'लैंडिंग पेज ->',
    newConversation: 'नई बातचीत',
    searchChats: 'चैट खोजें...',
    conversationsCount: 'बातचीत संख्या',
    options: 'विकल्प',
    hideOptions: 'विकल्प छिपाएं',
    connectDeveloper: 'डेवलपर से संपर्क करें',
    installVileDocx: 'VileDocx इंस्टॉल करें ↗',
    secureOffline: 'सुरक्षित और ऑफ़लाइन',
    localStorage: 'लोकल स्टोरेज',
    preferences: 'प्राथमिकताएं',

    // Features / Architecture Matrix
    featDirectTitle: 'सीधा मॉडल रूटिंग',
    featDirectDesc: 'बिना किसी मध्यस्थ प्रॉक्सी के सीधे आपके ब्राउज़र से प्रदाता एंडपॉइंट्स को कॉल करता है।',
    featSaverTitle: 'टोकन सेवर (~22%)',
    featSaverDesc: 'स्लाइडिंग-विंडो संदर्भ अनुकूलन जो ~22% टोकन बैंडविड्थ बचाता है और गति तेज करता है।',
    featSwarmTitle: 'मल्टी-वर्कर स्वार्म',
    featSwarmDesc: '6-वर्कर तकनीकी विमर्श + वॉचमैन मध्यस्थता। विकास परीक्षण के लिए V3 - LIMITED EDITION UPDATE (BETA) मोड उपलब्ध।',
    featClientTitle: 'क्लाइंट-साइड सुरक्षा',
    featClientDesc: 'सभी बातचीत, कस्टम कीज़ और सेटिंग्स केवल आपके स्थानीय ब्राउज़र स्टोरेज में सुरक्षित रहती हैं।',

    // Sidebar items
    mediaStudio: 'मीडिया स्टूडियो (चित्र और वीडियो)',
    buildMode: 'Docx-IDE',
    ideMode: 'Docx-IDE',
    enterIDE: 'Enter IDE (आईडीई खोलें)',
    multipleWorkers: 'मल्टीपल वर्कर्स (अल्फा)',
    interactiveGuideItem: 'इंटरैक्टिव गाइड',
    promptLibrary: 'प्रॉम्प्ट लाइब्रेरी',
    tokenSaverActive: 'टोकन सेवर सक्रिय',
    themesStyling: 'थीम्स और स्टाइलिंग',
    companionPets: 'साथी पालतू जीव (Pets)',
    shortcuts: 'शॉर्टकट कीज़',
    allSettingsItem: 'सभी सेटिंग्स',
    privacySecurity: 'गोपनीयता और सुरक्षा',
    aboutVileDocx: 'VileDocx के बारे में',

    // Chat Area
    noActiveConvTitle: 'कोई सक्रिय बातचीत नहीं',
    noActiveConvDesc: 'आपने सभी बातचीत हटा दी हैं। अपने चुने हुए AI मॉडल्स के साथ नई, निजी बातचीत शुरू करने के लिए नीचे क्लिक करें।',
    startAConversation: 'बातचीत शुरू करें!',
    welcomeModelGreeting: 'स्वागत है **Docx** में।\n\nमैं आपका निजी AI सहायक हूँ — सेटिंग्स में किसी भी समर्थित प्रदाता (Gemini, ChatGPT, Groq, OpenRouter, या Ollama) को कनेक्ट करें और अपने स्पेस को कस्टमाइज़ करें।',
    messagePlaceholder: 'Docx को संदेश भेजें... (भेजने के लिए Enter, नई पंक्ति के लिए Shift+Enter)',
    offlineModelsReady: 'ऑफ़लाइन मॉडल तैयार है',
    offlineModelsReadyPlural: 'ऑफ़लाइन मॉडल्स तैयार हैं',
    guideAndHelp: 'गाइड और सहायता',
    promptDeck: 'प्रॉम्प्ट सुझाव',
    attachFile: 'फ़ाइल संलग्न करें',
    voiceInput: 'आवाज़ से लिखें',
    stopVoice: 'आवाज़ रिकॉर्डिंग रोकें',
    tokenSaverBadge: 'टोकन सेवर',
    clearChat: 'बातचीत साफ़ करें',
    renameChat: 'नाम बदलें',
    deleteChat: 'बातचीत हटाएं',
    readAloud: 'बोलकर सुनाएं',
    stopReading: 'पठन रोकें',
    regenerate: 'पुनः उत्पन्न करें',
    copyText: 'टेक्स्ट कॉपी करें',
    copied: 'कॉपी हो गया!',
    thinking: 'सोच रहा है...',
    tokensSaved: 'टोकन बचाए गए',
    attachedFilePrefix: 'संलग्न:',

    // Languages Tab
    langTabTitle: 'इंटरफेस भाषा',
    langTabSubtitle: 'पूरे VileDocx वर्कस्टेशन के लिए अपनी पसंदीदा भाषा चुनें। सभी दृश्य, मेनू और इनपुट तुरंत आपकी भाषा में अनुकूलित हो जाएंगे।',
    langActive: 'सक्रिय',
    langSwitchSuccess: 'सफलतापूर्वक भाषा बदल दी गई:',
    cjkFontNotice: 'चीनी भाषा के लिए CJK फ़ॉन्ट्स सक्रिय हैं।',
    devanagariFontNotice: 'हिन्दी के लिए देवनागरी फ़ॉन्ट रेंडरिंग सक्रिय है।',

    // Settings Navigation
    secAiEngines: 'AI इंजन और दक्षता',
    secLookCompanions: 'दिखावट और साथी',
    secPlatform: 'सुरक्षा और प्लेटफ़ॉर्म',
    secLocalization: 'स्थानीयकरण और भाषाएं',
    tabProvider: 'AI प्रदाता और मॉडल',
    tabTokensaver: 'टोकन सेवर इंजन',
    tabWorkers: 'मल्टीपल वर्कर्स (अल्फा)',
    tabAppearance: 'थीम्स और कस्टमाइज़र',
    tabPets: 'साथी पालतू जीव (Pets)',
    tabThinking: 'थिंकिंग और विचार-विमर्श',
    tabPersona: 'AI व्यक्तित्व और रचनात्मकता',
    tabLanguages: 'भाषाएं (Languages)',
    tabPrivacy: 'डेटा और गोपनीयता हब',
    tabAbout: 'के बारे में और इकोसिस्टम',
  },

  zh: {
    // Brand & App
    appName: 'DOCX',
    appFullName: 'VileDocx Web',
    versionTag: 'V3 - LIMITED EDITION UPDATE (BETA)',
    versionBadge: 'V3 - LIMITED EDITION UPDATE (BETA)',
    versionNotice: 'V3 - LIMITED EDITION UPDATE (BETA) 更新',
    systemNotice: '系统公告',
    appSubtitle: '通用 AI 工程工作坞',
    kickerBadge: 'V3 - LIMITED EDITION UPDATE (BETA) 工程工作站',
    statusDot: '通用 AI 扩展坞',

    // Landing Hero
    heroHeadlinePart1: '为您的所有模型打造的 ',
    heroHeadlinePart2: '私有 AI 工作坞。',
    heroSubhead:
      'Docx 是一款零遥测、客户端优先的开发者工作站，原生支持 8+ 主流 AI 提供商。直接从浏览器直连 Gemini、GPT-4o、Claude 3.7、Groq、Mistral 和本地 Ollama — 无中间代理，无订阅负担。',
    acronymNotice: 'Vile 代表 — "Virtual Interface & Linking Environment" (虚拟接口与链接环境)，而非字面贬义含义。',
    disclaimerBody: 'V3 - LIMITED EDITION UPDATE (BETA) 版本 - SWARM 蜂群模式进行了深度修复与优化，可谨慎使用。',

    // Navigation & Actions
    launch: '启动',
    launchWorkspace: '启动工作区',
    configureApiKeys: '配置 API 密钥',
    interactiveGuide: '交互式指南',
    about: '关于',
    privacy: '隐私协议',
    settings: '设置',
    languages: '语言 (Languages)',
    allSettings: '所有设置',
    backToWorkspace: '返回工作坞',
    returnToWorkspace: '返回工作空间',
    backToLanding: '返回首页',
    landingPageArrow: '产品首页 ->',
    newConversation: '新建对话',
    searchChats: '搜索聊天记录...',
    conversationsCount: '对话列表',
    options: '更多选项',
    hideOptions: '收起选项',
    connectDeveloper: '联系开发者',
    installVileDocx: '安装 VileDocx ↗',
    secureOffline: '本地安全与离线',
    localStorage: '本地存储',
    preferences: '偏好设置',

    // Features / Architecture Matrix
    featDirectTitle: '直连模型路由',
    featDirectDesc: '直接从您的浏览器请求模型服务端点，零中间代理服务器，保护隐私。',
    featSaverTitle: '令牌节省器 (~22%)',
    featSaverDesc: '智能滑动窗口修剪上下文，节省约 22% 令牌带宽，同时保持精准推理。',
    featSwarmTitle: '多工人蜂群协作',
    featSwarmDesc: '6 工人架构技术辩论 + 守望者终审裁决。V3 - LIMITED EDITION UPDATE (BETA) 模式可供开发测试。',
    featClientTitle: '客户端本地完全隔离',
    featClientDesc: '所有对话记录、私有密钥和个性化设置均安全隔离在本地浏览器中。',

    // Sidebar items
    mediaStudio: '媒体工作室 (图像与视频)',
    buildMode: 'Docx-IDE',
    ideMode: 'Docx-IDE',
    enterIDE: '进入 IDE',
    multipleWorkers: '多工人蜂群 (Alpha)',
    interactiveGuideItem: '交互式指南',
    promptLibrary: '提示词库',
    tokenSaverActive: '令牌节省器已启用',
    themesStyling: '主题与视觉风格',
    companionPets: '伴侣桌面宠物',
    shortcuts: '快捷键',
    allSettingsItem: '全局设置',
    privacySecurity: '隐私与安全合规',
    aboutVileDocx: '关于 VileDocx',

    // Chat Area
    noActiveConvTitle: '暂无进行中的对话',
    noActiveConvDesc: '您已清空所有对话。点击下方按钮，即可与选定的 AI 模型开始一段全新的私密探讨。',
    startAConversation: '发起新对话！',
    welcomeModelGreeting: '欢迎使用 **Docx**。\n\n我是您的私密 AI 助手 — 请在设置中接入支持的提供商（Gemini、ChatGPT、Groq、OpenRouter 或本地 Ollama），打造专属的主题、伙伴与令牌节约方案。',
    messagePlaceholder: '输入给 Docx 的消息... (按 Enter 发送，Shift+Enter 换行)',
    offlineModelsReady: '个本地离线模型已就绪',
    offlineModelsReadyPlural: '个本地离线模型已就绪',
    guideAndHelp: '指南与帮助',
    promptDeck: '推荐提示词',
    attachFile: '添加上下文附件',
    voiceInput: '语音听写',
    stopVoice: '停止听写',
    tokenSaverBadge: '令牌节省器',
    clearChat: '清空当前对话',
    renameChat: '重命名对话',
    deleteChat: '删除此对话',
    readAloud: '朗读回答',
    stopReading: '停止朗读',
    regenerate: '重新生成',
    copyText: '复制文本',
    copied: '已复制！',
    thinking: '正在思考...',
    tokensSaved: '个令牌已节约',
    attachedFilePrefix: '已添加附件:',

    // Languages Tab
    langTabTitle: '界面语言',
    langTabSubtitle: '为整个 VileDocx 工作站选择您偏好的语言。所有页面、侧边栏菜单和输入提示将立即同步切换，并启用优化的排版字体。',
    langActive: '当前使用',
    langSwitchSuccess: '已成功将界面语言切换为',
    cjkFontNotice: '已为简体中文启用专业 CJK 字体族渲染 (PingFang SC、Microsoft YaHei、Noto Sans SC)。',
    devanagariFontNotice: '已为印地语启用天城体 (Devanagari) 字体优化。',

    // Settings Navigation
    secAiEngines: 'AI 引擎与能效',
    secLookCompanions: '视觉风格与伙伴',
    secPlatform: '安全与生态架构',
    secLocalization: '本地化与语言',
    tabProvider: 'AI 提供商与模型',
    tabTokensaver: '令牌节省引擎',
    tabWorkers: '多工人蜂群 (Alpha)',
    tabAppearance: '主题与自定义',
    tabPets: '伴侣桌面宠物',
    tabThinking: '深度思考演练',
    tabPersona: 'AI 人设与创造力',
    tabLanguages: '语言 (Languages)',
    tabPrivacy: '数据与隐私中心',
    tabAbout: '关于与生态系统',
  },
} as const;

export function getTranslation(lang: LanguageCode = 'en') {
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}

/**
 * Generates an authoritative provider-level system directive forcing the model
 * to respond in the user's selected language across all queries.
 */
export function getProviderLanguageDirective(lang: LanguageCode = 'en'): string {
  switch (lang) {
    case 'de':
      return [
        'MANDATORY LANGUAGE DIRECTIVE: The user has selected German (Deutsch) as their active workspace language.',
        'You MUST compose and deliver ALL your responses, explanations, analysis, summaries, and conversational replies strictly in German (Deutsch).',
        'If writing code or scripts, all code comments, docstrings, and explanatory walkthroughs MUST also be in German.',
        'Do NOT default or revert to English. Answer in German even if the user typed their prompt in English, unless the user explicitly asks you to translate into or speak in another language.',
      ].join(' ');

    case 'hi':
      return [
        'MANDATORY LANGUAGE DIRECTIVE: The user has selected Hindi (हिन्दी) as their active workspace language.',
        'You MUST compose and deliver ALL your responses, explanations, analysis, summaries, and conversational replies strictly in Hindi (हिन्दी) using the standard Devanagari script (देवनागरी लिपि).',
        'If writing code or scripts, all code explanations, commentary, and descriptions MUST also be in Hindi.',
        'Do NOT default or revert to English. Answer in Hindi even if the user typed their prompt in English, unless the user explicitly asks you to translate into or speak in another language.',
      ].join(' ');

    case 'zh':
      return [
        'MANDATORY LANGUAGE DIRECTIVE: The user has selected Simplified Chinese (简体中文) as their active workspace language.',
        'You MUST compose and deliver ALL your responses, explanations, analysis, summaries, and conversational replies strictly in Simplified Chinese (简体中文).',
        'If writing code or scripts, all code comments, docstrings, and explanatory walkthroughs MUST also be in Simplified Chinese.',
        'Do NOT default or revert to English. Answer in Simplified Chinese even if the user typed their prompt in English, unless the user explicitly asks you to translate into or speak in another language.',
      ].join(' ');

    case 'en':
    default:
      return [
        'MANDATORY LANGUAGE DIRECTIVE: The user has selected English (US) as their active workspace language.',
        'Deliver all responses, explanations, analysis, and conversational replies in clear, natural English (US).',
      ].join(' ');
  }
}

export function getLanguageName(lang: LanguageCode = 'en'): string {
  switch (lang) {
    case 'de':
      return 'German (Deutsch)';
    case 'hi':
      return 'Hindi (हिन्दी)';
    case 'zh':
      return 'Simplified Chinese (简体中文)';
    case 'en':
    default:
      return 'English (US)';
  }
}

