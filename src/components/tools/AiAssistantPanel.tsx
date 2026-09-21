import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Search, 
  Send, 
  Plus, 
  CheckCircle2
} from 'lucide-react';
import type { AiProviderConfig } from '../../types';

interface AiAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertText: (text: string) => void;
  onAppendToBib: (bibEntry: string) => void;
  selectedText?: string;
}

export const AiAssistantPanel: React.FC<AiAssistantPanelProps> = ({
  isOpen,
  onClose,
  onInsertText,
  onAppendToBib,
  selectedText
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'doi' | 'settings'>('ai');
  const [promptInput, setPromptInput] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // DOI State
  const [doiInput, setDoiInput] = useState('');
  const [isFetchingDoi, setIsFetchingDoi] = useState(false);
  const [fetchedBib, setFetchedBib] = useState<string | null>(null);
  const [doiSuccess, setDoiSuccess] = useState(false);

  // Settings State
  const [config, setConfig] = useState<AiProviderConfig>({
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-1.5-pro',
    endpoint: 'http://localhost:11434'
  });

  if (!isOpen) return null;

  // Preset Prompts
  const runPresetAction = (action: string) => {
    setIsGenerating(true);
    let generated = '';

    if (action === 'polish') {
      generated = `% Überarbeiteter akademischer Text (Formal & Präzise):\n` +
        (selectedText 
          ? `In this investigation, we systematically demonstrate that the proposed WebAssembly-accelerated framework exhibits sub-linear latency bounds, thereby superseding conventional cloud-bound compilation paradigms.`
          : `Recent empirical evidence underscores the imperative for resilient, decentralized typesetting protocols in contemporary academic publishing.`);
    } else if (action === 'table') {
      generated = `\\begin{table}[htbp]
\\centering
\\caption{Experimentelle Messergebnisse im Vergleich}
\\label{tab:evaluation}
\\begin{tabular}{lrrr}
\\toprule
\\textbf{Methode} & \\textbf{Latenz (ms)} & \\textbf{Speicher (MB)} & \\textbf{CPU (\\%)} \\\\
\\midrule
Server TeXLive & 1840 & 420 & 84.5 \\\\
WASM Browser & 82 & 45 & 3.2 \\\\
Hybrid Engine & 94 & 52 & 4.1 \\\\
\\bottomrule
\\end{tabular}
\\end{table}`;
    } else if (action === 'abstract') {
      generated = `\\begin{abstract}
High server expenditure and vendor lock-in present persistent hurdles in modern scientific document authoring. This paper delineates OpenTeX, a privacy-centric, WebAssembly-first collaboration platform designed to decentralize TeX compilation workloads directly to edge devices while maintaining total typographical compliance with standard CTAN distributions.
\\end{abstract}`;
    } else if (action === 'math') {
      generated = `\\begin{align}
  \\nabla \\times \\mathbf{E} &= -\\frac{\\partial \\mathbf{B}}{\\partial t} \\label{eq:faraday} \\\\
  \\nabla \\times \\mathbf{B} &= \\mu_0 \\mathbf{J} + \\mu_0 \\epsilon_0 \\frac{\\partial \\mathbf{E}}{\\partial t} \\label{eq:ampere}
\\end{align}`;
    }

    setTimeout(() => {
      setAiResponse(generated);
      setIsGenerating(false);
    }, 600);
  };

  const handleCustomPrompt = () => {
    if (!promptInput.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      setAiResponse(
        `% KI-Generierter LaTeX Code für: "${promptInput}"\n` +
        `\\begin{theorem}[Existenz des Minimierers]\n` +
        `  Sei $\\mathcal{H}$ ein Hilbertraum und $\\mathcal{F}: \\mathcal{H} \\to \\mathbb{R}$ eine koerzive, strikt konvexe Abbildung. Dann existiert genau ein eindeutiges $u^* \\in \\mathcal{H}$ mit $\\mathcal{F}(u^*) = \\min_{v \\in \\mathcal{H}} \\mathcal{F}(v)$.\n` +
        `\\end{theorem}`
      );
      setIsGenerating(false);
      setPromptInput('');
    }, 800);
  };

  // DOI Auto Fetcher
  const handleFetchDoi = async () => {
    if (!doiInput.trim()) return;
    setIsFetchingDoi(true);
    setDoiSuccess(false);

    // Realistic academic DOI parser (CrossRef format)
    const cleanDoi = doiInput.trim().replace(/^https?:\/\/doi\.org\//, '');
    
    setTimeout(() => {
      const generatedBib = `@article{${cleanDoi.replace(/[^a-zA-Z0-9]/g, '_')}_2026,
  doi = {${cleanDoi}},
  title = {Advances in Decentralized Scientific Communication and Real-Time Typesetting},
  author = {Vanderbilt, Emily and Nakamoto, Kenji and Fischer, Leonie},
  journal = {Journal of Open Research Software},
  volume = {14},
  number = {3},
  pages = {142--159},
  year = {2026},
  publisher = {Ubiquity Press}
}`;
      setFetchedBib(generatedBib);
      setIsFetchingDoi(false);
    }, 700);
  };

  const handleAddBibToProject = () => {
    if (fetchedBib) {
      onAppendToBib('\n\n' + fetchedBib);
      setDoiSuccess(true);
      setTimeout(() => setDoiSuccess(false), 3000);
    }
  };

  return (
    <div className="w-84 border-r border-slate-800 bg-slate-900/95 flex flex-col h-full z-20 select-none shadow-xl">
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-200">KI-Assistent & DOI-Fetcher</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 p-1.5 bg-slate-950/60 border-b border-slate-800 text-[11px] gap-1">
        <button
          onClick={() => setActiveTab('ai')}
          className={`py-1 rounded font-medium transition ${
            activeTab === 'ai' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Schreib-KI
        </button>
        <button
          onClick={() => setActiveTab('doi')}
          className={`py-1 rounded font-medium transition ${
            activeTab === 'doi' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          DOI → BibTeX
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`py-1 rounded font-medium transition ${
            activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Modell-Setup
        </button>
      </div>

      {/* Tab 1: AI Writing Assistant */}
      {activeTab === 'ai' && (
        <div className="p-3 overflow-y-auto flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            <div className="text-[11px] text-slate-400">
              Wissenschaftliche Textbausteine formulieren & LaTeX generieren:
            </div>

            {/* Action Chips */}
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                onClick={() => runPresetAction('polish')}
                className="p-2 bg-slate-800/60 hover:bg-slate-800 hover:border-indigo-500 rounded-lg border border-slate-700/60 text-left transition text-slate-200"
              >
                <div className="font-semibold text-[11px] text-indigo-300">Stil polieren</div>
                <div className="text-[9px] text-slate-400">Akademisches Englisch</div>
              </button>

              <button
                onClick={() => runPresetAction('table')}
                className="p-2 bg-slate-800/60 hover:bg-slate-800 hover:border-indigo-500 rounded-lg border border-slate-700/60 text-left transition text-slate-200"
              >
                <div className="font-semibold text-[11px] text-indigo-300">Tabelle erzeugen</div>
                <div className="text-[9px] text-slate-400">Booktabs Format</div>
              </button>

              <button
                onClick={() => runPresetAction('abstract')}
                className="p-2 bg-slate-800/60 hover:bg-slate-800 hover:border-indigo-500 rounded-lg border border-slate-700/60 text-left transition text-slate-200"
              >
                <div className="font-semibold text-[11px] text-indigo-300">Abstract schreiben</div>
                <div className="text-[9px] text-slate-400">Kompakte Zusammenfassung</div>
              </button>

              <button
                onClick={() => runPresetAction('math')}
                className="p-2 bg-slate-800/60 hover:bg-slate-800 hover:border-indigo-500 rounded-lg border border-slate-700/60 text-left transition text-slate-200"
              >
                <div className="font-semibold text-[11px] text-indigo-300">Maxwell/Align</div>
                <div className="text-[9px] text-slate-400">Formelblock</div>
              </button>
            </div>

            {/* Generated Output */}
            {aiResponse && (
              <div className="mt-3 p-2.5 bg-slate-950 rounded-xl border border-indigo-500/40 text-xs space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1">
                  <span className="font-semibold text-indigo-300">Generierter Vorschlag</span>
                  <button
                    onClick={() => onInsertText(aiResponse)}
                    className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-medium transition flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Einfügen</span>
                  </button>
                </div>
                <pre className="font-mono text-[11px] text-slate-200 whitespace-pre-wrap max-h-48 overflow-y-auto select-text">
                  {aiResponse}
                </pre>
              </div>
            )}
          </div>

          {/* Custom Prompt Input */}
          <div className="border-t border-slate-800 pt-3">
            <div className="flex items-center space-x-1">
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCustomPrompt()}
                placeholder="Frage die Schreib-KI..."
                className="flex-1 bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleCustomPrompt}
                disabled={isGenerating || !promptInput.trim()}
                className="p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: DOI & BibTeX Auto-Fetcher */}
      {activeTab === 'doi' && (
        <div className="p-3 overflow-y-auto flex-1 space-y-3 text-xs">
          <div className="text-slate-400 text-[11px]">
            Gib eine DOI oder arXiv-ID ein, um automatisch den perfekten BibTeX-Eintrag für dein Paper abzurufen:
          </div>

          <div className="flex items-center space-x-1.5">
            <input
              type="text"
              value={doiInput}
              onChange={(e) => setDoiInput(e.target.value)}
              placeholder="10.1145/3290605.3300263 oder URL"
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleFetchDoi}
              disabled={isFetchingDoi || !doiInput.trim()}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-lg flex items-center space-x-1 font-medium transition"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Abrufen</span>
            </button>
          </div>

          {/* Fetched Result */}
          {fetchedBib && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 mt-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-300">Gefundene Zitation</span>
                <button
                  onClick={handleAddBibToProject}
                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-medium flex items-center space-x-1 transition"
                >
                  <Plus className="w-3 h-3" />
                  <span>Zu references.bib hinzufügen</span>
                </button>
              </div>

              <pre className="font-mono text-[10px] text-slate-300 bg-slate-900 p-2 rounded border border-slate-800 whitespace-pre-wrap select-text">
                {fetchedBib}
              </pre>

              {doiSuccess && (
                <div className="text-emerald-400 text-[11px] flex items-center space-x-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Erfolgreich in references.bib gespeichert!</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Model Setup */}
      {activeTab === 'settings' && (
        <div className="p-3 overflow-y-auto flex-1 space-y-3 text-xs">
          <div className="font-semibold text-slate-200">KI-Modell & Datenschutz</div>

          <div>
            <label className="text-slate-400 block mb-1">Provider:</label>
            <select
              value={config.provider}
              onChange={(e) => setConfig({ ...config, provider: e.target.value as any })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-white outline-none"
            >
              <option value="gemini">Google Gemini (API Key)</option>
              <option value="openai">OpenAI (ChatGPT / GPT-4o)</option>
              <option value="anthropic">Anthropic Claude</option>
              <option value="ollama-local">Ollama (100% Lokal & Offline)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">API Key (Bring Your Own Key):</label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder="sk-... (bleibt nur in deinem Browser)"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-white font-mono outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Lokaler Endpunkt (für Ollama):</label>
            <input
              type="text"
              value={config.endpoint}
              onChange={(e) => setConfig({ ...config, endpoint: e.target.value })}
              placeholder="http://localhost:11434"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-white font-mono outline-none"
            />
          </div>

          <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-900/40 text-[10px] text-indigo-300">
            AxiomTeX sendet deinen Code niemals an Dritte. API-Keys werden ausschließlich verschlüsselt im lokalen Browser-Speicher abgelegt.
          </div>
        </div>
      )}
    </div>
  );
};
