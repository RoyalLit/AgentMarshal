# AgentMarshal | Open-Source Multi-Agent AI Agency & Installer

[![Rust](https://img.shields.io/badge/Rust-1.75+-orange?style=flat-square&logo=rust)](https://www.rust-lang.org/)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24C8D5?style=flat-square&logo=tauri)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL--Mode-003B57?style=flat-square&logo=sqlite)](https://sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Open--Source-blue?style=flat-square)](https://github.com/RoyalLit/AgentMarshal)

**AgentMarshal** is an open-source, cross-platform (macOS, Windows, Linux) multi-agent orchestration engine and desktop application. It brings a complete digital agency of **132+ specialized AI coding personas** into your AI development environments (**Cursor**, **Claude Code**, **Antigravity**, **Windsurf**, **OpenCode**, and **Aider**).

---

## 🌟 Vision & Value Proposition

Generic AI prompts produce generic code. **AgentMarshal** replaces vague AI interactions with specialized, role-governed personas (Backend Architects, AppSec Engineers, Next.js 15 Architects, Solana Auditors, UX Architects, AEO Search Optimizers, Reality QA Checkers) that operate under strict input/output contracts and exclusive path concurrency guardrails.

### Key Value Pillars

- **🏛️ 132+ Specialized AI Personas**: 6 full departments providing tested system prompts, rule constraints, and execution workflows.
- **⚡ 1-Click Multi-Tool Installation**: Batch-install persona rule sets directly into `.cursor/rules/`, `.claudecode/rules/`, `.agents/skills/`, `.windsurfrules`, `.opencode/agents/`, and `.aider.conf.yml`.
- **🔍 Instant Search & Live Prompt Inspector**: Search, preview system prompts, and download `.md` persona prompt files directly from the UI.
- **🔒 Exclusive Path Concurrency Control**: Prevents multi-agent race conditions by enforcing Exclusive File/Directory Locks (`.orchestrator/state.db` in SQLite WAL mode).
- **🖥️ Native Cross-Platform Desktop UI**: Powered by **Tauri v2** and **React**, offering a lightweight, zero-bloat native GUI across macOS, Windows, and Linux.

---

## 🏛️ Agency Departments & Persona Ecosystem

AgentMarshal organizes 132+ personas into 6 core departments:

| Department | Personas Count | Core Focus & Deliverables |
| :--- | :---: | :--- |
| 💻 **Engineering** | 54 Personas | High-throughput backend architecture, Next.js 15 RSC, Agentic RAG, mobile app development, database optimization, DevOps pipelines, embedded firmware. |
| 🔒 **Security** | 11 Personas | Threat modeling, Solana Anchor smart contract audits, SAST/DAST verification, OWASP Top 10 mitigation, SOC 2 compliance auditing, incident response. |
| 🎨 **Design & UX** | 9 Personas | CSS layout systems, design tokens, dark mode glassmorphism, accessibility color palettes, micro-interactions, brand identity. |
| 🚀 **Marketing & AEO** | 31 Personas | AI Engine Optimization (`llms.txt`, AI-aware `robots.txt`), ChatGPT/Claude/Gemini search citations, CRO landing page optimization, growth hacking. |
| 🧪 **Testing & QA** | 9 Personas | WCAG 2.2 accessibility audits, Playwright E2E automation suites, REST/GraphQL API test generation, empirical evidence verification. |
| 📋 **Product & Strategy** | 18 Personas | Spec-to-user-story translation, MoSCoW sprint prioritization, decision routing, developer advocacy, custom MCP tool building. |

---

## 🛠️ Multi-Tool Installation Targets

AgentMarshal automatically parses markdown persona definitions and formats them for your target AI coding tool:

```mermaid
graph LR
    A[AgentMarshal Persona Library: 132+ Personas] -->|1-Click Install| B(Target AI Tools)
    B --> C[Cursor: .cursor/rules/*.mdc]
    B --> D[Claude Code: .claudecode/rules/*.md]
    B --> E[Antigravity: .agents/skills/*/SKILL.md]
    B --> F[Windsurf: .windsurfrules]
    B --> G[OpenCode: .opencode/agents/*.md]
    B --> H[Aider: .aider.conf.yml]
```

---

## 📖 Documentation & Persona Catalog

| Resource | Description |
| :--- | :--- |
| [**Architecture Specification**](./ARCHITECTURE.md) | Deep dive into SQLite DDL schemas, lock cascade algorithms, and `AgentAdapter` traits. |
| [**Masterplan**](./Orchestrator_masterplan.md) | Initial product vision, lock semantics, and state machine specification. |
| [**Persona Library Directory**](./personas/) | 132+ standalone Markdown persona files organized by department. |

---

## 💻 CLI & Desktop Setup

### Prerequisites
- **Node.js**: 18+ (`npm` or `pnpm`)
- **Rust Toolchain** *(for native CLI/Tauri builds)*: 1.75+ (`rustup default stable`)

### Building & Running the Desktop Application

```bash
# Clone the repository
git clone https://github.com/RoyalLit/AgentMarshal.git
cd AgentMarshal/apps/desktop

# Install dependencies
npm install

# Run frontend preview
npm run dev

# Run native Tauri Desktop App
npm run tauri dev
```

### CLI Command Reference (`agentmarshal`)

```bash
# List all 132 agency personas across 6 departments
agentmarshal list

# Batch-install personas into Cursor and Claude Code
agentmarshal install --tool cursor,claude

# Install specific backend & security agents into Antigravity
agentmarshal install --tool antigravity --agent backend-architect,appsec-engineer

# Inspect active path locks and installed personas
agentmarshal status
```

---

## 🤝 Contributing

AgentMarshal is an **open-source project** and welcomes contributions! Whether you're adding new agent personas, refining rule constraints, or expanding IDE target formats:

1. Fork the repository on GitHub.
2. Create a feature branch (`git checkout -b feature/new-persona`).
3. Commit your changes (`git commit -m 'feat: add WebAssembly Performance Engineer persona'`).
4. Push to the branch (`git push origin feature/new-persona`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
