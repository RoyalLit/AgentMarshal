import React from 'react';
import { ShieldCheck, Plus, RefreshCw, Layers, Sparkles } from 'lucide-react';

interface HeaderProps {
  projectPath: string;
  activeLockCount: number;
  awaitingHandoffCount: number;
  onNewTaskClick: () => void;
  onRefreshClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  projectPath,
  activeLockCount,
  awaitingHandoffCount,
  onNewTaskClick,
  onRefreshClick,
}) => {
  return (
    <header className="glass-header sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
      {/* Brand & Project Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 p-[2px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">AgentMarshal</h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                v0.1.0-RUST
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              SQLite WAL Active — <span className="font-mono text-slate-300">{projectPath}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="hidden md:flex items-center gap-6 bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-slate-400">Active Locks:</span>
          <span className="text-sm font-bold text-white font-mono">{activeLockCount}</span>
        </div>
        <div className="w-px h-4 bg-slate-800"></div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-slate-400">Handoffs Pending:</span>
          <span className={`text-sm font-bold font-mono ${awaitingHandoffCount > 0 ? 'text-amber-400 animate-pulse' : 'text-white'}`}>
            {awaitingHandoffCount}
          </span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        <button onClick={onRefreshClick} className="btn-secondary text-xs" title="Refresh state from SQLite">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
        <button onClick={onNewTaskClick} className="btn-primary text-xs">
          <Plus className="w-4 h-4" />
          New Lock Task
        </button>
      </div>
    </header>
  );
};
