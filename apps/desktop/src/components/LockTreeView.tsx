import React from 'react';
import { Lock, Agent } from '../types';
import { Folder, FileCode, Lock as LockIcon, ShieldAlert } from 'lucide-react';

interface LockTreeViewProps {
  locks: Lock[];
  agents: Agent[];
}

interface TreeNode {
  name: string;
  path: string;
  isDir: boolean;
  children?: TreeNode[];
  lock?: Lock;
}

const mockTree: TreeNode[] = [
  {
    name: 'crates',
    path: 'crates',
    isDir: true,
    children: [
      {
        name: 'orchestrator-core',
        path: 'crates/orchestrator-core',
        isDir: true,
        children: [
          {
            name: 'src',
            path: 'crates/orchestrator-core/src',
            isDir: true,
            children: [
              { name: 'lib.rs', path: 'crates/orchestrator-core/src/lib.rs', isDir: false },
              { name: 'db.rs', path: 'crates/orchestrator-core/src/db.rs', isDir: false },
              { name: 'lock.rs', path: 'crates/orchestrator-core/src/lock.rs', isDir: false },
              { name: 'agent.rs', path: 'crates/orchestrator-core/src/agent.rs', isDir: false },
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'apps',
    path: 'apps',
    isDir: true,
    children: [
      {
        name: 'desktop',
        path: 'apps/desktop',
        isDir: true,
        children: [
          {
            name: 'src',
            path: 'apps/desktop/src',
            isDir: true,
            children: [
              {
                name: 'components',
                path: 'apps/desktop/src/components',
                isDir: true,
                children: [
                  { name: 'Header.tsx', path: 'apps/desktop/src/components/Header.tsx', isDir: false },
                  { name: 'SessionsView.tsx', path: 'apps/desktop/src/components/SessionsView.tsx', isDir: false },
                ],
              },
              { name: 'App.tsx', path: 'apps/desktop/src/App.tsx', isDir: false },
            ],
          },
        ],
      },
    ],
  },
  { name: 'README.md', path: 'README.md', isDir: false },
  { name: 'ARCHITECTURE.md', path: 'ARCHITECTURE.md', isDir: false },
  { name: 'Orchestrator_masterplan.md', path: 'Orchestrator_masterplan.md', isDir: false },
];

export const LockTreeView: React.FC<LockTreeViewProps> = ({ locks, agents }) => {
  const getLockForPath = (path: string) => {
    return locks.find((l) => l.path === path);
  };

  const renderNode = (node: TreeNode, depth: number = 0) => {
    const activeLock = getLockForPath(node.path);
    const agent = activeLock ? agents.find((a) => a.id === activeLock.agent_id) : null;

    return (
      <div key={node.path} className="select-none">
        <div
          className={`flex items-center justify-between py-1.5 px-3 rounded-md transition-colors ${
            activeLock ? 'bg-indigo-950/40 border border-indigo-500/30' : 'hover:bg-slate-800/40'
          }`}
          style={{ paddingLeft: `${depth * 18 + 12}px` }}
        >
          <div className="flex items-center gap-2 text-xs">
            {node.isDir ? (
              <Folder className={`w-4 h-4 ${activeLock ? 'text-amber-400' : 'text-cyan-400'}`} />
            ) : (
              <FileCode className={`w-4 h-4 ${activeLock ? 'text-indigo-400' : 'text-slate-400'}`} />
            )}
            <span className={`font-mono ${activeLock ? 'font-bold text-white' : 'text-slate-300'}`}>
              {node.name}
            </span>
          </div>

          {activeLock && agent && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700 flex items-center gap-1">
                <LockIcon className="w-3 h-3 text-amber-400" />
                Locked by {agent.name}
              </span>
            </div>
          )}
        </div>

        {node.children && (
          <div className="space-y-0.5">{node.children.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            Project File Lock Tree
          </h2>
          <p className="text-xs text-slate-400">
            Visual map of directory cascades and active file locks across the repository.
          </p>
        </div>
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-1 max-h-[500px] overflow-y-auto">
        {mockTree.map((node) => renderNode(node, 0))}
      </div>
    </div>
  );
};
