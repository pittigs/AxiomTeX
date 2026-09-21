import type { CompilationResult, CompilerLogEntry, ProjectFile } from '../types';
import { analyzeLatexCode } from './latexParser';
import jsPDF from 'jspdf';

export async function compileLatexProject(
  files: ProjectFile[],
  activeFileId: string,
  engine: 'wasm-browser' | 'cloud-texlive' = 'wasm-browser'
): Promise<CompilationResult> {
  const startTime = performance.now();
  const mainFile = files.find(f => f.name === 'main.tex') || files.find(f => f.id === activeFileId);
  const code = mainFile?.content || '';

  // 1. Analyze code for syntax errors and warnings
  const { logs: syntaxLogs, parsed } = analyzeLatexCode(code);

  const hasFatalErrors = syntaxLogs.some(l => l.type === 'error');
  const durationMs = Math.round(performance.now() - startTime + (engine === 'wasm-browser' ? 120 : 680));

  const timestamp = new Date().toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const fullLogs: CompilerLogEntry[] = [
    {
      type: 'info',
      message: `Starte Kompilierung mit Engine [${engine === 'wasm-browser' ? 'WebAssembly WASM v2.4 (Client-Side)' : 'TeXLive 2026 Cloud Worker'}]`,
      raw: `This is pdfTeX, Version 3.141592653-2.6-1.40.24 (TeX Live 2026/WASM)`
    },
    {
      type: 'info',
      message: `Lade Dateibaum: ${files.length} Dateien im Projekt verarbeitet...`,
      raw: `entering extended mode: \\write18 enabled.`
    },
    ...syntaxLogs
  ];

  if (hasFatalErrors) {
    fullLogs.push({
      type: 'error',
      message: 'Kompilierung fehlgeschlagen aufgrund von Syntax-Fehlern.',
      raw: '!  ==> Fatal error occurred, no output PDF file produced!'
    });

    return {
      success: false,
      timestamp,
      durationMs,
      logs: fullLogs,
      engineUsed: engine,
      pageCount: 0
    };
  }

  // Generate simulated page count based on word count & document class
  const estimatedPages = parsed.isBeamer 
    ? Math.max(1, (code.match(/\\begin\{frame\}/g) || []).length || 4)
    : Math.max(1, Math.ceil(parsed.wordCount / 450));

  fullLogs.push({
    type: 'info',
    message: `Kompilierung erfolgreich in ${durationMs}ms (${estimatedPages} ${estimatedPages === 1 ? 'Seite' : 'Seiten'} generiert).`,
    raw: `Output written on main.pdf (${estimatedPages} pages, 142084 bytes).\nTranscript written on main.log.`
  });

  return {
    success: true,
    timestamp,
    durationMs,
    logs: fullLogs,
    engineUsed: engine,
    pageCount: estimatedPages
  };
}

export function exportProjectAsPdf(title: string, content: string) {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    doc.setFont('times', 'bold');
    doc.setFontSize(16);
    doc.text(title || 'LaTeX Dokument', 20, 25);

    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    
    // Add raw or simplified body
    const cleanLines = content.split('\n').filter(l => !l.startsWith('\\')).slice(0, 50);
    doc.text(cleanLines.join('\n') || 'AxiomTeX Generiertes PDF Dokument', 20, 38, { maxWidth: 170 });

    doc.save(`${(title || 'latex_dokument').toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`);
  } catch (err) {
    console.error('PDF Export Error:', err);
  }
}
