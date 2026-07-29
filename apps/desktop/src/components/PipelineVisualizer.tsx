import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const PipelineVisualizer: React.FC = () => {
  const steps = [
    {
      role: 'Product Manager',
      dept: 'Product',
      desc: 'Defines feature specs, user stories, acceptance criteria, and MoSCoW priorities.',
      color: 'border-l-indigo-500',
      badge: 'badge-indigo',
    },
    {
      role: 'UX Architect',
      dept: 'Design & UX',
      desc: 'Creates CSS layout system, responsive container tokens, and accessible component specs.',
      color: 'border-l-cyan-500',
      badge: 'badge-indigo',
    },
    {
      role: 'Frontend / Backend Dev',
      dept: 'Engineering',
      desc: 'Implements production code, API endpoints, database queries, and unit test suites.',
      color: 'border-l-emerald-500',
      badge: 'badge-emerald',
    },
    {
      role: 'AppSec Engineer',
      dept: 'Security',
      desc: 'Performs threat modeling, SAST/DAST verification, OWASP checks, and secret leak audits.',
      color: 'border-l-rose-500',
      badge: 'badge-rose',
    },
    {
      role: 'Reality & Evidence QA',
      dept: 'Testing & QA',
      desc: 'Executes build checks, verifies empirical test outputs, and enforces zero-hallucination sign-off.',
      color: 'border-l-amber-500',
      badge: 'badge-amber',
    },
  ];

  return (
    <div className="glass-panel p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Multi-Agent Workflow & Handoff Pipeline
        </h2>
        <p className="text-xs text-slate-400">
          How specialized AI agency personas collaborate sequentially across departments to deliver end-to-end software features safely.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {steps.map((step, idx) => (
          <React.Fragment key={step.role}>
            <div className={`glass-panel p-4 flex flex-col justify-between border-l-4 ${step.color} bg-slate-900/60`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    Step 0{idx + 1}
                  </span>
                  <span className={`badge ${step.badge}`}>{step.dept}</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5">{step.role}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-800 flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Hand-off Ready
              </div>
            </div>

            {idx < steps.length - 1 && (
              <div className="hidden lg:flex items-center justify-center text-slate-600">
                <ArrowRight className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
