# AgentMarshal Technical Architecture & Design Specification

This document provides the formal architecture specification for **AgentMarshal**, covering state management, lock resolution mechanics, relational database schemas, agent adapter interfaces, and event logging.

---

## 1. Storage & State Management Model

AgentMarshal uses an embedded **SQLite** database per project, stored at `.orchestrator/state.db`.

### 1.1 Concurrency & Multi-Process Access
- **Write-Ahead Logging (WAL)**: Enabled on connection initialization via `PRAGMA journal_mode=WAL;`.
- **Busy Timeout**: Configured to `PRAGMA busy_timeout=5000;` (5 seconds) to prevent immediate `SQLITE_BUSY` errors when the Tauri UI and CLI invocations access the database simultaneously.
- **Transactions**: All lock acquisition, renewal, and release logic are wrapped in strict `IMMEDIATE` database transactions (`BEGIN IMMEDIATE`) to prevent race conditions during concurrent lock requests.

---

## 2. Database Schema Specification

```sql
-- Registered Agents in the system
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,             -- e.g. "claude-code", "opencode", "antigravity"
  name TEXT NOT NULL,               -- Display name
  invocation_mode TEXT NOT NULL,   -- "headless" | "manual"
  status TEXT NOT NULL DEFAULT 'idle' -- "idle" | "active" | "awaiting_handoff"
);

-- Active exclusive locks on files or directories
CREATE TABLE IF NOT EXISTS locks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  path TEXT NOT NULL UNIQUE,       -- Canonical normalized file or directory path
  scope TEXT NOT NULL,             -- "file" | "dir"
  agent_id TEXT NOT NULL REFERENCES agents(id),
  session_id TEXT NOT NULL REFERENCES sessions(id),
  acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL   -- Absolute TTL expiration timestamp
);

-- Orchestration Work Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,             -- UUID v4 session ID
  agent_id TEXT NOT NULL REFERENCES agents(id),
  task TEXT NOT NULL,              -- Natural language task prompt/description
  status TEXT NOT NULL,            -- "running" | "awaiting_handoff" | "completed" | "failed" | "abandoned"
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP
);

-- Append-only Audit Event Log
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  event_type TEXT NOT NULL,        -- lock_acquired, lock_released, lock_expired,
                                   -- session_start, session_end, handoff_requested,
                                   -- handoff_confirmed, conflict_rejected
  session_id TEXT,
  agent_id TEXT,
  path TEXT,
  details TEXT                     -- JSON string for extra contextual metadata
);
```

---

## 3. Lock Resolution & Cascade Algorithm

AgentMarshal enforces **Exclusive Locks** with **Cascading Directory Protection**.

### 3.1 Path Normalization
Before evaluating any lock request:
1. Relative paths are resolved against the project root.
2. Trailing slashes are stripped.
3. Path components are normalized (`.` and `..` resolved, canonicalized).

### 3.2 Conflict Evaluation Algorithm
When requesting a lock on target path $P_{target}$:

1. **Exact Match Check**: Is there an active lock on path $P_{active}$ where $P_{active} = P_{target}$?
   - If **yes**, collision occurs ($P_{target}$ is already locked).
2. **Directory Cascade (Ancestor) Check**: Is there an active lock on path $P_{active}$ where $P_{active}$ is an ancestor directory of $P_{target}$ (i.e. $P_{target}$ starts with $P_{active} + "/"` and $scope(P_{active}) = \text{"dir"}$)?
   - If **yes**, collision occurs ($P_{target}$ is inside a locked directory).
3. **Subtree (Descendant) Check**: Is there an active lock on path $P_{active}$ where $P_{target}$ is an ancestor directory of $P_{active}$ (i.e. $P_{active}$ starts with $P_{target} + "/"` and $scope(P_{target}) = \text{"dir"}$)?
   - If **yes**, collision occurs (cannot lock directory while a child file/subdirectory is locked).

If any check triggers a collision and the existing lock's `expires_at > NOW()`, lock acquisition is rejected immediately (**Fail-Fast**).

```
   Target Request: /src/api/routes.ts

   Case A (Ancestor Lock):
   Active Lock: /src/api (Scope: dir) ──► CONFLICT (Blocked by Ancestor)

   Case B (Exact Lock):
   Active Lock: /src/api/routes.ts    ──► CONFLICT (Blocked by Exact Match)

   Case C (Descendant Lock on Parent Target):
   Target Request: /src/api
   Active Lock: /src/api/routes.ts    ──► CONFLICT (Blocked by Descendant Child Lock)
```

---

## 4. TTL & Heartbeat Lifecycle

To prevent abandoned sessions (e.g. closed terminal or crashed process) from stranding locked files:

1. **Default TTL**: 15 minutes (`--ttl <minutes>`).
2. **Headless Sessions (*Claude Code*)**:
   - The CLI runner periodically touches the session record during execution steps, extending `expires_at = NOW() + TTL`.
3. **Manual Handoff Sessions (*opencode*, *Antigravity*)**:
   - Every CLI execution (`agentmarshal status`, `agentmarshal confirm`, etc.) runs a background cleanup query:
     ```sql
     DELETE FROM locks 
     WHERE expires_at <= CURRENT_TIMESTAMP;
     ```
   - Expired locks trigger an automatic `lock_expired` entry in the `events` table.

---

## 5. Agent Adapter Interface Spec

Agent adapters implement a common Rust trait:

```rust
pub enum InvocationMode {
    Headless,
    Manual,
}

pub struct HandoffInstruction {
    pub session_id: String,
    pub agent_id: String,
    pub path: String,
    pub task: String,
    pub instruction_text: String,
}

pub trait AgentAdapter: Send + Sync {
    /// Identifier of the agent (e.g. "claude-code", "opencode", "antigravity")
    fn id(&self) -> &str;
    
    /// Invocation mode (Headless vs Manual)
    fn mode(&self) -> InvocationMode;
    
    /// Dispatch task.
    /// For Headless: Executes subprocess (`claude -p`).
    /// For Manual: Generates handoff instruction text for user.
    fn dispatch(&self, session_id: &str, path: &str, task: &str) -> Result<HandoffInstruction, String>;
    
    /// Check execution status for headless agents.
    fn check_status(&self, session_id: &str) -> Result<String, String>;
}
```

---

## 6. Event Audit Log

Every state transition writes an immutable record to `events`:

| Event Type | Trigger |
| :--- | :--- |
| `lock_acquired` | Successfully granted a lock on file/directory |
| `lock_released` | Lock released via confirmation or manual override |
| `lock_expired` | Lock TTL lapsed without heartbeat renewal |
| `session_start` | Session initialized |
| `session_end` | Session marked completed or failed |
| `handoff_requested` | Manual handoff instruction generated and displayed |
| `handoff_confirmed` | User executed `agentmarshal confirm` |
| `conflict_rejected` | Lock request blocked due to existing lock collision |
