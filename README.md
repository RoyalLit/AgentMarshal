# AgentMarshal — Full AI Agency System & Multi-Tool Installer

> Modeled after [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents)

**AgentMarshal** is a complete AI agency system and cross-platform desktop installer. It brings specialized, role-based AI coding agents (from **Frontend Wizards** to **AppSec Engineers**, from **AEO Architects** to **Reality Checkers**) into your favorite AI development tools: **Cursor**, **Claude Code**, **Antigravity**, **Windsurf**, **OpenCode**, and **Aider**.

---

## 🏛 Agency Departments

AgentMarshal provides specialized, tested agent personas organized into 6 core departments:

| Department | Key Personas | Target Output |
| :--- | :--- | :--- |
| 💻 **Engineering** | Backend Architect, Frontend Developer, Mobile Builder, DevOps Automator, Database Optimizer | Clean architecture, production code, CI/CD, SQL tuning |
| 🔒 **Security** | AppSec Engineer, Cloud Security Architect, Penetration Tester, Compliance Auditor | Vulnerability fixes, Threat models, SOC2/ISO audit rules |
| 🎨 **Design & UX** | UX Architect, UI Designer, Whimsy Injector, Brand Guardian | Design systems, CSS tokens, responsive layouts, micro-interactions |
| 🚀 **Marketing & AEO** | AEO Foundations Architect, AI Citation Strategist, Growth Hacker | `llms.txt`, AI Search Optimization, ChatGPT/Gemini visibility |
| 🧪 **Testing & QA** | Accessibility Auditor, API Tester, Reality Checker, Performance Benchmarker | WCAG 2.2 audits, REST API tests, zero-hallucination verification |
| 📋 **Product & Ops** | Product Manager, Sprint Prioritizer, Chief of Staff | User stories, MoSCoW sprint planning, decision routing |

---

## 🎯 Supported Tool Formats & Installation Paths

AgentMarshal automatically parses persona markdown files and formats them for your specific AI coding tool:

- **Cursor**: Installed as `.cursor/rules/<agent-id>.mdc` with frontmatter context rules.
- **Claude Code**: Installed as `.claudecode/rules/<agent-id>.md` or integrated into `CLAUDE.md`.
- **Antigravity / Gemini**: Installed as `.agents/skills/<agent-id>/SKILL.md`.
- **Windsurf**: Installed as `.windsurfrules` cascading rule definitions.
- **OpenCode**: Installed as `.opencode/agents/<agent-id>.md`.
- **Aider**: Installed into `.aider.conf.yml` & custom prompt directories.

---

## 🖥 Desktop App & CLI Usage

### CLI Commands (`agentmarshal`)
```bash
# List all departments & available agency personas
agentmarshal list

# Install the entire AI Agency into Cursor & Claude Code
agentmarshal install --tool cursor,claude

# Install specific personas into Antigravity
agentmarshal install --tool antigravity --agent backend-architect,appsec-engineer

# Check active installed agency personas in current project
agentmarshal status
```

### Desktop Application
Launch the Desktop UI app to browse departments visually, inspect agent persona prompt definitions, map multi-agent pipeline handoffs, and install personas into any target project with 1 click.

```bash
cd apps/desktop
npm run dev
# Open in browser: http://localhost:3000
```

---

## License

MIT License. See [LICENSE](file:///Users/pahul/SourceCodes/AgentMarshal/LICENSE) for details.
