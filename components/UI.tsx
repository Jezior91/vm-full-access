import React from 'react';
import { VMStatus } from '../types';

// ─── StatusBadge ───────────────────────────────────────────────────────────────
const STATUS_CFG: Record<VMStatus, { cls: string; label: string }> = {
  running:   { cls: 'badge-success', label: '▶ Running'   },
  stopped:   { cls: 'badge-error',   label: '■ Stopped'   },
  paused:    { cls: 'badge-warning', label: '⏸ Paused'    },
  saving:    { cls: 'badge-info',    label: '💾 Saving'   },
  restoring: { cls: 'badge-info',    label: '↩ Restoring' },
};

export const StatusBadge: React.FC<{ status: VMStatus }> = ({ status }) => {
  const { cls, label } = STATUS_CFG[status] ?? STATUS_CFG.stopped;
  return <span className={`badge ${cls} badge-sm font-semibold`}>{label}</span>;
};

// ─── ResourceBar ───────────────────────────────────────────────────────────────
export const ResourceBar: React.FC<{
  label: string; value: number; max: number; unit: string;
}> = ({ label, value, max, unit }) => {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const color = pct >= 85 ? 'progress-error' : pct >= 60 ? 'progress-warning' : 'progress-success';
  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between text-xs text-base-content/70">
          <span>{label}</span>
          <span className="font-mono">{value}{unit} / {max}{unit}</span>
        </div>
      )}
      <progress className={`progress ${color} w-full h-2`} value={pct} max={100} />
    </div>
  );
};
