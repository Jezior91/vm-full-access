import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Play, Square, Pause, RotateCw, Terminal as TermIcon, Cpu, Camera, FileText } from 'lucide-react';
import { VM } from './types';
import { INITIAL_VM } from './data';
import { StatusBadge, ResourceBar } from './components/UI';
import { Terminal } from './components/Terminal';
import { HardwareTab } from './components/HardwareTab';
import { SnapshotsTab } from './components/SnapshotsTab';
import { LogsTab } from './components/LogsTab';

// Blokuj wiadomości rozszerzeń przeglądarki (np. BLANK_BACKGROUND) zanim trafią do mostka
window.addEventListener('message', (e: MessageEvent) => {
  try {
    const d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
    if (d?.origin === 'BLANK_BACKGROUND') e.stopImmediatePropagation();
  } catch { /* ignoruj */ }
}, true);

type Tab = 'terminal' | 'hardware' | 'snapshots' | 'logs';

const fmtUptime = (s: number) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return `${h}g ${m}m ${sec}s`;
};

const OS_ICON: Record<string, string> = { linux: '🐧', windows: '🪟', macos: '🍎', other: '💻' };

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'terminal',  label: 'Terminal',  icon: <TermIcon size={14} /> },
  { id: 'hardware',  label: 'Sprzęt',    icon: <Cpu size={14} /> },
  { id: 'snapshots', label: 'Snapshoty', icon: <Camera size={14} /> },
  { id: 'logs',      label: 'Logi',      icon: <FileText size={14} /> },
];

const App: React.FC = () => {
  const [vm, setVm] = useState<VM>(INITIAL_VM);
  const [tab, setTab] = useState<Tab>('terminal');
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  // Symulacja: uptime rośnie co sekundę, CPU lekko się waha
  useEffect(() => {
    if (vm.status !== 'running') return;
    const t = setInterval(() => {
      setVm(prev => ({
        ...prev,
        uptime: prev.uptime + 1,
        cpu: { ...prev.cpu, usage: Math.min(100, Math.max(2, prev.cpu.usage + (Math.random() - 0.5) * 5)) },
      }));
    }, 1000);
    return () => clearInterval(t);
  }, [vm.status]);

  const setStatus = (s: VM['status'], msg: string) => {
    setVm(prev => ({ ...prev, status: s }));
    showToast(msg);
  };

  return (
    <div className="min-h-screen bg-base-100 p-4 space-y-4">
      {/* Toast globalny */}
      {toast && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success shadow-lg text-sm py-2">{toast}</div>
        </div>
      )}

      {/* Nagłówek VM */}
      <div className="card bg-base-200 shadow">
        <div className="card-body py-4 gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            {/* Info */}
            <div className="flex items-center gap-3">
              <span className="text-4xl">{OS_ICON[vm.os]}</span>
              <div>
                <h1 className="text-xl font-bold">{vm.name}</h1>
                <p className="text-sm text-base-content/60">{vm.description}</p>
                <div className="flex items-center gap-3 mt-1">
                  <StatusBadge status={vm.status} />
                  <span className="text-xs text-base-content/50 font-mono">{vm.ip}</span>
                  {vm.status === 'running' && (
                    <span className="text-xs text-base-content/50">⏱ {fmtUptime(vm.uptime)}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Kontrolki */}
            <div className="flex gap-2 flex-wrap">
              <button className="btn btn-success btn-sm gap-1" disabled={vm.status === 'running'}
                onClick={() => setStatus('running', '▶️ Maszyna uruchomiona')}>
                <Play size={14} /> Start
              </button>
              <button className="btn btn-warning btn-sm gap-1" disabled={vm.status !== 'running'}
                onClick={() => setStatus('paused', '⏸ Maszyna wstrzymana')}>
                <Pause size={14} /> Pauza
              </button>
              <button className="btn btn-error btn-sm gap-1" disabled={vm.status === 'stopped'}
                onClick={() => setStatus('stopped', '■ Maszyna zatrzymana')}>
                <Square size={14} /> Stop
              </button>
              <button className="btn btn-outline btn-sm gap-1"
                onClick={() => setStatus('running', '🔄 Maszyna zrestartowana')}>
                <RotateCw size={14} /> Restart
              </button>
            </div>
          </div>

          {/* Paski zasobów */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ResourceBar label={`CPU (${vm.cpu.cores} rdzeni)`} value={Math.round(vm.cpu.usage)} max={100} unit="%" />
            <ResourceBar label="RAM" value={+vm.ram.used.toFixed(1)} max={vm.ram.total} unit=" GB" />
            <ResourceBar label={`Dysk ${vm.disks[0]?.path ?? ''}`} value={vm.disks[0]?.used ?? 0} max={vm.disks[0]?.size ?? 1} unit=" GB" />
          </div>
        </div>
      </div>

      {/* Nawigacja zakładek */}
      <div className="tabs tabs-boxed bg-base-200 w-full">
        {TABS.map(t => (
          <button key={t.id} className={`tab gap-1.5 flex-1 ${tab === t.id ? 'tab-active' : ''}`}
            onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Zawartość */}
      {tab === 'terminal'  && <Terminal running={vm.status === 'running'} />}
      {tab === 'hardware'  && <HardwareTab vm={vm} onUpdate={setVm} onToast={showToast} />}
      {tab === 'snapshots' && <SnapshotsTab vm={vm} onUpdate={setVm} onToast={showToast} />}
      {tab === 'logs'      && <LogsTab logs={vm.logs} />}
    </div>
  );
};

createRoot(document.getElementById('root')!).render(<App />);
