import { Agent, Lock, Session, Event } from './types';
import { allSubagentsCatalog } from './allSubagentsCatalog';

export { allSubagentsCatalog as departmentCatalog };

export const initialAgents: Agent[] = [
  {
    id: 'antigravity',
    name: 'Antigravity',
    invocation_mode: 'manual',
    status: 'awaiting_handoff',
    avatar_color: '#38BDF8',
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    invocation_mode: 'headless',
    status: 'active',
    avatar_color: '#818CF8',
  },
  {
    id: 'opencode',
    name: 'opencode',
    invocation_mode: 'manual',
    status: 'idle',
    avatar_color: '#34D399',
  },
];

export const initialLocks: Lock[] = [
  {
    id: 1,
    path: 'crates/orchestrator-core/src/lock.rs',
    scope: 'file',
    agent_id: 'antigravity',
    session_id: 'sess-89a1f0',
    acquired_at: '2026-07-28 14:30:12',
    expires_at: '2026-07-28 14:45:12',
    ttl_minutes: 15,
  },
  {
    id: 2,
    path: 'apps/desktop/src/components',
    scope: 'dir',
    agent_id: 'claude-code',
    session_id: 'sess-42b7c9',
    acquired_at: '2026-07-28 14:38:00',
    expires_at: '2026-07-28 14:53:00',
    ttl_minutes: 15,
  },
];

export const initialSessions: Session[] = [
  {
    id: 'sess-89a1f0',
    agent_id: 'antigravity',
    path: 'crates/orchestrator-core/src/lock.rs',
    task: 'Refactor lock prefix evaluation logic to support recursive wildcard cascades',
    status: 'awaiting_handoff',
    started_at: '12 mins ago',
    instruction_text: `👉 Lock acquired on 'crates/orchestrator-core/src/lock.rs'. Open Antigravity agent, complete task: 'Refactor lock prefix evaluation logic'. When finished, execute:\n  agentmarshal confirm sess-89a1f0`,
  },
  {
    id: 'sess-42b7c9',
    agent_id: 'claude-code',
    path: 'apps/desktop/src/components',
    task: 'Build interactive Lock Tree View React component',
    status: 'running',
    started_at: '4 mins ago',
    instruction_text: 'Automated headless runner: claude -p "Build interactive Lock Tree View React component"',
  },
];

export const initialEvents: Event[] = [
  {
    id: 104,
    ts: '2026-07-28 14:38:00',
    event_type: 'lock_acquired',
    session_id: 'sess-42b7c9',
    agent_id: 'claude-code',
    path: 'apps/desktop/src/components',
    details: 'Scope: dir | TTL: 15 mins',
  },
  {
    id: 103,
    ts: '2026-07-28 14:35:10',
    event_type: 'conflict_rejected',
    session_id: 'sess-req-failed',
    agent_id: 'opencode',
    path: 'crates/orchestrator-core/src/lock.rs',
    details: 'Blocked by active lock sess-89a1f0 (Antigravity)',
  },
  {
    id: 102,
    ts: '2026-07-28 14:30:12',
    event_type: 'lock_acquired',
    session_id: 'sess-89a1f0',
    agent_id: 'antigravity',
    path: 'crates/orchestrator-core/src/lock.rs',
    details: 'Scope: file | TTL: 15 mins',
  },
  {
    id: 101,
    ts: '2026-07-28 14:15:00',
    event_type: 'handoff_confirmed',
    session_id: 'sess-11d9a2',
    agent_id: 'opencode',
    path: 'README.md',
    details: 'Task completed cleanly by human operator',
  },
];
