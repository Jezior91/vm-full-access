import React, { useState } from 'react';
import { LogEntry } from '../types';

const LEVEL_CLS: Record<LogEntry['level'], string> = {
  info:  'text-base-content/80',
  warn:  'text-warning',
  error: 'text-error',
};
const LEVEL_BADGE: Record<LogEntry['level'], string> = {
  info:  'badge-info',
  warn:  'badge-warning',
  error: 'badge-error',
};

type Filter = 'all' | LogEntry['level'];
const FILTERS: Filter[] = ['all', 'info', 'warn', 'error'];

export const LogsTab: React.FC<{ logs: LogEntry[] }> = ({ logs }) => {
  const [filter, setFilter] = useState<Filter>('all');
  const filtered = filter === 'all' ? logs : logs.filter(l => l.level === filter);

  return (
    <div className="space-y-3 p-1">
      {/* Filtr poziomów */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => {
          const count = f === 'all' ? logs.length : logs.filter(l => l.level === f).length;
          return (
            <button key={f} className={`btn btn-xs ${filter === f ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter(f)}>
              {f === 'all' ? 'Wszystkie' : f.toUpperCase()}
              <span className="ml-1 badge badge-xs opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Wiersze logów */}
      <div className="bg-[#0d1117] rounded-xl overflow-hidden">
        <div className="overflow-y-auto" style={{ maxHeight: '420px' }}>
          {filtered.length === 0 && (
            <p className="text-center text-base-content/50 py-8">Brak logów dla tego poziomu</p>
          )}
          {filtered.map((l, i) => (
            <div key={i}
              className={`flex items-start gap-3 px-4 py-2 font-mono text-xs border-b border-[#21262d] ${LEVEL_CLS[l.level]}`}>
              <span className="text-[#7d8590] shrink-0" style={{ minWidth: '9.5rem' }}>{l.ts}</span>
              <span className={`badge ${LEVEL_BADGE[l.level]} badge-xs shrink-0 mt-0.5`}>{l.level}</span>
              <span className="break-all">{l.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
