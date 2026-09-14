import type { LaTeXTemplate } from '../types';

export const IEEE_TEMPLATE: LaTeXTemplate = {
  id: 'ieee-journal',
  title: 'IEEE Journal Paper (Two-Column)',
  description: 'Standard IEEE Transactions LaTeX Template mit 2-Spalten-Layout, Formeln, Tabellen und BibTeX.',
  category: 'Paper',
  author: 'IEEE Standard Committee',
  icon: 'FileText',
  files: [
    {
      id: 'file-1',
      name: 'main.tex',
      path: '/main.tex',
      isFolder: false,
      type: 'tex',
      content: `\\documentclass[journal,10pt,twocolumn]{IEEEtran}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{algorithmic}
\\usepackage{graphicx}
\\usepackage{textcomp}
\\usepackage{xcolor}
\\usepackage{booktabs}
\\usepackage{cite}

\\begin{document}

\\title{OpenTeX: A High-Performance Decentralized Open-Source Collaborative LaTeX Ecosystem}

\\author{Author~One,~\\IEEEmembership{Member,~IEEE,}
        Author~Two,~\\IEEEmembership{Senior~Member,~IEEE,}
        and~Author~Three,~\\IEEEmembership{Fellow,~IEEE}%
\\thanks{Author One is with the Department of Computer Science, University of Technology (e-mail: author.one@university.edu).}%
\\thanks{Author Two and Author Three are with the Distributed Systems Institute, Research University.}%
}

\\markboth{IEEE Transactions on Software Engineering,~Vol.~42, No.~8, 2026}%
{Author \\MakeLowercase{\\textit{et al.}}: OpenTeX: High-Performance Open-Source Collaborative LaTeX}

\\maketitle

\\begin{abstract}
Collaborative scientific typesetting has long been dominated by centralized, expensive proprietary cloud platforms. This paper presents \\textbf{OpenTeX}, an open-source, hybrid WebAssembly-accelerated LaTeX collaborative environment. By delegating 92\\% of compilation workloads directly to client-side WebAssembly runtimes and synchronizing document state using Conflict-free Replicated Data Types (CRDTs), OpenTeX reduces server operating expenditures by over 88\\% while achieving sub-50ms keystroke-to-preview latency. We evaluate our architecture across 50,000 real-world academic papers, demonstrating complete syntax compatibility with full TeXLive distributions.
\\end{abstract}

\\begin{IEEEkeywords}
LaTeX, WebAssembly, Real-time Collaboration, CRDT, Cloud Economics, Scientific Publishing.
\\end{IEEEkeywords}

\\section{Introduction}
\\IEEEPARstart{S}{cientific} communication relies heavily on the LaTeX document preparation system originally conceived by Leslie Lamport in 1984 \\cite{lamport1984latex}. In recent decades, web-based collaborative editors have surged in popularity among academia and research institutions worldwide.

However, existing cloud-based LaTeX suites impose substantial subscription costs due to excessive server-side CPU utilization during frequent document re-compilations. Each keystroke trigger or automated compilation cycle spawns isolated containerized environments executing complete TeXLive binaries, causing quadratic infrastructure costs as user concurrency scales.

\\subsection{Our Contributions}
In this paper, we propose and evaluate three core innovations:
\\begin{enumerate}
    \\item \\textbf{Hybrid WASM Execution Engine:} Direct compilation within client browsers using WebAssembly with automated cloud fallback.
    \\item \\textbf{CRDT State Synchronization:} Lossless peer-to-peer and client-server collaboration powered by Yjs delta encoding.
    \\item \\textbf{Zero-Overhead SyncTeX:} Real-time bidirectional mapping between source editor cursors and rendered PDF viewports.
\\end{enumerate}

\\section{System Architecture and Mathematical Model}
Let $\\mathcal{D} = \\{b_1, b_2, \\dots, b_n\\}$ denote the set of syntax blocks in a LaTeX source file. We model the compilation pipeline through the transformation operator $\\mathcal{T}_{\\text{wasm}}$:

\\begin{equation}
\\mathcal{P}(t) = \\mathcal{T}_{\\text{wasm}} \\left( \\sum_{i=1}^{n} w_i \\cdot \\nabla \\phi_i(x, y) \\right) + \\epsilon(t)
\\end{equation}

where $\\mathcal{P}(t)$ represents the generated PDF frame buffer at time $t$, and $\\phi_i$ denotes the font metrics vector field.

\\subsection{Matrix Representation of CRDT Merging}
The concurrent conflict resolution matrix $\\mathbf{M}_{\\text{CRDT}}$ satisfies strong eventual consistency:

\\begin{equation}
\\mathbf{M}_{\\text{CRDT}} = \\begin{pmatrix}
\\lambda_1 & \\alpha_{12} & \\cdots & \\alpha_{1k} \\\\
\\alpha_{21} & \\lambda_2 & \\cdots & \\alpha_{2k} \\\\
\\vdots & \\vdots & \\ddots & \\vdots \\\\
\\alpha_{k1} & \\alpha_{k2} & \\cdots & \\lambda_k
\\end{pmatrix} \\in \\mathbb{R}^{k \\times k}
\\end{equation}

\\begin{table}[htbp]
\\caption{Performance Comparison: Cloud Server vs. WebAssembly}
\\begin{center}
\\begin{tabular}{lrrr}
\\toprule
\\textbf{Metric} & \\textbf{Server TeX} & \\textbf{WASM Engine} & \\textbf{Improvement} \\\\
\\midrule
First Build Time & 1.84 s & 0.62 s & 66.3\\% \\\\
Incremental Build & 0.95 s & 0.08 s & 91.5\\% \\\\
Server Cost / User & \\$4.20/mo & \\$0.12/mo & 97.1\\% \\\\
Offline Capable & No & Yes & Full \\\\
\\bottomrule
\\end{tabular}
\\label{tab:perf}
\\end{center}
\\end{table}

\\section{Experimental Results}
Our benchmark evaluates throughput and memory consumption across typical university workloads. As demonstrated in Table~\\ref{tab:perf}, our WASM-first approach achieves a $10\\times$ reduction in incremental compilation latency while preserving complete typographic fidelity.

\\section{Conclusion}
OpenTeX demonstrates that high-performance, cost-effective LaTeX collaboration is achievable through modern browser technologies and open-source standards. Future work will investigate distributed neural auto-completion for LaTeX mathematical formula synthesis.

\\bibliographystyle{IEEEtran}
\\bibliography{references}

\\end{document}`
    },
    {
      id: 'file-2',
      name: 'references.bib',
      path: '/references.bib',
      isFolder: false,
      type: 'bib',
      content: `@article{lamport1984latex,
  title={LaTeX: A Document Preparation System},
  author={Lamport, Leslie},
  journal={Addison-Wesley Professional},
  year={1984}
}

@article{knuth1984tex,
  title={The TeXbook},
  author={Knuth, Donald Ervin},
  journal={Addison-Wesley},
  year={1984}
}

@article{shapiro2011crdt,
  title={Conflict-free Replicated Data Types},
  author={Shapiro, Marc and Pregui{\\c{c}}a, Nuno and Baquero, Carlos and Zawirski, Marek},
  journal={Symposium on Self-Stabilizing Systems},
  pages={386--400},
  year={2011},
  publisher={Springer}
}`
    }
  ]
};

export const THESIS_TEMPLATE: LaTeXTemplate = {
  id: 'master-thesis',
  title: 'Master- / Bachelorarbeit (Thesis)',
  description: 'Vollständige Abschlussarbeits-Vorlage mit Deckblatt, Inhaltsverzeichnis, Kapiteln, Theoremen und Literaturverzeichnis.',
  category: 'Thesis',
  author: 'TU München / Universität Template',
  icon: 'GraduationCap',
  files: [
    {
      id: 't-file-1',
      name: 'main.tex',
      path: '/main.tex',
      isFolder: false,
      type: 'tex',
      content: `\\documentclass[12pt,a4paper,oneside]{report}
\\usepackage[utf8]{inputenc}
\\usepackage[ngerman,english]{babel}
\\usepackage{amsmath,amssymb,amsthm}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\usepackage{booktabs}
\\usepackage{geometry}
\\geometry{a4paper, left=30mm, right=25mm, top=30mm, bottom=30mm}

\\newtheorem{theorem}{Theorem}[chapter]
\\newtheorem{definition}{Definition}[chapter]

\\begin{document}

\\begin{titlepage}
    \\centering
    \\vspace*{1cm}
    {\\huge\\bfseries Skalierbare kollaborative Echtzeiteditoren für wissenschaftliche Publikationen\\par}
    \\vspace{1.5cm}
    {\\Large Masterarbeit im Studiengang Informatik\\par}
    \\vspace{2cm}
    {\\large Vorgelegt von:\\par}
    {\\Large\\bfseries Alexander Musterstudent\\par}
    \\vspace{1cm}
    {\\large Matrikelnummer: 03719482\\par}
    \\vspace{2cm}
    {\\large Betreuer: Prof. Dr. tech. Martin Weismann\\par}
    {\\large Fakultät für Informatik\\par}
    \\vfill
    {\\large München, den \\today\\par}
\\end{titlepage}

\\tableofcontents
\\newpage

\\chapter{Einleitung und Motivation}
\\section{Problemstellung}
Wissenschaftliches Arbeiten im akademischen Umfeld erfordert präzisen Schriftsatz und nahtlose Teamarbeit. Bestehende proprietäre Plattformen belasten Budgets von Instituten und Studenten gleichermaßen.

\\section{Zielsetzung der Arbeit}
In dieser Arbeit wird eine leichtgewichtige Open-Source Architektur für verteiltes kollaboratives LaTeX-Authoring konzipiert und implementiert.

\\begin{definition}[CRDT Konvergenz]
Ein replizierter Datentyp heißt \\textit{konvergent} (state-based CRDT), wenn für alle Zustände $s_1, s_2$ eine kleinste obere Schranke $s_1 \\sqcup s_2$ bezüglich einer Halbordnung $(\\mathcal{S}, \\le)$ existiert.
\\end{definition}

\\chapter{Mathematische Grundlagen & Algorithmen}
\\section{Echtzeit-Synchronisation}
Sei $\\mathcal{S}$ der globale Dokumentenzustand. Wir definieren die Transformationsfunktion $f_{\\text{sync}}$ als:

\\begin{equation}
\\mathcal{S}_{\\text{merged}} = \\bigoplus_{k=1}^{M} \\left( \\int_{0}^{T} \\psi_k(t) \\, dt \\right)
\\end{equation}

\\chapter{Fazit und Ausblick}
Die vorgestellte Lösung reduziert Latenzen im Collaborative-Editing um $85\\%$ und ermöglicht datenschutzkonformes Self-Hosting für Hochschulen.

\\end{document}`
    }
  ]
};

export const BEAMER_TEMPLATE: LaTeXTemplate = {
  id: 'beamer-presentation',
  title: 'Beamer Präsentation (Modern Slides)',
  description: 'Elegante Vortragsfolien mit Themenblöcken, Hervorhebungen, Formeln und 16:9 Breitbild-Format.',
  category: 'Slides',
  author: 'OpenTeX Design Team',
  icon: 'Presentation',
  files: [
    {
      id: 'b-file-1',
      name: 'main.tex',
      path: '/main.tex',
      isFolder: false,
      type: 'tex',
      content: `\\documentclass[aspectratio=169,11pt]{beamer}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath,amssymb}
\\usepackage{booktabs}

\\usetheme{Madrid}
\\usecolortheme{beaver}

\\title{OpenTeX: Die Zukunft des kollaborativen LaTeX}
\\subtitle{Client-Side WASM Compilation \\& CRDT-Synchronisation}
\\author{Dr. Laura Bergmann \\and Jonas Keller}
\\institute{Institut für Angewandte Informatik}
\\date{\\today}

\\begin{document}

\\frame{\\titlepage}

\\begin{frame}{Überblick}
  \\tableofcontents
\\end{frame}

\\section{Motivation}
\\begin{frame}{Warum eine Open-Source Alternative?}
  \\begin{itemize}
    \\item<1-> \\textbf{Hohe Kosten:} Bestehende Lösungen verlangen monatlich bis zu 30 € pro Nutzer.
    \\item<2-> \\textbf{Datenschutz:} Universitäten benötigen DSGVO-konformes Self-Hosting.
    \\item<3-> \\textbf{Performance:} Browser-basierte WASM-Kompilierung spart Serverkosten und bietet sofortige Vorschau.
  \\end{itemize}
\\end{frame}

\\section{Architektur}
\\begin{frame}{Wichtigste Leistungsdaten}
  \\begin{block}{Kernvorteile}
    \\begin{itemize}
      \\item 0 € Server-CPU-Kosten für Standard-Kompilierungen
      \\item Replikationszeit unter 30 Millisekunden via Yjs
      \\item Volle Offline-Fähigkeit im Browser
    \\end{itemize}
  \\end{block}
  
  \\begin{alertblock}{Mathematischer Durchsatz}
    $\\displaystyle \\lim_{N \\to \\infty} \\frac{\\text{Serverlast}(N)}{N} = \\mathcal{O}(1)$
  \\end{alertblock}
\\end{frame}

\\begin{frame}{Zusammenfassung}
  \\centering
  \\Huge Vielen Dank für Ihre Aufmerksamkeit!\\\\
  \\vspace{0.8cm}
  \\large Fragen \\& Diskussion
\\end{frame}

\\end{document}`
    }
  ]
};

export const CV_TEMPLATE: LaTeXTemplate = {
  id: 'academic-cv',
  title: 'Akademischer Lebenslauf / CV',
  description: 'Moderner, strukturierter tabellarischer Lebenslauf für Industrie & Forschung.',
  category: 'Resume',
  author: 'Modern Academic Styles',
  icon: 'UserCheck',
  files: [
    {
      id: 'cv-file-1',
      name: 'main.tex',
      path: '/main.tex',
      isFolder: false,
      type: 'tex',
      content: `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=2cm]{geometry}
\\usepackage{hyperref}
\\usepackage{xcolor}
\\usepackage{titlesec}
\\usepackage{enumitem}

\\definecolor{primary}{RGB}{37, 99, 235}

\\titleformat{\\section}{\\large\\bfseries\\color{primary}}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{12pt}{6pt}

\\begin{document}
\\pagestyle{empty}

{\\Huge \\textbf{Dr. rer. nat. Tobias Hoffmann}}\\\\
\\vspace{2pt}
{\\color{gray} Senior Machine Learning Researcher \\& Systems Engineer}\\\\
\\href{mailto:tobias.hoffmann@tum.de}{tobias.hoffmann@tum.de} \\enspace|\\enspace +49 (0) 89 289 01 \\enspace|\\enspace München, Deutschland

\\section{Berufserfahrung}
\\textbf{Lead Research Scientist} \\hfill 2023 -- Heute\\\\
\\textit{Max-Planck-Institut für Intelligente Systeme}, München
\\begin{itemize}[leftmargin=1.5em,noitemsep,topsep=2pt]
  \\item Leitung eines 6-köpfigen Forschungsteams für verteilte Inferenz-Systeme
  \\item Veröffentlichung von 4 Hauptkonferenz-Papern (NeurIPS, ICML, CVPR)
\\end{itemize}

\\vspace{4pt}
\\textbf{Senior Software Architect} \\hfill 2020 -- 2023\\\\
\\textit{DeepTech Solutions GmbH}, Berlin
\\begin{itemize}[leftmargin=1.5em,noitemsep,topsep=2pt]
  \\item Konzeption einer echtzeitfähigen WebAssembly-Plattform für 500k aktive Nutzer
\\end{itemize}

\\section{Ausbildung}
\\textbf{Promotion in Informatik (Dr. rer. nat.)} \\hfill 2016 -- 2020\\\\
\\textit{Technische Universität München} (Note: Summa Cum Laude)

\\textbf{M.Sc. Informatik} \\hfill 2014 -- 2016\\\\
\\textit{ETH Zürich} (Grade: 5.8 / 6.0)

\\section{Ausgewählte Publikationen}
\\begin{enumerate}[leftmargin=1.5em,noitemsep]
  \\item \\textbf{Hoffmann, T.} et al. (2025). \\textit{High-Throughput CRDT Architectures in WebAssembly}. IEEE TSE.
  \\item \\textbf{Hoffmann, T.}, Schmidt, E. (2024). \\textit{Sub-linear Conflict Resolution in Distributed Systems}. NeurIPS.
\\end{enumerate}

\\end{document}`
    }
  ]
};

export const EXAM_TEMPLATE: LaTeXTemplate = {
  id: 'exam-paper',
  title: 'Universitäts-Klausur & Aufgabenblatt / Exam',
  description: 'Akademische Klausur- und Übungsvorlage für Hochschulen mit Aufgabenboxen, Deckblatt und Punkteverteilung.',
  category: 'CheatSheet',
  author: 'OpenTeX Academic',
  icon: 'FileText',
  files: [
    {
      id: 'exam-file-1',
      name: 'main.tex',
      path: '/main.tex',
      isFolder: false,
      type: 'tex',
      content: `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{amsmath,amssymb,amsfonts,amsthm}
\\usepackage{geometry}
\\geometry{a4paper, margin=20mm, top=22mm, bottom=22mm}
\\usepackage{enumitem}
\\usepackage{fancyhdr}
\\usepackage{tabularx}
\\usepackage{booktabs}
\\usepackage{titlesec}
\\usepackage{xcolor}
\\usepackage{tcolorbox}

% University & Institution Colors
\\definecolor{univblue}{RGB}{30, 58, 138}
\\definecolor{darkslate}{RGB}{30, 41, 59}
\\definecolor{lightgrey}{RGB}{248, 250, 252}

% Configuration: Set your university & course details here
\\newcommand{\\universityName}{Universit\\"at / Hochschule}
\\newcommand{\\facultyName}{Fakult\\"at f\\"ur Informatik & Mathematik}
\\newcommand{\\courseName}{Wahrscheinlichkeit & Verteilte Systeme}
\\newcommand{\\examTitle}{Modul-Abschlusspr\\"ufung (Exam)}

\\pagestyle{fancy}
\\fancyhf{}
\\rhead{\\textcolor{darkslate}{\\small \\textbf{\\courseName}}}
\\lhead{\\textcolor{darkslate}{\\small \\examTitle}}
\\rfoot{\\textcolor{darkslate}{\\small Page \\thepage}}
\\renewcommand{\\headrulewidth}{0.5pt}
\\renewcommand{\\footrulewidth}{0.3pt}

\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{5pt}

\\titleformat{\\section}{\\Large\\bfseries\\color{univblue}}{}{0em}{}[\\titlerule]

\\begin{document}

% -------------------------------------------------------------
% Header
% -------------------------------------------------------------
\\begin{center}
    {\\LARGE \\textbf{\\color{univblue}\\universityName}}\\\\[3pt]
    {\\large \\textbf{\\facultyName}}\\\\[4pt]
    {\\Large \\textbf{\\courseName}}\\\\[3pt]
    {\\large \\textbf{\\examTitle}}\\\\[5pt]
    \\rule{\\textwidth}{1.2pt}
\\end{center}

\\vspace{0.1cm}
\\noindent
\\begin{tabularx}{\\textwidth}{lX lX}
    \\textbf{Name:} & \\hrulefill & \\textbf{Matrikelnr. / ID:} & \\hrulefill \\\\
    \\textbf{Bearbeitungszeit:} & 90 Minuten & \\textbf{Gesamtpunkte:} & 50 Punkte \\\\
\\end{tabularx}

\\vspace{0.3cm}
\\begin{tcolorbox}[colback=lightgrey,colframe=univblue,title=\\textbf{Pr\\"ufungshinweise / Instructions},arc=1.5mm]
\\small
\\begin{itemize}[noitemsep,topsep=2pt,leftmargin=5mm]
    \\item Diese Pr\\"ufung umfasst 5 Aufgaben mit jeweils 10 Punkten.
    \\item Begr\\"unden Sie alle mathematischen Schritte und Zwischenergebnisse.
    \\item Taschenrechner und Formelsammlungen gem\\"a{\\ss} Modulvorgaben sind zugelassen.
\\end{itemize}
\\end{tcolorbox}

\\vspace{0.3cm}

% -------------------------------------------------------------
% Task 1
% -------------------------------------------------------------
\\section*{Problem 1: Continuous Density, Transformation \\& Moments \\hfill (10 Points)}
Let $X$ be a continuous random variable with probability density function (PDF):
\\[
f_X(x) = \\begin{cases} c \\cdot x(1-x), & \\text{for } 0 \\le x \\le 1, \\\\ 0, & \\text{otherwise.} \\end{cases}
\\]
\\begin{enumerate}[label=(\\alph*), itemsep=4pt]
    \\item Determine the normalization constant $c \\in \\mathbb{R}$. \\hfill \\textbf{[3 Pts]}
    \\item Compute the expectation $\\mathbb{E}[X]$ and the variance $\\text{Var}(X)$. \\hfill \\textbf{[4 Pts]}
    \\item Consider the transformation $Y = -\\ln(X)$. Determine the cumulative distribution function $F_Y(y) = \\mathbb{P}(Y \\le y)$ for $y > 0$. \\hfill \\textbf{[3 Pts]}
\\end{enumerate}

\\vspace{0.4cm}

% -------------------------------------------------------------
% Task 2
% -------------------------------------------------------------
\\section*{Problem 2: Joint PMF, Covariance \\& Independence \\hfill (10 Points)}
Two discrete random variables $X$ and $Y$ have the joint probability mass function $p_{X,Y}(x, y)$ given by the following table:

\\begin{center}
\\renewcommand{\\arraystretch}{1.3}
\\begin{tabular}{c|ccc}
\\toprule
$p_{X,Y}(x,y)$ & $Y = -1$ & $Y = 0$ & $Y = 1$ \\\\
\\midrule
$X = 0$ & $0$ & $1/2$ & $0$ \\\\
$X = 1$ & $1/4$ & $0$ & $1/4$ \\\\
\\bottomrule
\\end{tabular}
\\end{center}

\\begin{enumerate}[label=(\\alph*), itemsep=4pt]
    \\item Compute the marginal distributions $p_X(x)$ and $p_Y(y)$ for all possible outcomes. \\hfill \\textbf{[3 Pts]}
    \\item Calculate the expectations $\\mathbb{E}[X]$, $\\mathbb{E}[Y]$, and $\\mathbb{E}[XY]$. \\hfill \\textbf{[3 Pts]}
    \\item Calculate the covariance $\\text{Cov}(X, Y)$. \\hfill \\textbf{[2 Pts]}
    \\item Formally determine whether $X$ and $Y$ are statistically independent. \\hfill \\textbf{[2 Pts]}
\\end{enumerate}

\\vspace{0.4cm}

% -------------------------------------------------------------
% Task 3 (NEU: Höhere Momente & Zentrale Momente)
% -------------------------------------------------------------
\\section*{Problem 3: Higher Moments \\& Central Moments \\hfill (10 Points)}
Let $X$ be a discrete random variable taking values in $\\{-2, 0, 2, 4\\}$ with probability mass function:
\\[
p_X(-2) = \\frac{1}{8}, \\quad p_X(0) = \\frac{1}{2}, \\quad p_X(2) = \\frac{1}{4}, \\quad p_X(4) = \\frac{1}{8}.
\\]
\\begin{enumerate}[label=(\\alph*), itemsep=4pt]
    \\item Calculate the expected value $\\mathbb{E}[X]$ and the variance $\\text{Var}(X)$. \\hfill \\textbf{[3 Pts]}
    \\item Calculate the third raw moment $\\mathbb{E}[X^3]$. \\hfill \\textbf{[3 Pts]}
    \\item Derive the third central moment $\\mu_3 = \\mathbb{E}[(X - \\mathbb{E}[X])^3]$ in two ways:
    \\begin{itemize}[noitemsep]
        \\item directly via the definition of central moments, and
        \\item using the expansion formula $\\mu_3 = \\mathbb{E}[X^3] - 3\\mathbb{E}[X]\\mathbb{E}[X^2] + 2(\\mathbb{E}[X])^3$.
    \\end{itemize} \\hfill \\textbf{[4 Pts]}
\\end{enumerate}

\\newpage

% -------------------------------------------------------------
% Task 4
% -------------------------------------------------------------
\\section*{Problem 4: Memorylessness \\& Minimum of Exponential RVs \\hfill (10 Points)}
Consider two independent servers with service lifetimes $T_1 \\sim \\text{Exp}(\\lambda_1)$ and $T_2 \\sim \\text{Exp}(\\lambda_2)$, where $\\lambda_1, \\lambda_2 > 0$.
\\begin{enumerate}[label=(\\alph*), itemsep=4pt]
    \\item Using the memoryless property of the exponential distribution, determine the conditional expectation $\\mathbb{E}[T_1 \\mid T_1 > 5]$. \\hfill \\textbf{[3 Pts]}
    \\item Let $M = \\min(T_1, T_2)$ denote the time until the first server failure occurs. Compute the survival probability $\\mathbb{P}(M > t)$ for $t \\ge 0$, and identify the distribution of $M$ with its parameter. \\hfill \\textbf{[4 Pts]}
    \\item Compute the probability $\\mathbb{P}(T_1 < T_2)$ that server 1 fails before server 2. \\hfill \\textbf{[3 Pts]}
\\end{enumerate}

\\vspace{0.5cm}

% -------------------------------------------------------------
% Task 5
% -------------------------------------------------------------
\\section*{Problem 5: Random Sums \\& Concentration Bounds \\hfill (10 Points)}
A web service receives $N$ requests during a one-minute interval, where $N \\sim \\text{Poisson}(100)$. Each request independently requires an intensive database write operation with probability $p = 0.20$. Let $X_i \\sim \\text{Bernoulli}(0.2)$ be i.i.d. indicators independent of $N$, and let $S_N = \\sum_{i=1}^N X_i$ be the total number of write operations in that minute.
\\begin{enumerate}[label=(\\alph*), itemsep=4pt]
    \\item Compute the expected number of write operations $\\mathbb{E}[S_N]$ using the Law of Total Expectation. \\hfill \\textbf{[3 Pts]}
    \\item Given that $\\text{Var}(S_N) = 20$, use Chebyshev's inequality to find an upper bound for the probability that $S_N$ deviates from its expected value by at least $10$, i.e., $\\mathbb{P}(|S_N - \\mathbb{E}[S_N]| \\ge 10)$. \\hfill \\textbf{[4 Pts]}
    \\item Use your result from part (b) to provide a guaranteed lower bound for the probability that $S_N$ strictly lies in the interval $(10, 30)$. \\hfill \\textbf{[3 Pts]}
\\end{enumerate}

\\vspace{1cm}
\\begin{center}
    \\rule{0.4\\textwidth}{0.5pt}\\\\
    {\\small \\textit{End of Exam Paper -- Good Luck!}}
\\end{center}

\\end{document}`
    }
  ]
};

export const ACM_TEMPLATE: LaTeXTemplate = {
  id: 'acm-conference',
  title: 'ACM Conference Paper (sigconf)',
  description: 'Offizielle Vorlage für ACM-Konferenzen (acmart) mit CCS-Klassifikation, ACM-Referenzformat und BibTeX.',
  category: 'Paper',
  author: 'Association for Computing Machinery (ACM)',
  icon: 'FileText',
  files: [
    {
      id: 'acm-1',
      name: 'main.tex',
      path: '/main.tex',
      isFolder: false,
      type: 'tex',
      content: `\\documentclass[sigconf]{acmart}

\\usepackage{amsmath,amssymb}
\\usepackage{booktabs}
\\usepackage{microtype}

\\acmConference[SIGOPS '26]{ACM Symposium on Operating Systems Principles}{October 2026}{Munich, Germany}
\\acmYear{2026}
\\copyrightyear{2026}

\\title{Scalable Collaborative LaTeX Environments via Conflict-Free Replicated Data Types}

\\author{Firstname Lastname}
\\affiliation{%
  \\institution{University of Technology}
  \\department{Department of Computer Science}
  \\city{Berlin}
  \\country{Germany}
}
\\email{author@university.edu}

\\author{Co-Author Name}
\\affiliation{%
  \\institution{Research Institute of Science}
  \\city{Zurich}
  \\country{Switzerland}
}
\\email{coauthor@institute.org}

\\begin{document}

\\begin{abstract}
Real-time collaborative editing of scientific manuscripts requires robust consistency models and low latency. In this paper, we evaluate decentralized document composition using CRDTs and WebAssembly compilation runtimes. Our empirical benchmarks across 1,000 concurrent editing sessions show that conflict-free delta replication achieves sub-40ms end-to-end synchronization with zero typographic regressions.
\\end{abstract}

\\begin{CCSXML}
<ccs2012>
 <concept>
  <concept_id>10011007.10011074.10011092</concept_id>
  <concept_desc>Software and its engineering~Collaboration in software development</concept_desc>
  <concept_significance>500</concept_significance>
 </concept>
</ccs2012>
\\end{CCSXML}

\\ccsdesc[500]{Software and its engineering~Collaboration in software development}

\\keywords{LaTeX, CRDT, Real-Time Systems, Scientific Publishing, ACM}

\\maketitle

\\section{Introduction}
Modern scientific collaboration necessitates immediate feedback loops and high typesetting quality \\cite{lamport1984latex}. Standard proprietary cloud editors often impose bandwidth and compute constraints on large academic documents.

\\section{Methodology}
We define the synchronization state space $\\mathcal{S}$ and evaluate operational convergence under high packet loss.

\\begin{equation}
\\lim_{t \\to \\infty} \\mathbb{P}(\\mathcal{S}_A(t) = \\mathcal{S}_B(t)) = 1
\\end{equation}

\\section{Evaluation & Results}
Table~\\ref{tab:latency} summarizes the measured latencies across global network clusters.

\\begin{table}[htbp]
\\caption{Benchmark Results: Synchronization Latency}
\\label{tab:latency}
\\begin{tabular}{lrr}
\\toprule
\\textbf{Cluster} & \\textbf{P95 Latency} & \\textbf{P99 Latency} \\\\
\\midrule
Local Network & 4.2 ms & 7.8 ms \\\\
Trans-Atlantic & 68.4 ms & 82.1 ms \\\\
Asia-Pacific & 112.0 ms & 134.5 ms \\\\
\\bottomrule
\\end{tabular}
\\end{table}

\\section{Conclusion}
Our architecture provides a robust foundation for next-generation decentralized academic authoring tools.

\\bibliographystyle{ACM-Reference-Format}
\\bibliography{references}

\\end{document}`
    },
    {
      id: 'acm-2',
      name: 'references.bib',
      path: '/references.bib',
      isFolder: false,
      type: 'bib',
      content: `@article{lamport1984latex,
  title={LaTeX: A Document Preparation System},
  author={Lamport, Leslie},
  journal={Addison-Wesley Professional},
  year={1984}
}

@article{shapiro2011crdt,
  title={Conflict-free Replicated Data Types},
  author={Shapiro, Marc and Pregui{\\c{c}}a, Nuno and Baquero, Carlos and Zawirski, Marek},
  journal={Symposium on Self-Stabilizing Systems},
  pages={386--400},
  year={2011},
  publisher={Springer}
}`
    }
  ]
};

export const ARTICLE_TEMPLATE: LaTeXTemplate = {
  id: 'standard-article',
  title: 'Wissenschaftlicher Fachartikel / Preprint',
  description: 'Klassisches einspaltiges Standard-Layout für wissenschaftliche Publikationen, Preprints (arXiv, Elsevier, Springer) und Fachberichte.',
  category: 'Paper',
  author: 'Standard Academic Article',
  icon: 'FileText',
  files: [
    {
      id: 'art-1',
      name: 'main.tex',
      path: '/main.tex',
      isFolder: false,
      type: 'tex',
      content: `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=2.5cm]{geometry}
\\usepackage{amsmath,amssymb,amsfonts,amsthm}
\\usepackage{graphicx}
\\usepackage{booktabs}
\\usepackage{hyperref}
\\usepackage{cite}

\\newtheorem{theorem}{Theorem}
\\newtheorem{lemma}[theorem]{Lemma}

\\title{\\textbf{On the Foundations of Decentralized Document Typesetting}}
\\author{
  \\textbf{Firstname Lastname}\\textsuperscript{1}, 
  \\textbf{Co-Author Name}\\textsuperscript{2} \\\\[4pt]
  \\small \\textsuperscript{1}Department of Mathematics and Computer Science, University Institute \\\\
  \\small \\textsuperscript{2}Center for Advanced Scientific Research \\\\
  \\small \\texttt{\\{author, coauthor\\}@institution.edu}
}
\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
We present a rigorous treatment of real-time collaborative document compilation under Byzantine and non-Byzantine network partitions. By demonstrating that mathematical typesetting syntax maps homomorphically to linear tree structures, we establish formal bounds on state convergence. Empirical evaluations confirm sub-second total compilation cycles on standard desktop browsers without server dependencies.
\\end{abstract}

\\section{Introduction}
Scientific publishing requires typesetting fidelity and accessible tools \\cite{knuth1984tex}. We examine the formal convergence properties of decentralized collaborative LaTeX pipelines.

\\section{Mathematical Model}
Let $(\\mathcal{L}, \\le)$ be a complete lattice of document fragments.
\\begin{theorem}
For any finite set of concurrent document edits $\\mathcal{E} = \\{e_1, e_2, \\dots, e_k\\}$, the merged state satisfies:
\\begin{equation}
\\bigsqcup_{i=1}^k \\phi(e_i) = \\phi\\left(\\bigcup_{i=1}^k e_i\\right)
\\end{equation}
\\end{theorem}

\\section{Discussion & Outlook}
The theoretical bounds hold across arbitrary document sizes, providing a sound foundation for open-source collaborative publishing.

\\bibliographystyle{plain}
\\bibliography{references}

\\end{document}`
    },
    {
      id: 'art-2',
      name: 'references.bib',
      path: '/references.bib',
      isFolder: false,
      type: 'bib',
      content: `@article{knuth1984tex,
  title={The TeXbook},
  author={Knuth, Donald Ervin},
  journal={Addison-Wesley},
  year={1984}
}`
    }
  ]
};

export const ALL_TEMPLATES: LaTeXTemplate[] = [
  IEEE_TEMPLATE,
  ACM_TEMPLATE,
  ARTICLE_TEMPLATE,
  THESIS_TEMPLATE,
  BEAMER_TEMPLATE,
  CV_TEMPLATE,
  EXAM_TEMPLATE
];

