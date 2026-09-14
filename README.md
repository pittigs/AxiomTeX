# OpenTeX ⚡

<p align="center">
  <strong>A modern, high-performance, browser-based LaTeX editing and live preview suite.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178c6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8.2-646cff?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=flat-square&logo=tailwindcss" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ed?style=flat-square&logo=docker" alt="Docker" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="MIT License" />
</p>

<p align="center">
  <a href="https://pittigs.github.io/opentex/"><strong>🚀 Try Live Demo: pittigs.github.io/opentex »</strong></a>
</p>

---

## 🌟 Overview

**OpenTeX** is an open-source, client-first LaTeX authoring environment designed for researchers, students, and engineers. It combines the power of Microsoft's **Monaco Editor** with instant client-side math and document rendering (**KaTeX**), an integrated **AI Scientific Writing Assistant**, collaborative **Review & Suggestion panels**, and seamless **PDF/ZIP exports**.

- **⚡ On-Demand Web Edition (GitHub Pages):** Runs 100% in your browser. Zero registration or user account required—open and start writing instantly with local, private storage.
- **🏢 On-Premises & Self-Hosted Ready:** Easily configure custom backend server URLs, remote TeXLive engines, internal auth tokens, self-hosted Ollama/vLLM AI, and private GitLab/Gitea repositories.

---

## ✨ Key Features

- **⚡ Instant Real-Time Preview**
  - Ultra-fast client-side KaTeX rendering for formulas, theorems, and equations.
  - Formatted preview of headings, tables, citations, environments, and custom LaTeX packages.
  - Sub-50ms keystroke-to-preview latency with debounced auto-compile.

- **💻 Monaco Code Editor**
  - Full-featured IDE experience (syntax highlighting, bracket matching, minimap, multi-cursor).
  - Quick-insert toolbars for mathematical symbols, greek letters, matrix templates, and structural tags.

- **🤖 AI Scientific Writing Assistant & Local LLM**
  - Proofread and refine academic tone for clarity and conciseness.
  - Natural-language LaTeX math formula generator.
  - Automated abstract summarizer and BibTeX citation formatting.
  - Supports self-hosted **Ollama / vLLM** endpoints (100% offline & GDPR compliant) alongside OpenAI and Google Gemini.

- **📝 Peer Review & Change Tracking**
  - In-line change proposals with diff visualization.
  - One-click accept or reject of suggested edits.
  - Status tracking for collaborative reviews.

- **📁 Multi-File Project Management**
  - Create and manage modular `.tex` chapters, `references.bib`, and preamble configurations.
  - Multi-file project compilation and file tree navigation.

- **📄 Export & Download Options**
  - High-resolution PDF export (A4 paper formatting).
  - Single-click `.tex` source download and full `.zip` project bundling.

- **📚 Standard Academic Publication Templates**
  - **IEEE Conference / Journal Paper** (two-column IEEEtran layout).
  - **ACM Conference Proceedings** (acmart / sigconf layout with CCS concepts & ACM reference format).
  - **Standard Academic Research Article & Preprint** (clean single-column research layout).
  - **Master's Thesis / Dissertation** (academic book/report structure).
  - **Beamer Modern Presentation Slides** (16:9 widescreen presentation layout).
  - **Academic CV & Resume** (modern curriculum vitae for researchers).
  - **University Exam & Homework Template** (custom header and problem boxes).

- **🐳 On-Premises & Production Ready**
  - Multi-stage Alpine Dockerfile with production Nginx reverse proxy.
  - Docker Compose configuration ready for one-command self-hosting.
  - Full on-premises customization modal for server URLs, compilation backends, and storage.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (version 20 or higher recommended)
- `npm` (version 10 or higher)

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/pittigs/opentex.git
   cd opentex
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

---

## 🐳 Running with Docker

Deploy OpenTeX locally or on your server using Docker:

### Using Docker Compose (Recommended)
```bash
docker compose up -d --build
```
Access the application at `http://localhost:8080`.

### Using Plain Docker
```bash
# Build the production image
docker build -t opentex:latest .

# Run container
docker run -d -p 8080:80 --name opentex-app opentex:latest
```

---

## 🛠️ Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Starts Vite development server with Hot Module Replacement (HMR) |
| `npm run build` | Runs TypeScript type checking and builds the production bundle |
| `npm run typecheck` | Validates TypeScript types across the project |
| `npm run lint` | Lints source files using ultra-fast Oxlint |
| `npm run preview` | Previews the production build locally |

---

## 📂 Project Structure

```
opentex/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI pipeline
├── public/                      # Static web assets
├── src/
│   ├── assets/                  # Icons and images
│   ├── components/
│   │   ├── editor/              # Monaco editor wrapper & math toolbars
│   │   ├── layout/              # Navbar, Sidebar, and Console Drawers
│   │   ├── preview/             # KaTeX live document & PDF renderer
│   │   ├── review/              # Peer review & diff tracking panel
│   │   └── tools/               # AI Writing Assistant and export utilities
│   ├── services/
│   │   ├── compilerService.ts   # LaTeX compilation & engine simulator
│   │   ├── exportService.ts     # PDF, ZIP, and TeX generation
│   │   └── latexParser.ts       # AST & syntax parsing for KaTeX rendering
│   ├── templates/
│   │   └── latexTemplates.ts    # IEEE, Thesis, and Exam templates
│   ├── types/
│   │   └── index.ts             # TypeScript interface definitions
│   ├── App.tsx                  # Main IDE layout and state management
│   ├── main.tsx                 # Application entry point
│   └── index.css                # Global styling & Tailwind directives
├── Dockerfile                   # Multi-stage production container
├── docker-compose.yml           # Self-hosting orchestration
├── package.json                 # Project dependencies & metadata
└── vite.config.ts               # Vite bundler configuration
```

---

## 🤝 Contributing

Contributions are welcome! If you'd like to help improve OpenTeX:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'feat: add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

Please make sure that `npm run lint` and `npm run typecheck` pass before submitting.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.
