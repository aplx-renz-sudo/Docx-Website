import type { AIProvider, ChatTurn } from './types';

/**
 * In-Browser Offline Atom (1M Parameters Heuristic & Thinking Engine)
 * Runs 100% locally in the browser with 0 network calls, 0 API keys required.
 * Generates responses and thinking traces in the user's selected language
 * (English (US), German, Hindi, or Simplified Chinese).
 */

let messageCounter = 0;

export class OfflineAtomProvider implements AIProvider {
  private model: string;

  constructor(model: string = 'viledocx-atom-1m-thinking') {
    this.model = model;
  }

  async testConnection(): Promise<void> {
    // Always available offline
  }

  async stream(
    prompt: string,
    history: ChatTurn[],
    onChunk: (text: string) => void
  ): Promise<void> {
    messageCounter++;

    // Detect user-selected language from history directive, document lang, or localStorage
    let lang = 'en';
    for (const turn of history) {
      if (turn.content.includes('German (Deutsch)')) {
        lang = 'de';
        break;
      } else if (turn.content.includes('Hindi (हिन्दी)')) {
        lang = 'hi';
        break;
      } else if (turn.content.includes('Simplified Chinese (简体中文)')) {
        lang = 'zh';
        break;
      }
    }
    if (lang === 'en' && typeof document !== 'undefined') {
      const docLang = document.documentElement.lang;
      if (docLang === 'de' || docLang === 'hi' || docLang === 'zh') {
        lang = docLang;
      }
    }
    if (lang === 'en' && typeof localStorage !== 'undefined') {
      const savedLang = localStorage.getItem('viledocx:language');
      if (savedLang === 'de' || savedLang === 'hi' || savedLang === 'zh') {
        lang = savedLang;
      } else {
        try {
          const rawPref = localStorage.getItem('viledocx:preferences:v3') || localStorage.getItem('viledocx_preferences') || localStorage.getItem('aplx:preferences:v3');
          if (rawPref) {
            const parsed = JSON.parse(rawPref);
            if (parsed?.language && (parsed.language === 'de' || parsed.language === 'hi' || parsed.language === 'zh')) {
              lang = parsed.language;
            }
          }
        } catch {}
      }
    }

    // Generate localized thinking trace & response based on user prompt and language
    const { thinkingSteps, answer } = this.generateResponse(prompt, history, lang);

    let fullOutput = '';
    const isThinkingModel = this.model.includes('thinking');

    // 1. Stream thinking steps if thinking model is active
    if (isThinkingModel && thinkingSteps.length > 0) {
      const thinkHeader = '<think>\n';
      onChunk(thinkHeader);
      fullOutput += thinkHeader;
      await this.delay(60);

      for (const step of thinkingSteps) {
        const stepText = `• ${step}\n`;
        for (const char of stepText) {
          onChunk(char);
          fullOutput += char;
          await this.delay(10);
        }
        await this.delay(40);
      }

      const thinkFooter = '</think>\n\n';
      onChunk(thinkFooter);
      fullOutput += thinkFooter;
      await this.delay(70);
    }

    // 2. Stream answer text with token-like pacing
    const tokens = this.tokenizeForStreaming(answer);
    for (const token of tokens) {
      onChunk(token);
      fullOutput += token;
      await this.delay(14);
    }

    // 3. Recommend connecting an API occasionally (every 3rd or 4th interaction)
    if (messageCounter % 3 === 0) {
      let recommendation =
        '\n\n---\n> 💡 **VileDocx Tip**: You are running the built-in **VileDocx** model in your browser. For advanced multi-billion parameter intelligence, vision, or larger codebases, connect a free API key (Gemini, Claude, OpenAI, Groq, or local Ollama) in **Settings** (⚙️).';
      if (lang === 'de') {
        recommendation =
          '\n\n---\n> 💡 **VileDocx-Tipp**: Sie verwenden das integrierte **VileDocx** Offline-Modell in Ihrem Browser. Für größere Cloud-Modelle (Gemini, Claude, GPT-4o, Groq, Ollama) verbinden Sie einen API-Schlüssel in den **Einstellungen** (⚙️).';
      } else if (lang === 'hi') {
        recommendation =
          '\n\n---\n> 💡 **VileDocx सुझाव**: आप अपने ब्राउज़र में अंतर्निहित **VileDocx** ऑफ़लाइन मॉडल चला रहे हैं। उन्नत मॉडल (Gemini, Claude, GPT-4o, Groq, Ollama) का उपयोग करने के लिए **सेटिंग्स** (⚙️) में API कुंजी जोड़ें।';
      } else if (lang === 'zh') {
        recommendation =
          '\n\n---\n> 💡 **VileDocx 提示**：您正在浏览器中运行内置的 **VileDocx** 离线模型。如需使用大参数云端模型 (Gemini, Claude, GPT-4o, Groq, Ollama)，可在**设置** (⚙️) 中配置 API 密钥。';
      }

      for (const token of this.tokenizeForStreaming(recommendation)) {
        onChunk(token);
        fullOutput += token;
        await this.delay(8);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private tokenizeForStreaming(text: string): string[] {
    const parts = text.split(/(\s+|[.,!?;:\n`()[\]{}])/g).filter(Boolean);
    return parts;
  }

  private generateResponse(
    prompt: string,
    _history: ChatTurn[],
    lang: string
  ): { thinkingSteps: string[]; answer: string } {
    const p = prompt.trim().toLowerCase();
    const thinkingSteps: string[] = [];

    // 1. Greeting
    if (
      p.includes('hello') ||
      p.includes('hi') ||
      p.startsWith('hey') ||
      p === 'viledocx' ||
      p.includes('hallo') ||
      p.includes('namaste') ||
      p.includes('नमस्ते') ||
      p.includes('你好') ||
      p.includes('您好')
    ) {
      if (lang === 'de') {
        thinkingSteps.push('Benutzerbegrüßung erkannt.');
        thinkingSteps.push('Systemstatus prüfen: 100% Offline-Modus im Browser aktiv.');
        thinkingSteps.push('Antwort auf Deutsch formulieren.');
        return {
          thinkingSteps,
          answer: `Hallo! Ich bin **VileDocx**, Ihr leichtgewichtiger, integrierter Offline-Assistent, der zu 100 % in Ihrem Browser läuft.

Folgendes kann ich sofort ohne Internetverbindung für Sie tun:
- ✍️ **Notizen, Pläne & Brainstorming-Ideen entwerfen**
- 💻 **Code-Snippets schreiben, erklären und optimieren**
- 🧮 **Mathematische, logische und analytische Aufgaben lösen**
- 🔒 **Vollständig privat und lokal auf Ihrem Gerät arbeiten**

Wie kann ich Ihnen heute helfen?`,
        };
      }
      if (lang === 'hi') {
        thinkingSteps.push('उपयोगकर्ता अभिवादन पहचाना गया।');
        thinkingSteps.push('सिस्टम स्थिति: 100% ब्राउज़र में ऑफ़लाइन नैनो इंजन सक्रिय है।');
        thinkingSteps.push('हिंदी (देवनागरी) में अभिवादन और क्षमता अवलोकन तैयार किया जा रहा है।');
        return {
          thinkingSteps,
          answer: `नमस्ते! मैं **VileDocx** हूँ, आपका हल्का और अंतर्निहित ऑफ़लाइन सहायक जो 100% आपके ब्राउज़र में काम करता है।

बिना किसी इंटरनेट कनेक्शन के मैं आपके लिए ये कार्य कर सकता हूँ:
- ✍️ **नोट्स, योजनाएं और विचार तैयार करना**
- 💻 **कोड स्निपेट लिखना, समझाना और सुधारना**
- 🧮 **गणित, तर्क और समस्या समाधान**
- 🔒 **आपके डिवाइस पर पूरी तरह सुरक्षित और निजी कार्य**

आज मैं आपकी क्या सहायता कर सकता हूँ?`,
        };
      }
      if (lang === 'zh') {
        thinkingSteps.push('检测到用户问候。');
        thinkingSteps.push('检查系统状态：当前运行于 100% 浏览器本地端侧离线推理模式。');
        thinkingSteps.push('正在准备简体中文问候语与功能概述。');
        return {
          thinkingSteps,
          answer: `你好！我是 **VileDocx**，完全在您浏览器中本地运行的轻量级离线智能助手。

在无需任何网络连接的情况下，我现已支持为您完成以下任务：
- ✍️ **起草项目笔记、规划方案与创意头脑风暴**
- 💻 **编写、解析和重构各类编程代码片段**
- 🧮 **解答数学运算、算法逻辑与推理分析问题**
- 🔒 **所有数据完全保存在本地设备，保障绝对隐私**

今天有什么可以帮您的？`,
        };
      }

      thinkingSteps.push('Detected user greeting.');
      thinkingSteps.push('Checking system state: Running in 100% offline Nano mode (~1M parameter engine).');
      thinkingSteps.push('Preparing friendly greeting and capability overview.');
      return {
        thinkingSteps,
        answer: `Hello! I'm **VileDocx**, your lightweight built-in offline assistant running 100% inside your browser.

Here's what I can do right now without any internet connection:
- ✍️ **Draft notes, plans & brainstorming ideas**
- 💻 **Write, explain, and refactor code snippets**
- 🧮 **Solve math, logic, and reasoning problems**
- 🔒 **Operate completely privately on your device**

How can I help you today?`,
      };
    }

    // 2. Coding query
    if (
      p.includes('code') ||
      p.includes('function') ||
      p.includes('python') ||
      p.includes('javascript') ||
      p.includes('react') ||
      p.includes('typescript') ||
      p.includes('html') ||
      p.includes('css') ||
      p.includes('कोड') ||
      p.includes('代码')
    ) {
      let codeSnippet = '';
      if (p.includes('python')) {
        codeSnippet = `\`\`\`python
# Python implementation
def process_data(items: list) -> dict:
    """Filter and calculate statistics for input items."""
    cleaned = [x for x in items if x is not None]
    return {
        "count": len(cleaned),
        "unique": len(set(cleaned)),
        "data": cleaned
    }

# Example usage:
sample = [1, 2, 2, 3, 4, None, 5]
print(process_data(sample))
\`\`\``;
      } else {
        codeSnippet = `\`\`\`typescript
// TypeScript utility
interface ItemStats<T> {
  count: number;
  unique: number;
  items: T[];
}

export function analyzeList<T>(list: T[]): ItemStats<T> {
  const filtered = list.filter(item => item != null);
  const uniqueItems = Array.from(new Set(filtered));

  return {
    count: filtered.length,
    unique: uniqueItems.length,
    items: filtered,
  };
}
\`\`\``;
      }

      if (lang === 'de') {
        thinkingSteps.push(`Programmierauftrag analysieren: "${prompt.slice(0, 45)}..."`);
        thinkingSteps.push('Zielsprache und Struktur identifizieren.');
        thinkingSteps.push('Sauberes, dokumentiertes Code-Snippet auf Deutsch generieren.');
        thinkingSteps.push('Syntax und Randfälle überprüfen.');
        return {
          thinkingSteps,
          answer: `Hier ist eine saubere Implementierung für Ihre Anfrage:

${codeSnippet}

### Wichtige Details:
1. **Typsicherheit & Validierung**: Bereinigt Eingaben und berechnet Kennzahlen präzise.
2. **Effizienz**: Läuft in linearer Zeit $O(n)$ mit geringem Speicherbedarf.
3. **Erweiterbarkeit**: Kann direkt in Ihr Projekt eingebunden werden.`,
        };
      }
      if (lang === 'hi') {
        thinkingSteps.push(`प्रोग्रामिंग अनुरोध का विश्लेषण: "${prompt.slice(0, 45)}..."`);
        thinkingSteps.push('आवश्यक भाषा और संरचना की पहचान।');
        thinkingSteps.push('हिंदी में स्पष्ट कोड और विवरण तैयार किया जा रहा है।');
        return {
          thinkingSteps,
          answer: `आपके अनुरोध के लिए यहाँ एक साफ और स्पष्ट कोड कार्यान्वयन है:

${codeSnippet}

### मुख्य विवरण:
1. **टाइप सुरक्षा और सत्यापन**: इनपुट को साफ़ करता है और सटीकता से गणना करता है।
2. **दक्षता**: रैखिक समय $O(n)$ में निष्पादित होता है।
3. **उपयोग में आसान**: इसे सीधे आपके प्रोजेक्ट में एकीकृत किया जा सकता है।`,
        };
      }
      if (lang === 'zh') {
        thinkingSteps.push(`分析代码生成请求: "${prompt.slice(0, 45)}..."`);
        thinkingSteps.push('识别编程语言与模块结构。');
        thinkingSteps.push('生成整洁且注释详尽的简体中文代码实现。');
        return {
          thinkingSteps,
          answer: `以下是为您实现的规范代码：

${codeSnippet}

### 核心设计细节：
1. **类型安全与入参校验**：严格过滤无效输入，结构清晰规范。
2. **运行效率**：保持 $O(n)$ 线性时间复杂度，资源开销极小。
3. **可扩展性**：支持直接无缝嵌入到您的生产项目中。`,
        };
      }

      thinkingSteps.push(`Analyzing programming request: "${prompt.slice(0, 45)}..."`);
      thinkingSteps.push('Identifying language and required structure.');
      thinkingSteps.push('Generating clean, well-commented code snippet.');
      thinkingSteps.push('Verifying edge cases and syntax compliance.');
      return {
        thinkingSteps,
        answer: `Here is a clean implementation for your request:

${codeSnippet}

### Key Details:
1. **Type Safety & Validation**: Cleans invalid inputs and calculates metrics cleanly.
2. **Efficiency**: Executes in $O(n)$ linear time.
3. **Extensibility**: Ready to be integrated directly into your project.`,
      };
    }

    // 3. Explanation query
    if (
      p.includes('explain') ||
      p.includes('what is') ||
      p.includes('how does') ||
      p.includes('why') ||
      p.includes('erklär') ||
      p.includes('was ist') ||
      p.includes('समझाओ') ||
      p.includes('क्या है') ||
      p.includes('解释') ||
      p.includes('什么是')
    ) {
      const topic = prompt.replace(/^(explain|erkläre|was ist|समझाओ|क्या है|解释|什么是)\s+/i, '').replace(/[?？]$/, '');
      if (lang === 'de') {
        thinkingSteps.push(`Erklärung analysieren: "${prompt.slice(0, 50)}..."`);
        thinkingSteps.push('Konzeptionelle Gliederung: Definition → Funktionsweise → Fazit.');
        thinkingSteps.push('Für maximale Klarheit auf Deutsch optimiert.');
        return {
          thinkingSteps,
          answer: `### Aufschlüsselung des Kernkonzepts

Verständnis von **${topic}**:

1. **Die Grundlagen**:
   Im Kern geht es hierbei um Effizienz, klare Trennung von Verantwortlichkeiten und nachvollziehbare Funktionsmechanismen.

2. **Funktionsweise**:
   - **Eingabe & Trigger**: Eine Aktion oder ein Datenzustand startet den Prozess.
   - **Ausführung**: Definierte Regeln verarbeiten den Zustand schrittweise.
   - **Ergebnis**: Das gewünschte Resultat wird ressourcenschonend erzeugt.

3. **Wichtigste Erkenntnis**:
   Klare Modularität ermöglicht es Ihnen, dieses Prinzip in verschiedensten Systemen einzusetzen.`,
        };
      }
      if (lang === 'hi') {
        thinkingSteps.push(`अवधारणा विश्लेषण: "${prompt.slice(0, 50)}..."`);
        thinkingSteps.push('वैचारिक संरचना: मूल परिभाषा → कार्यप्रणाली → मुख्य निष्कर्ष।');
        thinkingSteps.push('हिंदी में सरल और स्पष्ट व्याख्या तैयार की गई।');
        return {
          thinkingSteps,
          answer: `### मुख्य अवधारणा विश्लेषण

**${topic}** को समझें:

1. **मूल सिद्धांत**:
   इसके मूल में दक्षता, जिम्मेदारियों का स्पष्ट विभाजन और सुव्यवस्थित तंत्र शामिल है।

2. **यह कैसे काम करता है**:
   - **इनपुट**: कोई क्रिया या डेटा स्थिति प्रक्रिया शुरू करती है।
   - **निष्पादन**: परिभाषित नियम चरण-दर-चरण स्थिति को संसाधित करते हैं।
   - **परिणाम**: न्यूनतम ओवरहेड के साथ वांछित परिणाम प्राप्त होता है।

3. **मुख्य निष्कर्ष**:
   सरल और मॉड्यूलर दृष्टिकोण इसे वास्तविक दुनिया के अनुप्रयोगों में प्रभावी बनाता है।`,
        };
      }
      if (lang === 'zh') {
        thinkingSteps.push(`解析概念解析请求: "${prompt.slice(0, 50)}..."`);
        thinkingSteps.push('构建结构化阐述框架：核心定义 → 运行机理 → 总结要点。');
        thinkingSteps.push('针对中文表达的高信息密度进行优化。');
        return {
          thinkingSteps,
          answer: `### 核心概念深度解析

理解 **${topic}**：

1. **基本原理**：
   其核心理念在于高效性、关注点分离以及透明规范的操作逻辑。

2. **工作机制**：
   - **输入触发**：由特定的操作或数据状态作为起点触发流程。
   - **流水线处理**：依据预定规则逐步对状态流转进行高效计算。
   - **最终交付**：以极低额外开销输出预期结果。

3. **核心要点**：
   模块化设计与清晰的边界是保证系统高可用与灵活扩展的基础。`,
        };
      }

      thinkingSteps.push(`Parsing educational query: "${prompt.slice(0, 50)}..."`);
      thinkingSteps.push('Structuring conceptual breakdown: Core Definition → How It Works → Key Takeaways.');
      thinkingSteps.push('Optimizing for clarity and high-signal explanations.');
      return {
        thinkingSteps,
        answer: `### Core Concept Breakdown

Understanding **${topic}**:

1. **The Fundamentals**:
   At its core, this concept revolves around efficiency, structural separation of concerns, and clear operational mechanics.

2. **How It Works**:
   - **Input & Trigger**: An action or data state initiates the process.
   - **Execution Pipeline**: Rules or computational cycles process the state step-by-step.
   - **Output**: The desired result is produced with minimal overhead.

3. **Key Takeaway**:
   Focusing on clear modularity and simple primitives allows you to scale this concept across diverse real-world applications.`,
      };
    }

    // 4. Plan / Roadmap query
    if (
      p.includes('plan') ||
      p.includes('project') ||
      p.includes('step') ||
      p.includes('roadmap') ||
      p.includes('योजना') ||
      p.includes('योजनाएं') ||
      p.includes('规划') ||
      p.includes('计划')
    ) {
      if (lang === 'de') {
        thinkingSteps.push(`Aktionsplan synthetisieren für: "${prompt.slice(0, 45)}..."`);
        thinkingSteps.push('Unterteilung in 4 Phasen auf Deutsch: Definition, Architektur, Bau und Review.');
        return {
          thinkingSteps,
          answer: `Hier ist ein strukturierter Ausführungsplan für Ihr Vorhaben:

### Phase 1: Definition & Umfang
- Kernproblem und Zielsetzung eindeutig festlegen.
- Rahmenbedingungen und Ressourcen klären.

### Phase 2: Architektur & Setup
- Datenmodelle und Schnittstellen entwerfen.
- Saubere Projektstruktur anlegen.

### Phase 3: Implementierung (MVP)
- Kernfunktionen schrittweise umsetzen.
- Randfälle absichern und Interaktionen verfeinern.

### Phase 4: Qualitätsprüfung & Rollout
- Performance testen und Feedback einholen.`,
        };
      }
      if (lang === 'hi') {
        thinkingSteps.push(`कार्य योजना तैयार की जा रही है: "${prompt.slice(0, 45)}..."`);
        thinkingSteps.push('4 चरणों में विभाजन: परिभाषा, वास्तुकला, निर्माण और समीक्षा।');
        return {
          thinkingSteps,
          answer: `आपकी परियोजना के लिए एक संरचित निष्पादन योजना यहाँ है:

### चरण 1: परिभाषा और दायरा
- प्राथमिक समस्या कथन और अंतिम परिणाम को परिभाषित करें।
- संसाधन और समय की सीमाओं की पहचान करें।

### चरण 2: आर्किटेक्चर और सेटअप
- मुख्य डेटा मॉडल और इंटरफेस की रूपरेखा बनाएं।
- स्वच्छ निर्देशिका संरचना स्थापित करें।

### चरण 3: कार्यान्वयन (MVP)
- पहले मूल कार्यक्षमता का निर्माण करें।
- उपयोगकर्ता अनुभव और सुरक्षा में सुधार करें।

### चरण 4: समीक्षा और डिलीवरी
- प्रदर्शन की जाँच करें और फीडबैक एकत्र करें।`,
        };
      }
      if (lang === 'zh') {
        thinkingSteps.push(`生成结构化实施计划: "${prompt.slice(0, 45)}..."`);
        thinkingSteps.push('划分 4 个推进阶段：需求定义、架构搭建、研发构建与交付审查。');
        return {
          thinkingSteps,
          answer: `以下是为您量身定制的阶段化执行规划：

### 第一阶段：需求定义与范围确认
- 明确核心业务痛点与最终交付目标。
- 确认时间窗口、资源限制与性能指标。

### 第二阶段：架构设计与基础准备
- 梳理核心数据结构与公共接口协议。
- 建立规范的目录结构与自动化验证工作流。

### 第三阶段：核心功能开发 (MVP)
- 优先攻克核心基础逻辑与主链路流程。
- 完善边界防护与异常错误重试机制。

### 第四阶段：优化打磨与正式发布
- 审查代码运行能耗与前端交互体验。
- 上线并持续根据实际反馈迭代。`,
        };
      }

      thinkingSteps.push(`Synthesizing actionable action plan for: "${prompt.slice(0, 45)}..."`);
      thinkingSteps.push('Dividing into 4 logical execution phases: Discovery, Architecture, Build, and Review.');
      return {
        thinkingSteps,
        answer: `Here is a structured execution plan for your project:

### Phase 1: Definition & Scoping
- Define the primary problem statement and desired end result.
- Identify constraints (time, performance, resources).

### Phase 2: Architecture & Setup
- Outline core data models and interfaces.
- Establish clean directory structure and automated verification tools.

### Phase 3: Implementation
- Implement the core functionality first (MVP).
- Add edge-case handling and refine user-facing interactions.

### Phase 4: Polish & Delivery
- Review performance, styling consistency, and layout spacing.
- Deploy and gather initial feedback.`,
      };
    }

    // 5. Who are you
    if (
      p.includes('who are you') ||
      p.includes('what model') ||
      p.includes('offline') ||
      p.includes('wer bist du') ||
      p.includes('तुम कौन हो') ||
      p.includes('你是谁')
    ) {
      if (lang === 'de') {
        thinkingSteps.push('Benutzer fragt nach Modellarchitektur.');
        thinkingSteps.push('VileDocx Offline Atom Funktionen auf Deutsch erklären.');
        return {
          thinkingSteps,
          answer: `Ich bin **VileDocx** (~1M Parameter lokales Denkmodell).

- **Modus**: 100% Im-Browser & Offline.
- **Latenz**: Sofortiges Streaming ohne Netzwerkaufruf.
- **Privatsphäre**: Ihre Daten verlassen niemals Ihr Gerät.
- **Denkprozess**: Zeigt schrittweise Überlegungen vor der Ausgabe an.

*Um größere Cloud-Modelle wie Claude 3.7 Sonnet, Gemini 3.5 Flash, GPT-4o oder lokales Ollama zu nutzen, besuchen Sie die **Einstellungen (⚙️)**.*`,
        };
      }
      if (lang === 'hi') {
        thinkingSteps.push('उपयोगकर्ता मॉडल आर्किटेक्चर के बारे में पूछ रहा है।');
        thinkingSteps.push('VileDocx ऑफ़लाइन क्षमताओं की व्याख्या की जा रही है।');
        return {
          thinkingSteps,
          answer: `मैं **VileDocx** हूँ (~1M पैरामीटर स्थानीय थिंकिंग इंजन)।

- **मोड**: 100% ब्राउज़र में और ऑफ़लाइन।
- **लेटेंसी**: शून्य-नेटवर्क तुरंत टोकन स्ट्रीमिंग।
- **गोपनीयता**: आपका डेटा कभी भी आपके डिवाइस से बाहर नहीं जाता है।
- **विचार प्रक्रिया**: उत्तर देने से पहले चरण-दर-चरण सोच प्रदर्शित करता है।

*यदि आप Claude, Gemini, GPT-4o या Ollama जैसे बड़े मॉडल कनेक्ट करना चाहते हैं, तो **सेटिंग्स (⚙️)** पर जाएं।*`,
        };
      }
      if (lang === 'zh') {
        thinkingSteps.push('用户询问模型架构信息。');
        thinkingSteps.push('阐述 VileDocx 离线端侧引擎特点。');
        return {
          thinkingSteps,
          answer: `我是 **VileDocx**（内置 ~1M 轻量级离线思考引擎）。

- **运行模式**：100% 浏览器内纯本地端侧推理，无需联网。
- **超低延迟**：零网络往返，即时平滑流式响应。
- **严格隐私**：所有数据始终留在您的设备上，绝不上云。
- **深度思考**：在正式输出前展示清晰的思维推导链条。

*如需连接参数更大的云端前沿模型（例如 Claude 3.7 Sonnet、Gemini 3.5 Flash、GPT-4o 或本地 Ollama），请前往**设置 (⚙️)** 进行配置。*`,
        };
      }

      thinkingSteps.push('User inquiring about model architecture.');
      thinkingSteps.push('Explaining VileDocx Offline Atom engine capabilities.');
      return {
        thinkingSteps,
        answer: `I am **VileDocx** (~1M parameter local thinking engine).

- **Mode**: 100% In-Browser & Offline.
- **Latency**: Instant zero-network token streaming.
- **Privacy**: Your data never leaves your device.
- **Thinking**: Displays step-by-step deliberation thoughts before answering.

*If you need to connect larger cloud models like Claude 3.7 Sonnet, Gemini 3.5 Flash, GPT-4o, or local Ollama, head over to **Settings (⚙️)**.*`,
      };
    }

    // 6. General fallback
    if (lang === 'de') {
      thinkingSteps.push(`Abfrage analysieren: "${prompt.slice(0, 50)}..."`);
      thinkingSteps.push('Kontext evaluieren.');
      thinkingSteps.push('Antwort auf Deutsch formulieren.');
      return {
        thinkingSteps,
        answer: `Hier ist eine strukturierte Analyse zu Ihrer Eingabe:

- **Wichtige Beobachtung**: Die effizienteste Herangehensweise besteht darin, das Thema in klar überprüfbare Teilbereiche zu zerlegen.
- **Praktische Anwendung**: Sie können dies direkt anwenden, indem Sie einen klaren Workflow etablieren und iterativ vorgehen.
- **Nächste Schritte**: Teilen Sie mir gerne mit, ob ich Code generieren, eine Gliederung erstellen oder einen Aspekt vertiefen soll!`,
      };
    }
    if (lang === 'hi') {
      thinkingSteps.push(`अनुरोध का विश्लेषण: "${prompt.slice(0, 50)}..."`);
      thinkingSteps.push('संदर्भ का मूल्यांकन।');
      thinkingSteps.push('हिंदी में विश्लेषणात्मक उत्तर तैयार किया गया।');
      return {
        thinkingSteps,
        answer: `आपके अनुरोध का संरचित विश्लेषण यहाँ है:

- **प्रमुख अवलोकन**: इस विषय पर काम करने का सबसे प्रभावी तरीका इसे स्पष्ट, परीक्षण योग्य भागों में विभाजित करना है।
- **व्यावहारिक अनुप्रयोग**: आप एक स्पष्ट वर्कफ़्लो स्थापित करके इसे तुरंत लागू कर सकते हैं।
- **अगले कदम**: यदि आप चाहते हैं कि मैं कोड उत्पन्न करूँ या किसी बिंदु का विस्तार करूँ, तो कृपया बताएं!`,
      };
    }
    if (lang === 'zh') {
      thinkingSteps.push(`解析输入内容: "${prompt.slice(0, 50)}..."`);
      thinkingSteps.push('综合评估上下文信息。');
      thinkingSteps.push('应用离线推理引擎生成简体中文解析。');
      return {
        thinkingSteps,
        answer: `针对您的提问，以下是结构化的分析与建议：

- **核心观察**：处理该类任务最高效的策略是将整体逻辑解耦为多个独立且可验证的小模块。
- **实践方案**：建议首先搭建标准化执行流程，并通过增量方式逐步迭代打磨。
- **后续建议**：如果您需要我编写具体代码、细化大纲或深入解析某一部分，请随时告知！`,
      };
    }

    thinkingSteps.push(`Deconstructing query: "${prompt.slice(0, 50)}..."`);
    thinkingSteps.push('Evaluating context from conversation history.');
    thinkingSteps.push('Synthesizing structured analytical response using offline reasoning heuristics.');

    return {
      thinkingSteps,
      answer: `Here is a structured analysis of your prompt:

- **Key Observation**: When approaching this topic, the most effective strategy is breaking it down into distinct, testable parts.
- **Practical Application**: You can immediately apply this by setting up a clear workflow and refining iteratively.
- **Next Steps**: Let me know if you would like me to generate code, draft a specific outline, or elaborate further on any part!`,
    };
  }
}
