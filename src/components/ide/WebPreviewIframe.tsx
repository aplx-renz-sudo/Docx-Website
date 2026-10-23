import React, { useEffect, useRef, useState, useMemo } from 'react';
import { RefreshCw, ExternalLink, Smartphone, Tablet, Monitor, ShieldCheck, AlertCircle } from 'lucide-react';
import type { IDEProject, ConsoleLogEntry } from './ideTypes';

interface WebPreviewIframeProps {
  project: IDEProject;
  onConsoleLog?: (entry: ConsoleLogEntry) => void;
  className?: string;
}

type ViewportSize = 'responsive' | 'mobile' | 'tablet' | 'desktop';

export const WebPreviewIframe: React.FC<WebPreviewIframeProps> = ({
  project,
  onConsoleLog,
  className = '',
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewport, setViewport] = useState<ViewportSize>('responsive');
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  // Compile project files into a sandboxed HTML bundle
  const bundledHtml = useMemo(() => {
    const htmlFile = project.files['/index.html'] || Object.values(project.files).find(f => f.name.endsWith('.html'));

    if (!htmlFile) {
      return `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#090d16;color:#94a3b8;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;"><div style="text-align:center;"><h3>No index.html found in project</h3><p style="font-size:12px;">Create an index.html file to view the live preview.</p></div></body></html>`;
    }

    let html = htmlFile.content;

    // Script to inject console capturing & error interception
    const consoleBridgeScript = `
      <script>
        (function() {
          function sendLog(type, args) {
            try {
              const str = Array.from(args).map(a => {
                if (typeof a === 'object') {
                  try { return JSON.stringify(a); } catch (e) { return String(a); }
                }
                return String(a);
              }).join(' ');
              window.parent.postMessage({ type: 'DOCX_IDE_CONSOLE', logType: type, message: str }, '*');
            } catch(e) {}
          }
          
          const origLog = console.log;
          const origWarn = console.warn;
          const origError = console.error;
          const origInfo = console.info;

          console.log = function(...args) { origLog.apply(console, args); sendLog('log', args); };
          console.warn = function(...args) { origWarn.apply(console, args); sendLog('warn', args); };
          console.error = function(...args) { origError.apply(console, args); sendLog('error', args); };
          console.info = function(...args) { origInfo.apply(console, args); sendLog('info', args); };

          window.onerror = function(msg, url, line, col, error) {
            sendLog('error', ['Runtime Error: ' + msg + ' (Line ' + line + ')']);
            window.parent.postMessage({ type: 'DOCX_IDE_RUNTIME_ERROR', message: String(msg) + ' at line ' + line }, '*');
            return false;
          };
        })();
      </script>
    `;

    // Inline local CSS files
    const cssFiles = Object.values(project.files).filter(f => f.name.endsWith('.css'));
    const cssInline = cssFiles.map(c => `<style data-filename="${c.name}">\n${c.content}\n</style>`).join('\n');

    // Inline local JS files
    const jsFiles = Object.values(project.files).filter(f => f.name.endsWith('.js') && !f.name.endsWith('.config.js'));
    const jsInline = jsFiles.map(j => `<script data-filename="${j.name}">\n${j.content}\n</script>`).join('\n');

    // Insert console bridge at head start
    if (html.includes('<head>')) {
      html = html.replace('<head>', '<head>' + consoleBridgeScript + cssInline);
    } else {
      html = consoleBridgeScript + cssInline + html;
    }

    // Insert JS at bottom of body
    if (html.includes('</body>')) {
      html = html.replace('</body>', jsInline + '</body>');
    } else {
      html = html + jsInline;
    }

    return html;
  }, [project.files, refreshKey]);

  // Listen to iframe postMessage events
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!event.data) return;
      if (event.data.type === 'DOCX_IDE_CONSOLE') {
        onConsoleLog?.({
          id: 'log_' + Date.now() + Math.random(),
          type: event.data.logType || 'log',
          message: event.data.message || '',
          timestamp: Date.now(),
          source: 'Preview',
        });
      } else if (event.data.type === 'DOCX_IDE_RUNTIME_ERROR') {
        setRuntimeError(event.data.message);
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onConsoleLog]);

  const handleOpenPopout = () => {
    const blob = new Blob([bundledHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '768px';
      case 'desktop':
        return '1024px';
      case 'responsive':
      default:
        return '100%';
    }
  };

  return (
    <div className={`flex flex-col h-full w-full bg-[#0d1117] text-slate-200 overflow-hidden ${className}`}>
      {/* Runner Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#161b22] border-b border-[#30363d] text-xs select-none flex-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Sandbox</span>
          </div>
          <span className="text-zinc-500">•</span>
          <span className="text-zinc-400 text-[11px] font-mono">Isolated Frame</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Viewport size buttons */}
          <div className="flex items-center bg-[#0d1117] rounded-lg p-0.5 border border-[#30363d] mr-2">
            <button
              onClick={() => setViewport('responsive')}
              className={`p-1 rounded text-xs transition-colors ${viewport === 'responsive' ? 'bg-[#21262d] text-white' : 'text-zinc-400 hover:text-white'}`}
              title="Responsive Viewport (100%)"
            >
              <Monitor size={12} />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`p-1 rounded text-xs transition-colors ${viewport === 'tablet' ? 'bg-[#21262d] text-white' : 'text-zinc-400 hover:text-white'}`}
              title="Tablet Viewport (768px)"
            >
              <Tablet size={12} />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-1 rounded text-xs transition-colors ${viewport === 'mobile' ? 'bg-[#21262d] text-white' : 'text-zinc-400 hover:text-white'}`}
              title="Mobile Viewport (375px)"
            >
              <Smartphone size={12} />
            </button>
          </div>

          <button
            onClick={() => {
              setRuntimeError(null);
              setRefreshKey(k => k + 1);
            }}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#21262d] transition-colors"
            title="Reload Preview"
          >
            <RefreshCw size={13} />
          </button>
          <button
            onClick={handleOpenPopout}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#21262d] transition-colors"
            title="Open Preview in New Tab"
          >
            <ExternalLink size={13} />
          </button>
        </div>
      </div>

      {/* Runtime error banner if any */}
      {runtimeError && (
        <div className="px-3 py-1.5 bg-rose-950/80 border-b border-rose-500/40 text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <AlertCircle size={13} className="text-rose-400 flex-none" />
            <span className="truncate">{runtimeError}</span>
          </div>
          <button onClick={() => setRuntimeError(null)} className="text-rose-400 hover:text-white ml-2 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Sandboxed iframe container */}
      <div className="flex-1 w-full h-full bg-[#080b11] overflow-auto flex justify-center items-stretch p-0">
        <iframe
          key={refreshKey}
          ref={iframeRef}
          srcDoc={bundledHtml}
          title="Docx-IDE Web Preview"
          sandbox="allow-scripts allow-modals allow-same-origin"
          className="h-full bg-white transition-all shadow-2xl border-x border-[#30363d]"
          style={{ width: getViewportWidth(), maxWidth: '100%' }}
        />
      </div>
    </div>
  );
};
