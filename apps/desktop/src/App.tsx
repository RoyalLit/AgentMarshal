import { useState } from 'react';
import { departmentCatalog, initialLocks, initialSessions, initialEvents, initialAgents } from './mockData';
import { Agent, Lock, Session, Event } from './types';
import { Header } from './components/Header';
import { AgencyInstaller } from './components/AgencyInstaller';
import { PipelineVisualizer } from './components/PipelineVisualizer';
import { SessionsView } from './components/SessionsView';
import { LockTreeView } from './components/LockTreeView';
import { AuditLogView } from './components/AuditLogView';
import { NewTaskModal } from './components/NewTaskModal';
import { Sparkles, Cpu, ShieldAlert, History, Workflow } from 'lucide-react';

export function App() {
  const [agents] = useState<Agent[]>(initialAgents);
  const [locks, setLocks] = useState<Lock[]>(initialLocks);
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [activeTab, setActiveTab] = useState<'agency' | 'pipeline' | 'sessions' | 'locktree' | 'audit'>('agency');
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  const awaitingHandoffCount = sessions.filter((s) => s.status === 'awaiting_handoff').length;

  const handleConfirmSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setLocks((prev) => prev.filter((l) => l.session_id !== sessionId));

    if (session) {
      const newEvt: Event = {
        id: Date.now(),
        ts: new Date().toISOString().replace('T', ' ').substring(0, 19),
        event_type: 'handoff_confirmed',
        session_id: sessionId,
        agent_id: session.agent_id,
        path: session.path,
        details: 'Confirmed finished by human operator',
      };
      setEvents((prev) => [newEvt, ...prev]);
    }
  };

  const handleReleaseLock = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setLocks((prev) => prev.filter((l) => l.session_id !== sessionId));

    if (session) {
      const newEvt: Event = {
        id: Date.now(),
        ts: new Date().toISOString().replace('T', ' ').substring(0, 19),
        event_type: 'lock_released',
        session_id: sessionId,
        agent_id: session.agent_id,
        path: session.path,
        details: 'Manual force release override',
      };
      setEvents((prev) => [newEvt, ...prev]);
    }
  };

  const handleSubmitTask = (agentId: string, path: string, task: string, isDir: boolean, ttl: number) => {
    const newSessionId = `sess-${Math.random().toString(36).substring(2, 8)}`;
    const agent = agents.find((a) => a.id === agentId);
    const isManual = agent?.invocation_mode === 'manual';

    const newSession: Session = {
      id: newSessionId,
      agent_id: agentId,
      path,
      task,
      status: isManual ? 'awaiting_handoff' : 'running',
      started_at: 'Just now',
      instruction_text: isManual
        ? `👉 Lock acquired on '${path}'. Open ${agent?.name} editor, complete task: '${task}'. When finished, execute:\n  agentmarshal confirm ${newSessionId}`
        : `Automated headless runner: claude -p "${task}"`,
    };

    const newLock: Lock = {
      id: Date.now(),
      path,
      scope: isDir ? 'dir' : 'file',
      agent_id: agentId,
      session_id: newSessionId,
      acquired_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      expires_at: new Date(Date.now() + ttl * 60000).toISOString().replace('T', ' ').substring(0, 19),
      ttl_minutes: ttl,
    };

    const newEvt: Event = {
      id: Date.now(),
      ts: new Date().toISOString().replace('T', ' ').substring(0, 19),
      event_type: 'lock_acquired',
      session_id: newSessionId,
      agent_id: agentId,
      path,
      details: `Scope: ${isDir ? 'dir' : 'file'} | TTL: ${ttl} mins`,
    };

    setSessions((prev) => [newSession, ...prev]);
    setLocks((prev) => [newLock, ...prev]);
    setEvents((prev) => [newEvt, ...prev]);
    setIsNewTaskOpen(false);
    setActiveTab('sessions');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        projectPath="/Users/pahul/SourceCodes/AgentMarshal"
        activeLockCount={locks.length}
        awaitingHandoffCount={awaitingHandoffCount}
        onNewTaskClick={() => setIsNewTaskOpen(true)}
        onRefreshClick={() => {}}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('agency')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'agency'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            AI Agency Installer ({departmentCatalog.length})
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'pipeline'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Workflow className="w-4 h-4 text-cyan-400" />
            Workflow Pipeline
          </button>

          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'sessions'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" />
            Active Sessions ({sessions.length})
          </button>

          <button
            onClick={() => setActiveTab('locktree')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'locktree'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            Lock Tree Map
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'audit'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            Audit Event Log ({events.length})
          </button>
        </div>

        {/* Active Tab View */}
        {activeTab === 'agency' && <AgencyInstaller personas={departmentCatalog} />}

        {activeTab === 'pipeline' && <PipelineVisualizer />}

        {activeTab === 'sessions' && (
          <SessionsView
            sessions={sessions}
            locks={locks}
            agents={agents}
            onConfirmSession={handleConfirmSession}
            onReleaseLock={handleReleaseLock}
          />
        )}

        {activeTab === 'locktree' && <LockTreeView locks={locks} agents={agents} />}

        {activeTab === 'audit' && <AuditLogView events={events} />}
      </main>

      {/* New Task Wizard Modal */}
      {isNewTaskOpen && (
        <NewTaskModal
          agents={agents}
          onClose={() => setIsNewTaskOpen(false)}
          onSubmitTask={handleSubmitTask}
        />
      )}
    </div>
  );
}
