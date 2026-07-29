import React, { useState } from 'react';
import { Event } from '../types';
import { History, Search, Filter } from 'lucide-react';

interface AuditLogViewProps {
  events: Event[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ events }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      (e.path && e.path.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.session_id && e.session_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.agent_id && e.agent_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.details && e.details.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedType === 'All' || e.event_type === selectedType;

    return matchesSearch && matchesType;
  });

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'lock_acquired':
        return 'badge-indigo';
      case 'handoff_confirmed':
      case 'lock_released':
        return 'badge-emerald';
      case 'conflict_rejected':
        return 'badge-rose';
      default:
        return 'badge-amber';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            Append-Only Audit Log
          </h2>
          <p className="text-xs text-slate-400">
            Immutable database log of all lock acquisitions, handoffs, expirations, and rejected collisions.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search path, session, agent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none"
            >
              <option value="All">All Events</option>
              <option value="lock_acquired">lock_acquired</option>
              <option value="handoff_confirmed">handoff_confirmed</option>
              <option value="conflict_rejected">conflict_rejected</option>
              <option value="lock_released">lock_released</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Event Type</th>
                <th className="p-3">Agent</th>
                <th className="p-3">Path</th>
                <th className="p-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 text-slate-500">#{evt.id}</td>
                  <td className="p-3 text-slate-400">{evt.ts}</td>
                  <td className="p-3 font-sans">
                    <span className={`badge ${getEventBadge(evt.event_type)}`}>{evt.event_type}</span>
                  </td>
                  <td className="p-3 text-cyan-400 font-bold">{evt.agent_id || '—'}</td>
                  <td className="p-3 text-white">{evt.path || '—'}</td>
                  <td className="p-3 text-slate-400 max-w-xs truncate">{evt.details || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
