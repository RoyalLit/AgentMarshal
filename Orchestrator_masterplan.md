# Multi-Agent Orchestrator — Masterplan

## What this is
A tool that lets a developer run multiple AI coding agents (opencode, Claude Code,
Antigravity, etc.) against the same codebase safely — enforcing "only one agent
touches a given file/dir at a time" — and gives visibility into who's doing what.

Two-part product:
- **CLI** — the real engine. Owns state, locks, agent dispatch. Fully usable
  standalone, scriptable, CI-friendly.
- **Desktop app** — control surface on top of the CLI. Visual dashboard +
  installer convenience. Never contains orchestration logic itself; it's a
  read-only view over CLI state plus a thin wrapper that shells out to the
  same CLI commands a terminal user would run.

Built first for the author's own workflow (opencode as primary editor,
Claude Code for isolated review/testing, Antigravity for implementation,
strict rule against running multiple tools concurrently on the same files),
then packaged as a product for others.

## Why / competitive framing
Reference point: [agency-agents](https://github.com/msitarzewski/agency-agents)
— a large library of agent persona `.md` files + a cross-platform installer
app that copies personas into various tools' config directories. It's a
**content distribution** tool: no lock mechanism, no session-state engine,
no coordination between agents. One human manually activates one persona in
one tool at a time.

Decision: don't compete on persona breadth or install polish — that's
commodity territory now. Interoperate with agency-agents' persona `.md`
format rather than reinventing it (CLI's `install` command can point at an
existing agency-agents install or any compatible directory as a persona
source). Put all real engineering effort into the orchestration engine —
locks, session state, handoff automation — which nobody else in this space
has built. That's the product's actual differentiation.

## v1 scope
- **Both** install (agent configs/rules/MCP servers into a target repo) and
  orchestrate (coordinate agents during live work sessions)
- Support opencode, Claude Code, and Antigravity at launch
- Desktop app is the primary/easiest interface; CLI does the actual
  orchestration and can be used standalone

## Agent invocation model
Per-agent adapter interface: `dispatch(task)`, `checkStatus()`, `isComplete()`.

- **Claude Code**: real headless/programmatic invocation (`claude -p`,
  JSON output) — the CLI drives it directly.
- **opencode / Antigravity**: guided manual handoff. The CLI owns the state
  machine (locks, session log, whose turn it is) but doesn't drive the agent
  itself. It prints/displays the exact instruction ("Antigravity is now
  unlocked on `/src/api`, open it and run: [task]") and waits for an
  explicit completion signal from the human (`orchestrator confirm
  <session-id>`) — not filesystem watching, which is too unreliable to
  trust as a trigger.

Same CLI commands and same UI shape across all three agents. Upgrading
opencode/Antigravity to full headless later (if/when they expose one) is
additive, not a rearchitecture.

## State & lock design

### Storage: SQLite (WAL mode), not JSON files
Multiple processes (CLI invocations + desktop app) read/write the same
state, sometimes concurrently. JSON-on-disk races and corrupts under that;
SQLite in WAL mode gives safe concurrent access + transactions, which locks
require. Lives at `.orchestrator/state.db` per project.

### Schema
```sql
agents (
  id TEXT PRIMARY KEY,
  name TEXT,                 -- "claude-code", "opencode", "antigravity"
  invocation_mode TEXT,      -- "headless" | "manual"
  status TEXT                -- "idle" | "active" | "awaiting_handoff"
)

locks (
  id INTEGER PRIMARY KEY,
  path TEXT NOT NULL,        -- file or directory path
  scope TEXT,                -- "file" | "dir" (dir locks cascade to contents)
  agent_id TEXT REFERENCES agents(id),
  session_id TEXT REFERENCES sessions(id),
  acquired_at TIMESTAMP,
  expires_at TIMESTAMP,      -- TTL, see below
  UNIQUE(path)
)

sessions (
  id TEXT PRIMARY KEY,
  agent_id TEXT REFERENCES agents(id),
  task TEXT,
  status TEXT,                -- "running" | "awaiting_handoff" | "completed" | "failed" | "abandoned"
  started_at TIMESTAMP,
  ended_at TIMESTAMP
)

events (                      -- append-only audit log, never updated
  id INTEGER PRIMARY KEY,
  ts TIMESTAMP,
  event_type TEXT,           -- lock_acquired, lock_released, lock_expired,
                              -- session_start, session_end, handoff_requested,
                              -- handoff_confirmed, conflict_rejected
  session_id TEXT,
  agent_id TEXT,
  path TEXT,
  details TEXT
)
```

### Lock semantics
- **Exclusive-only in v1** — no shared/read locks. Matches the existing
  no-concurrent-tools-on-same-files rule exactly; don't build complexity
  that isn't needed yet.
- **Directory locks cascade** — locking `/src/api` blocks any lock request
  on `/src/api/routes.ts`. Path-prefix check on acquire.
- **Conflict = fail fast, not queue**, in v1. A blocked request gets an
  immediate rejection with who holds the lock, since when, and what task —
  no scheduler, no silent queueing of a human's task.
- **TTL + heartbeat, not indefinite locks.** Manual-handoff sessions can be
  abandoned (closed terminal, forgotten task) with nothing to detect it.
  Every lock has `expires_at`; headless sessions renew it automatically on
  each internal step; manual sessions renew it whenever `status`/`confirm`
  touches that session. No renewal within the TTL window (default 15 min,
  configurable) → auto-expire, log `lock_expired`, path freed.

### Manual-handoff flow (opencode, Antigravity)
1. CLI acquires lock, creates session, prints task + explicit instruction
2. Session status → `awaiting_handoff`
3. Human runs `orchestrator confirm <session-id>` when done — authoritative
   completion signal
4. Confirm releases lock, marks session `completed`, logs event

## CLI command reference

All commands operate on the `.orchestrator/state.db` in the current project
root (or nearest ancestor containing one — same discovery pattern as
`.git`). Exit code `0` = success, non-zero = failure; all commands support
`--json` for machine-readable output (the desktop app always uses this).

### `orchestrator init`
Creates `.orchestrator/state.db` in the current directory, registers
detected agent tools (opencode/Claude Code/Antigravity configs found in the
repo or user config dirs).
- Flags: `--agent <name>` (register a specific agent instead of
  auto-detecting), `--persona-source <path>` (point at an agency-agents-
  compatible persona directory)
- Output: list of registered agents and their invocation mode

### `orchestrator lock <path>`
Attempts to acquire an exclusive lock on a file or directory.
- Flags: `--agent <name>` (required), `--task "<description>"` (required),
  `--ttl <minutes>` (default 15)
- Success: creates a `sessions` row (`status: running` for headless,
  `awaiting_handoff` for manual), creates the `locks` row, logs
  `lock_acquired`, prints session ID
- Conflict: exits non-zero, prints holder agent, task, and time held;
  does not queue
- For headless agents (Claude Code today), `lock` immediately proceeds to
  dispatch — see `run` below; for manual agents it stops here and prints
  the handoff instruction

### `orchestrator run <session-id>`
Dispatches the task to a headless agent adapter (Claude Code only in v1).
Not used for manual-mode agents — `lock` already prints their instruction.
- Streams agent output; on completion, releases the lock, marks session
  `completed` (or `failed` on nonzero agent exit), logs `session_end`

### `orchestrator confirm <session-id>`
Manual-mode completion signal. Releases the lock, marks session
`completed`, logs `handoff_confirmed`.
- Flags: `--failed` (mark `failed` instead of `completed`, lock still
  released — a failed task shouldn't hold a path hostage)

### `orchestrator status`
Lists all active locks, their holder, task, age, and TTL remaining.
- Flags: `--path <path>` (filter to locks affecting one path/subtree),
  `--agent <name>`

### `orchestrator release <session-id>`
Manual override to force-release a lock without going through `confirm`
(e.g. the human decides to abandon a task). Logs `lock_released` with
`details: "manual override"`.

### `orchestrator log`
Prints the `events` table, most recent first.
- Flags: `--since <duration>`, `--session <session-id>`, `--path <path>`

### `orchestrator install --tool <name>`
Installs agent config/rules/MCP server registration for the named tool
into the current repo (the "install" half of v1 scope). Optionally pulls
persona `.md` files from `--persona-source`.

## Desktop app — screens

Read-only over CLI state + thin wrapper that shells out to the CLI commands
above. No orchestration logic lives in the app itself.

1. **Project picker** — list of known `.orchestrator/`-initialized repos
   (recently opened), + "open folder" to add one; runs `init` if none
   exists yet.

2. **Dashboard (home)** — the core screen. Per active session: agent name,
   task description, path(s) locked, elapsed time, TTL countdown, status
   badge (running / awaiting_handoff / idle). One-click "Confirm done" on
   awaiting_handoff sessions (shells to `confirm`), "Force release" on any
   (shells to `release`).

3. **Lock tree view** — the project's file tree with locked paths
   highlighted, colored by which agent holds them. Answers "what's locked
   right now" visually instead of as a list — useful once a repo has many
   concurrent sessions.

4. **New task** — form: pick agent, pick/type target path, task
   description, TTL override. Submits via `lock` (+ `run` if headless).
   Surfaces the handoff instruction text directly if manual-mode, with a
   copy button.

5. **History / event log** — the `events` table, filterable by agent,
   path, date range. Mirrors `orchestrator log --json`.

6. **Agent setup** — list of detected/registered agents, install status
   per tool, persona source configuration, "install" button per tool
   (shells to `install --tool`).

7. **Settings** — default TTL, persona source path, per-project vs global
   agent registration.

## Open / next decisions
- CLI framework: leaning Rust or Go (single static binary, easy to bundle
  into the desktop app) over Node
- Desktop app framework: Tauri pairs naturally with a Rust CLI (shared
  code, no Electron bloat)
- Repo scaffolding — not yet started
