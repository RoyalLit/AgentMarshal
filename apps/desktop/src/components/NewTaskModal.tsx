import React, { useState } from 'react';
import { Agent } from '../types';
import { X, Lock, Play, FolderTree, FileCode, Clock } from 'lucide-react';

interface NewTaskModalProps {
  agents: Agent[];
  onClose: () => void;
  onSubmitTask: (agentId: string, path: string, task: string, isDir: boolean, ttl: number) => void;
}

export const NewTaskModal: React.FC<NewTaskModalProps> = ({ agents, onClose, onSubmitTask }) => {
  const [selectedAgent, setSelectedAgent] = useState(agents[0]?.id || 'antigravity');
  const [targetPath, setTargetPath] = useState('crates/orchestrator-core/src');
  const [taskPrompt, setTaskPrompt] = useState('');
  const [isDir, setIsDir] = useState(true);
  const [ttlMinutes, setTtlMinutes] = useState(15);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPath.trim()) {
      setErrorMsg('Please specify a target path');
      return;
    }
    if (!taskPrompt.trim()) {
      setErrorMsg('Please enter a task description');
      return;
    }
    setErrorMsg(null);
    onSubmitTask(selectedAgent, targetPath, taskPrompt, isDir, ttlMinutes);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-lg p-6 space-y-5 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Acquire Lock & Start Session</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            🛑 {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Agent Picker */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Select Agent Tool</label>
            <div className="grid grid-cols-3 gap-2">
              {agents.map((ag) => (
                <button
                  type="button"
                  key={ag.id}
                  onClick={() => setSelectedAgent(ag.id)}
                  className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                    selectedAgent === ag.id
                      ? 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="font-bold text-sm">{ag.name}</span>
                  <span className="text-[10px] text-slate-500 uppercase">{ag.invocation_mode}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Target Path */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Target Path to Lock</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={targetPath}
                onChange={(e) => setTargetPath(e.target.value)}
                placeholder="e.g. src/api or src/utils.ts"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setIsDir(!isDir)}
                className={`p-2 rounded-lg border flex items-center gap-1 font-mono text-[11px] whitespace-nowrap ${
                  isDir
                    ? 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300'
                    : 'border-slate-800 bg-slate-900 text-slate-400'
                }`}
              >
                {isDir ? <FolderTree className="w-3.5 h-3.5" /> : <FileCode className="w-3.5 h-3.5" />}
                {isDir ? 'DIRECTORY' : 'FILE'}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Directory locks automatically cascade and protect all files & subdirectories inside.
            </p>
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Task Description / Instructions</label>
            <textarea
              rows={3}
              value={taskPrompt}
              onChange={(e) => setTaskPrompt(e.target.value)}
              placeholder="Describe the task the agent will execute while holding this lock..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* TTL Slider */}
          <div>
            <div className="flex items-center justify-between text-slate-300 mb-1">
              <span className="font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Lock TTL (Time-To-Live)
              </span>
              <span className="font-mono text-amber-400 font-bold">{ttlMinutes} Minutes</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={ttlMinutes}
              onChange={(e) => setTtlMinutes(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Play className="w-4 h-4" />
              Acquire Lock & Start
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
