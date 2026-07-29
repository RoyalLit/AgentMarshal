import React, { useState } from 'react';
import { Persona } from '../types';
import { Download, Check, Sparkles, CheckSquare, Square, Layers } from 'lucide-react';

interface AgencyInstallerProps {
  personas: Persona[];
}

export const AgencyInstaller: React.FC<AgencyInstallerProps> = ({ personas }) => {
  const [selectedTools, setSelectedTools] = useState<Record<string, boolean>>({
    Cursor: true,
    'Claude Code': true,
    Antigravity: true,
    Windsurf: false,
    OpenCode: false,
  });

  const [installedMap, setInstalledMap] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [batchSuccessMsg, setBatchSuccessMsg] = useState<string | null>(null);

  const categories = ['All', 'Engineering', 'Security', 'Design & UX', 'Marketing & AEO', 'Testing & QA', 'Product'];
  const toolList = [
    { name: 'Cursor', path: '.cursor/rules/' },
    { name: 'Claude Code', path: '.claudecode/rules/' },
    { name: 'Antigravity', path: '.agents/skills/' },
    { name: 'Windsurf', path: '.windsurfrules' },
    { name: 'OpenCode', path: '.opencode/agents/' },
  ];

  const toggleTool = (toolName: string) => {
    setSelectedTools((prev) => ({ ...prev, [toolName]: !prev[toolName] }));
  };

  const handleInstallSingle = (personaId: string) => {
    setInstalledMap((prev) => ({ ...prev, [personaId]: true }));
  };

  const handleInstallAllCategory = () => {
    const targetPersonas = activeCategory === 'All' ? personas : personas.filter((p) => p.category === activeCategory);
    const activeToolNames = Object.entries(selectedTools)
      .filter(([, active]) => active)
      .map(([name]) => name);

    if (activeToolNames.length === 0) {
      alert('Please select at least one target tool (e.g. Cursor, Claude Code, Antigravity).');
      return;
    }

    const updated: Record<string, boolean> = { ...installedMap };
    targetPersonas.forEach((p) => {
      updated[p.id] = true;
    });

    setInstalledMap(updated);
    setBatchSuccessMsg(
      `✅ Successfully installed ${targetPersonas.length} AI Agency personas into ${activeToolNames.join(', ')}!`
    );
    setTimeout(() => setBatchSuccessMsg(null), 4000);
  };

  const filteredPersonas =
    activeCategory === 'All' ? personas : personas.filter((p) => p.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-cyan-950/40 border-indigo-500/30 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-extrabold text-white tracking-tight">AI Agency Multi-Tool Installer</h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Modeled after <code className="text-cyan-400 font-mono">msitarzewski/agency-agents</code>. Select your AI development environments and install specialized persona rules directly into your project repo.
            </p>
          </div>

          <button onClick={handleInstallAllCategory} className="btn-primary text-xs py-2.5 px-5 shadow-indigo-500/30">
            <Download className="w-4 h-4" />
            Install Agency to Selected Tools
          </button>
        </div>

        {/* Target Tools Selector Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs">
          <span className="text-slate-400 font-semibold flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" /> Target Tools:
          </span>
          {toolList.map((t) => (
            <button
              key={t.name}
              onClick={() => toggleTool(t.name)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono transition-all ${
                selectedTools[t.name]
                  ? 'border-indigo-500 bg-indigo-950/50 text-indigo-300 font-bold'
                  : 'border-slate-800 bg-slate-900/50 text-slate-500 hover:text-slate-300'
              }`}
            >
              {selectedTools[t.name] ? (
                <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <Square className="w-3.5 h-3.5" />
              )}
              <span>{t.name}</span>
              <span className="text-[10px] text-slate-500 font-normal">({t.path})</span>
            </button>
          ))}
        </div>
      </div>

      {batchSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold animate-in fade-in">
          {batchSuccessMsg}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Persona Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPersonas.map((persona) => {
          const isInstalled = installedMap[persona.id];

          return (
            <div
              key={persona.id}
              className={`glass-panel p-5 flex flex-col justify-between space-y-4 transition-all ${
                isInstalled ? 'border-emerald-500/30 bg-emerald-950/10' : 'hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 text-cyan-400 uppercase tracking-wider border border-cyan-500/20">
                    {persona.category}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{persona.rules_count} Rules</span>
                </div>

                <h3 className="text-base font-bold text-white mb-1.5">{persona.name}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">{persona.description}</p>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-500 font-medium">Compatible:</span>
                  {persona.installed_tools.map((tool) => (
                    <span
                      key={tool}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">{persona.file_name}</span>

                {isInstalled ? (
                  <button disabled className="btn-secondary text-xs cursor-default text-emerald-400 border-emerald-500/30 bg-emerald-950/20">
                    <Check className="w-4 h-4 text-emerald-400" />
                    Installed
                  </button>
                ) : (
                  <button onClick={() => handleInstallSingle(persona.id)} className="btn-secondary text-xs">
                    <Download className="w-3.5 h-3.5" />
                    Install Persona
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
