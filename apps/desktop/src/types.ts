export interface Agent {
  id: string;
  name: string;
  invocation_mode: 'headless' | 'manual';
  status: 'idle' | 'active' | 'awaiting_handoff';
  avatar_color: string;
}

export interface Lock {
  id: number;
  path: string;
  scope: 'file' | 'dir';
  agent_id: string;
  session_id: string;
  acquired_at: string;
  expires_at: string;
  ttl_minutes: number;
}

export interface Session {
  id: string;
  agent_id: string;
  path: string;
  task: string;
  status: 'running' | 'awaiting_handoff' | 'completed' | 'failed' | 'abandoned';
  started_at: string;
  instruction_text?: string;
}

export interface Event {
  id: number;
  ts: string;
  event_type: 'lock_acquired' | 'lock_released' | 'lock_expired' | 'session_start' | 'session_end' | 'handoff_requested' | 'handoff_confirmed' | 'conflict_rejected';
  session_id?: string;
  agent_id?: string;
  path?: string;
  details?: string;
}

export interface Persona {
  id: string;
  name: string;
  category: 'Engineering' | 'Security' | 'Marketing & AEO' | 'Design & UX' | 'Product' | 'Testing & QA' | 'Product & Management';
  description: string;
  installed_tools: string[];
  rules_count: number;
  file_name: string;
}
