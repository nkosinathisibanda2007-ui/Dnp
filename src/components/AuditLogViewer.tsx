import React, { useState, useEffect } from 'react';
import {
  Clock,
  Search,
  Filter,
  RefreshCw,
  User,
  Shield,
  FileText,
  AlertCircle,
  Calendar,
  Layers,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { AuditLogEntry } from '../types';

export const AuditLogViewer: React.FC = () => {
  const { fetchAuditLogs } = useCms();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAuditLogs();
      if (res.success && res.logs) {
        setLogs(res.logs);
      } else {
        setErrorMessage(res.error || 'Failed to fetch audit records.');
      }
    } catch {
      setErrorMessage('Network error fetching logs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Filtered entries
  const filteredLogs = logs.filter((log) => {
    if (selectedSection !== 'all' && log.section !== selectedSection) return false;
    if (selectedAction !== 'all' && log.action !== selectedAction) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchSummary = log.summary?.toLowerCase().includes(term);
      const matchUser = log.user?.fullName?.toLowerCase().includes(term) || log.user?.username?.toLowerCase().includes(term);
      const matchDetails = log.details?.toLowerCase().includes(term);
      return matchSummary || matchUser || matchDetails;
    }
    return true;
  });

  const uniqueSections = Array.from(new Set(logs.map((l) => l.section).filter(Boolean)));
  const uniqueActions = Array.from(new Set(logs.map((l) => l.action).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#faf9f5]">System Audit & Activity Logs</h2>
          <p className="text-xs text-[#9bb09e] mt-1">
            Complete, immutable audit trail documenting every modification made by Administrators and authorized Editors.
          </p>
        </div>

        <button
          type="button"
          onClick={loadLogs}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#142417] hover:bg-[#1e3623] text-[#cad6cc] border border-[#2b4d32] text-xs transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#d39c4a]' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="p-4 rounded-xl bg-[#142317] border border-[#254029] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#7a957f] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by summary, staff name, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white placeholder:text-[#5d7361] focus:outline-hidden focus:border-[#d39c4a]"
          />
        </div>

        <div>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white focus:outline-hidden focus:border-[#d39c4a]"
          >
            <option value="all">All Content Sections</option>
            {uniqueSections.map((sec) => (
              <option key={sec} value={sec}>
                Section: {sec}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white focus:outline-hidden focus:border-[#d39c4a]"
          >
            <option value="all">All Actions</option>
            {uniqueActions.map((act) => (
              <option key={act} value={act}>
                Action: {act}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Log Feed */}
      <div className="bg-[#142317] border border-[#254029] rounded-xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#7d9681]">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#d39c4a]" />
            <span>Loading audit trail...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#9bb09e] space-y-1">
            <Clock className="w-7 h-7 text-[#4a6b50] mx-auto mb-2" />
            <div className="font-medium text-white">No audit records match your filters.</div>
            <p className="text-[#7d9681]">Try clearing your search query or filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1f3823] text-xs">
            {filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const isEditor = log.user?.role === 'editor';
              return (
                <div key={log.id} className="p-4 hover:bg-[#182b1c] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                            isEditor
                              ? 'bg-[#b57a2c]/20 text-[#e5a952] border border-[#b57a2c]/40'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                          }`}
                        >
                          <User className="w-2.5 h-2.5" />
                          <span>{log.user?.role || 'system'}</span>
                        </span>

                        <span className="font-semibold text-white">{log.user?.fullName || log.user?.username || 'Unknown'}</span>
                        {log.user?.username && (
                          <span className="text-[11px] text-[#7d9681] font-mono">(@{log.user.username})</span>
                        )}

                        <span className="text-[#516b54]">•</span>
                        <span className="px-1.5 py-0.2 rounded bg-black/40 text-[10px] font-mono text-[#cad6cc]">
                          {log.action}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-[#102916] text-[10px] font-mono text-[#82cf91]">
                          {log.section}
                        </span>
                      </div>

                      <div className="text-sm font-medium text-[#eef2ee]">{log.summary}</div>

                      {log.details && (
                        <div className="text-xs text-[#9bb09e]">{log.details}</div>
                      )}
                    </div>

                    <div className="flex sm:flex-col sm:items-end justify-between text-[11px] text-[#7d9681] shrink-0 font-mono">
                      <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                      <div className="text-[10px] text-[#5e7762]">{new Date(log.timestamp).toLocaleDateString()}</div>

                      {log.changes && (
                        <button
                          type="button"
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="inline-flex items-center gap-1 mt-2 text-[#d39c4a] hover:underline text-[11px] cursor-pointer"
                        >
                          <span>{isExpanded ? 'Hide Payload' : 'View Payload'}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded JSON Changes */}
                  {isExpanded && log.changes && (
                    <div className="mt-3 p-3 rounded-lg bg-[#0a130c] border border-[#233a27] font-mono text-[11px] text-[#86e099] overflow-x-auto max-h-60">
                      <pre>{JSON.stringify(log.changes, null, 2)}</pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
