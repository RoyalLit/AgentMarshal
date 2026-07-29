import React from 'react';
import { Agent, Lock, Session } from '../types';
import { Copy, CheckCircle2, Unlock, Clock, AlertTriangle, Cpu, Terminal } from 'lucide-react';

interface SessionsViewProps {
  sessions: Session[];
  locks: Lock[];
  agents: Agent[];
  onConfirmSession: (sessionId: string) => void;
  onReleaseLock: (sessionId: string) => void;
}

export const SessionsView: React.FC<SessionsViewProps> = ({
  sessions,
  locks,
  agents,
  onConfirmSession,
  onReleaseLock,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyPrompt = (session: Session) => {
    if (session.instruction_text) {
      navigator.clipboard.writeText(session.instruction_text);
      setCopiedId(session.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            Active Agent Sessions & Handoffs
          </h2>
          <p className="text-xs text-slate-400">
            Sessions currently holding exclusive path locks. Headless sessions auto-release; manual sessions await explicit confirmation.
          </p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-semibold text-slate-200">No Active Locks Held</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            All paths are clear. Click "New Lock Task" above to acquire a lock and dispatch an agent session safely.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sessions.map((session) => {
            const agent = agents.find((a) => a.id === session.agent_id);
            const lock = locks.find((l) => l.session_id === session.id);
            const isAwaiting = session.status === 'awaiting_handoff';

            return (
              <div
                key={session.id}
                className={`glass-panel p-5 transition-all duration-200 border-l-4 ${
                  isAwaiting ? 'border-l-amber-500 bg-amber-950/10' : 'border-l-indigo-500'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow"
                      style={{ backgroundColor: agent?.avatar_color || '#6366F1' }}
                    >
                      {agent?.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-base">{agent?.name}</span>
                        {isAwaiting ? (
                          <span className="badge badge-amber">
                            <AlertTriangle className="w-3 h-3" /> Awaiting Handoff
                          </span>
                        ) : (
                          <span className="badge badge-indigo">
                            <Cpu className="w-3 h-3 animate-spin" /> Running Headless
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-cyan-400 mt-0.5 flex items-center gap-1.5">
                        <span className="text-slate-500">Target Path:</span> {session.path}
                        {lock && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                            {lock.scope.toUpperCase()} LOCK
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Started {session.started_at}</span>
                    </div>
                    {lock && (
                      <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-md font-mono text-xs">
                        <span className="text-slate-500">TTL Expires:</span>{' '}
                        <span className="text-amber-400 font-bold">{lock.expires_at.split(' ')[1]}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Task Description */}
                <div className="py-3">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Task Prompt</p>
                  <p className="text-sm text-slate-200 bg-slate-900/50 p-3 rounded-lg border border-slate-800/80">
                    {session.task}
                  </p>
                </div>

                {/* Handoff Instructions Box (if manual) */}
                {session.instruction_text && (
                  <div className="mt-2 bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-mono text-xs text-slate-300">
                    <div className="flex items-center justify-between mb-1.5 text-slate-400 font-sans text-xs">
                      <span className="flex items-center gap-1 font-semibold text-amber-400">
                        <Terminal className="w-3.5 h-3.5" /> Manual Handoff Prompt & Instruction
                      </span>
                      <button
                        onClick={() => handleCopyPrompt(session)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        {copiedId === session.id ? 'Copied!' : 'Copy Prompt'}
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap break-all text-emerald-400 text-[11px]">
                      {session.instruction_text}
                    </pre>
                  </div>
                )}

                {/* Footer Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">Session ID: {session.id}</span>

                  <div className="flex items-center gap-2">
                    <button onClick={() => onReleaseLock(session.id)} className="btn-danger text-xs">
                      <Unlock className="w-3.5 h-3.5" />
                      Force Release Lock
                    </button>
                    {isAwaiting && (
                      <button onClick={() => onConfirmSession(session.id)} className="btn-primary text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        Confirm Task Done
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
