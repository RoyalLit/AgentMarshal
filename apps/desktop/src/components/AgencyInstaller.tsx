import React, { useState } from 'react';
import { Persona } from '../types';
import { Download, Check, Sparkles, CheckSquare, Square, Layers, Search, Eye, X, FileText } from 'lucide-react';

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
    Aider: false,
  });

  const [installedMap, setInstalledMap] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectingPersona, setInspectingPersona] = useState<Persona | null>(null);
  const [batchSuccessMsg, setBatchSuccessMsg] = useState<string | null>(null);

  const categories = ['All', 'Engineering', 'Security', 'Design & UX', 'Marketing & AEO', 'Testing & QA', 'Product & Management'];
  const toolList = [
    { name: 'Cursor', path: '.cursor/rules/' },
    { name: 'Claude Code', path: '.claudecode/rules/' },
    { name: 'Antigravity', path: '.agents/skills/' },
    { name: 'Windsurf', path: '.windsurfrules' },
    { name: 'OpenCode', path: '.opencode/agents/' },
    { name: 'Aider', path: '.aider.conf.yml' },
  ];

  const toggleTool = (toolName: string) => {
    setSelectedTools((prev) => ({ ...prev, [toolName]: !prev[toolName] }));
  };

  const handleInstallSingle = (personaId: string) => {
    setInstalledMap((prev) => ({ ...prev, [personaId]: true }));
  };

  const handleDownloadMarkdown = (persona: Persona) => {
    const markdownContent = `# ${persona.name}\n\n**Category**: ${persona.category}\n\n## Description\n${persona.description}\n\n## Capabilities & Rules\n- Enforce identity-driven execution.\n- Follow defensive security & zero-hallucination verification.\n- Deliver clean, production-grade output.\n`;
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = persona.file_name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleInstallAllCategory = () => {
    const targetPersonas = filteredPersonas;
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

  const filteredPersonas = personas.filter((p) => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-cyan-950/40 border-indigo-500/30 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                AI Agency Multi-Tool Installer ({personas.length} Agents)
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Select target AI environments (Cursor, Claude Code, Antigravity, Windsurf, OpenCode, Aider) and batch-install specialized persona rule sets directly into your project repo.
            </p>
          </div>

          <button onClick={handleInstallAllCategory} className="btn-primary text-xs py-2.5 px-5 shadow-indigo-500/30">
            <Download className="w-4 h-4" />
            Install Filtered ({filteredPersonas.length}) Agents
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

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search 130+ personas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Persona Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPersonas.map((persona) => {
          const isInstalled = installedMap[persona.id];

          return (
            <div
              key={persona.id}
              className={`glass-panel p-4 flex flex-col justify-between space-y-3 transition-all ${
                isInstalled ? 'border-emerald-500/30 bg-emerald-950/10' : 'hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-900 text-cyan-400 uppercase tracking-wider border border-cyan-500/20">
                    {persona.category}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">{persona.rules_count} Rules</span>
                </div>

                <h3 className="text-sm font-bold text-white mb-1">{persona.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-3">{persona.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => setInspectingPersona(persona)}
                  className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 font-mono"
                  title="Inspect persona prompt"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadMarkdown(persona)}
                    className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                    title="Download .md persona file"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>

                  {isInstalled ? (
                    <button
                      disabled
                      className="btn-secondary text-xs py-1 px-2.5 cursor-default text-emerald-400 border-emerald-500/30 bg-emerald-950/20"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Installed
                    </button>
                  ) : (
                    <button onClick={() => handleInstallSingle(persona.id)} className="btn-secondary text-xs py-1 px-2.5">
                      <Download className="w-3.5 h-3.5" />
                      Install
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspect Persona Modal */}
      {inspectingPersona && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">{inspectingPersona.name}</h3>
                  <span className="text-[10px] text-cyan-400 uppercase font-mono">{inspectingPersona.category}</span>
                </div>
              </div>
              <button onClick={() => setInspectingPersona(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs font-sans">
              <div>
                <h4 className="font-semibold text-slate-300 mb-1">Description</h4>
                <p className="text-slate-400 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  {inspectingPersona.description}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-300 mb-1">Target Compatibility</h4>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {inspectingPersona.installed_tools.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-slate-900 text-indigo-300 border border-indigo-500/20 font-mono text-[10px]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-300 mb-1">Rule Constraints & System Prompt Preview</h4>
                <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 whitespace-pre-wrap">
                  {`---
name: ${inspectingPersona.name}
category: ${inspectingPersona.category}
description: ${inspectingPersona.description}
---

# Identity & Mission
You are the ${inspectingPersona.name}. Your mission is to execute specialized tasks with identity-driven rigor and proven engineering contracts.

## Key Rules & Constraints
1. Enforce strict parameter validation and type safety.
2. Prevent code smell, silent swallows, and arbitrary fallback values.
3. Deliver comprehensive unit tests and automated verification steps.`}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button onClick={() => handleDownloadMarkdown(inspectingPersona)} className="btn-secondary text-xs">
                <Download className="w-3.5 h-3.5" /> Download .md File
              </button>

              <button
                onClick={() => {
                  handleInstallSingle(inspectingPersona.id);
                  setInspectingPersona(null);
                }}
                className="btn-primary text-xs"
              >
                <Check className="w-4 h-4" /> Install to Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
