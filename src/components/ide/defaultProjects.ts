import type { IDEProject, IDEFile } from './ideTypes';

export function createStarterWebProject(): IDEProject {
  const now = Date.now();
  const files: Record<string, IDEFile> = {
    '/index.html': {
      id: 'file_html_1',
      name: 'index.html',
      path: '/index.html',
      language: 'html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Docx-IDE Live Web App</title>
  <link rel="stylesheet" href="style.css">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col items-center justify-center p-6 selection:bg-pink-500 selection:text-white">
  <div class="max-w-xl w-full p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md text-center">
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-mono mb-4">
      <span class="w-2 h-2 rounded-full bg-pink-500 animate-ping"></span>
      Docx-IDE Live Preview Active
    </div>

    <h1 class="text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-pink-400 via-rose-300 to-amber-300 bg-clip-text text-transparent">
      Welcome to Docx-IDE
    </h1>
    <p class="text-slate-400 text-sm mb-6 leading-relaxed">
      A lightweight, native development environment built directly into the VileDocx ecosystem with Copilot AI assistance.
    </p>

    <!-- Interactive Counter Demo -->
    <div class="p-6 rounded-xl bg-slate-950/70 border border-slate-800 mb-6 flex flex-col items-center gap-3">
      <span class="text-xs font-mono text-slate-400 uppercase tracking-wider">Interactive Reactive State</span>
      <div id="counter-val" class="text-5xl font-mono font-bold text-pink-400">0</div>
      <div class="flex gap-2">
        <button id="btn-dec" class="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold transition-all cursor-pointer">-</button>
        <button id="btn-reset" class="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-all cursor-pointer">Reset</button>
        <button id="btn-inc" class="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-amber-500 hover:opacity-90 text-white text-sm font-bold shadow-md shadow-pink-500/20 transition-all cursor-pointer">+</button>
      </div>
    </div>

    <!-- Live Console Logger -->
    <div class="text-left text-xs font-mono text-slate-500 p-3 rounded-lg bg-slate-950 border border-slate-800/80">
      <span class="text-slate-400">// Inspect real-time console messages in bottom terminal:</span>
      <p id="log-status" class="text-emerald-400 mt-1">Ready for input.</p>
    </div>
  </div>

  <script src="script.js"></script>
</body>
</html>
`,
      isDirty: false,
      updatedAt: now,
    },
    '/style.css': {
      id: 'file_css_1',
      name: 'style.css',
      path: '/style.css',
      language: 'css',
      content: `/* Custom styling for Docx-IDE Web App */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  margin: 0;
  padding: 0;
}

@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 15px rgba(236, 72, 153, 0.2);
  }
  50% {
    box-shadow: 0 0 25px rgba(236, 72, 153, 0.4);
  }
}

.glow-card {
  animation: pulseGlow 4s infinite ease-in-out;
}
`,
      isDirty: false,
      updatedAt: now,
    },
    '/script.js': {
      id: 'file_js_1',
      name: 'script.js',
      path: '/script.js',
      language: 'javascript',
      content: `// Interactive JavaScript logic
let count = 0;
const counterEl = document.getElementById('counter-val');
const logEl = document.getElementById('log-status');

function updateDisplay() {
  if (counterEl) {
    counterEl.textContent = count;
  }
}

document.getElementById('btn-inc')?.addEventListener('click', () => {
  count++;
  updateDisplay();
  const msg = \`[Docx-IDE] Counter incremented to: \${count}\`;
  console.log(msg);
  if (logEl) logEl.textContent = msg;
});

document.getElementById('btn-dec')?.addEventListener('click', () => {
  count--;
  updateDisplay();
  const msg = \`[Docx-IDE] Counter decremented to: \${count}\`;
  console.log(msg);
  if (logEl) logEl.textContent = msg;
});

document.getElementById('btn-reset')?.addEventListener('click', () => {
  count = 0;
  updateDisplay();
  const msg = '[Docx-IDE] Counter reset to 0';
  console.info(msg);
  if (logEl) logEl.textContent = msg;
});

console.log('Docx-IDE Web Application initialized successfully! 🚀');
`,
      isDirty: false,
      updatedAt: now,
    },
    '/README.md': {
      id: 'file_md_1',
      name: 'README.md',
      path: '/README.md',
      language: 'markdown',
      content: `# Docx-IDE Starter Project

Welcome to **Docx-IDE**, the browser-based development environment integrated directly into the VileDocx ecosystem.

## Features
- **Monaco Editor**: Full desktop-grade code editor with tabs, line numbers, syntax highlighting, and keyboard shortcuts.
- **Copilot Assistant**: Powered by your active VileDocx model and credentials to explain, generate, and refactor code.
- **Live Web Preview**: Instant sandboxed runner with console log capture.
- **Project Export**: Download your entire project as a ZIP archive at any time.
- **Source Control**: Local Git-style change tracking, staging, and commit history.
- **Trench Bridge**: Easily pass project context to Trench tasks.

## Keyboard Shortcuts
- \`Ctrl+S\` / \`Cmd+S\`: Save file
- \`Ctrl+P\` / \`Cmd+P\`: Quick open file
- \`Ctrl+Shift+P\` / \`Cmd+Shift+P\`: Command Palette
`,
      isDirty: false,
      updatedAt: now,
    },
  };

  return {
    id: 'proj_default_web',
    name: 'Web Starter App',
    description: 'HTML5, Tailwind CSS & JavaScript interactive starter with live preview',
    template: 'web',
    files,
    activeFilePath: '/index.html',
    openTabs: ['/index.html', '/script.js', '/style.css', '/README.md'],
    createdAt: now,
    updatedAt: now,
  };
}

export function createStarterPythonProject(): IDEProject {
  const now = Date.now();
  const files: Record<string, IDEFile> = {
    '/main.py': {
      id: 'file_py_1',
      name: 'main.py',
      path: '/main.py',
      language: 'python',
      content: `"""
Docx-IDE Python Algorithm Sandbox
"""
from algorithms import fibonacci, quicksort

def main():
    print("=== Docx-IDE Python Sandbox ===")
    
    # Test Fibonacci
    n = 10
    fib_series = [fibonacci(i) for i in range(n)]
    print(f"First {n} Fibonacci numbers: {fib_series}")
    
    # Test Quicksort
    unsorted = [64, 34, 25, 12, 22, 11, 90, 42]
    sorted_arr = quicksort(unsorted)
    print(f"Unsorted: {unsorted}")
    print(f"Sorted:   {sorted_arr}")

if __name__ == "__main__":
    main()
`,
      isDirty: false,
      updatedAt: now,
    },
    '/algorithms.py': {
      id: 'file_py_2',
      name: 'algorithms.py',
      path: '/algorithms.py',
      language: 'python',
      content: `def fibonacci(n: int) -> int:
    """Return the n-th Fibonacci number."""
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

def quicksort(arr: list) -> list:
    """Classic quicksort implementation."""
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)
`,
      isDirty: false,
      updatedAt: now,
    },
    '/README.md': {
      id: 'file_py_md',
      name: 'README.md',
      path: '/README.md',
      language: 'markdown',
      content: `# Python Sandbox
Use **Docx-IDE Copilot** to analyze, optimize, or generate algorithms.
Ask Copilot to explain or add unit tests for the functions in \`algorithms.py\`.
`,
      isDirty: false,
      updatedAt: now,
    },
  };

  return {
    id: 'proj_python_sandbox',
    name: 'Python Algorithm Lab',
    description: 'Python algorithms with clean type signatures and Copilot assistance',
    template: 'python',
    files,
    activeFilePath: '/main.py',
    openTabs: ['/main.py', '/algorithms.py', '/README.md'],
    createdAt: now,
    updatedAt: now,
  };
}
