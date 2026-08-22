import React, { useState } from 'react';
import { Cpu, HardDrive, Network, Save } from 'lucide-react';
import { VM, NetMode } from '../types';
import { ResourceBar } from './UI';

const NET_MODES: NetMode[] = ['NAT', 'Bridged', 'Host-only', 'Internal'];

export const HardwareTab: React.FC<{
  vm: VM;
  onUpdate: (v: VM) => void;
  onToast: (msg: string) => void;
}> = ({ vm, onUpdate, onToast }) => {
  const [cores, setCores] = useState(vm.cpu.cores);
  const [ram, setRam] = useState(vm.ram.total);

  const save = () => {
    onUpdate({ ...vm, cpu: { ...vm.cpu, cores }, ram: { ...vm.ram, total: ram } });
    onToast('✅ Konfiguracja sprzętu zapisana');
  };

  return (
    <div className="space-y-5 p-1">
      {/* CPU */}
      <div className="card bg-base-200">
        <div className="card-body gap-4">
          <h3 className="font-semibold flex items-center gap-2"><Cpu size={16} /> Procesor</h3>
          <p className="text-sm text-base-content/60">{vm.cpu.model}</p>
          <ResourceBar label="Użycie CPU" value={Math.round(vm.cpu.usage)} max={100} unit="%" />
          <div className="flex items-center gap-4">
            <span className="text-sm w-28 shrink-0">Rdzenie vCPU</span>
            <input type="range" min={1} max={32} value={cores}
              onChange={e => setCores(+e.target.value)} className="range range-primary range-sm flex-1" />
            <span className="font-mono w-6 text-center">{cores}</span>
          </div>
        </div>
      </div>

      {/* RAM */}
      <div className="card bg-base-200">
        <div className="card-body gap-4">
          <h3 className="font-semibold flex items-center gap-2">🧠 Pamięć RAM</h3>
          <ResourceBar label="Użycie RAM" value={+vm.ram.used.toFixed(1)} max={vm.ram.total} unit=" GB" />
          <div className="flex items-center gap-4">
            <span className="text-sm w-28 shrink-0">Przydział RAM</span>
            <input type="range" min={1} max={128} value={ram}
              onChange={e => setRam(+e.target.value)} className="range range-primary range-sm flex-1" />
            <span className="font-mono w-16 text-center">{ram} GB</span>
          </div>
        </div>
      </div>

      {/* Dyski */}
      <div className="card bg-base-200">
        <div className="card-body gap-3">
          <h3 className="font-semibold flex items-center gap-2"><HardDrive size={16} /> Dyski</h3>
          {vm.disks.map(d => (
            <div key={d.id} className="bg-base-300 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-mono">{d.path}</span>
                <div className="flex gap-2">
                  <span className="badge badge-outline badge-sm">{d.type}</span>
                  <span className="text-base-content/60">{d.label}</span>
                </div>
              </div>
              <ResourceBar label="" value={d.used} max={d.size} unit=" GB" />
            </div>
          ))}
        </div>
      </div>

      {/* Sieć */}
      <div className="card bg-base-200">
        <div className="card-body gap-3">
          <h3 className="font-semibold flex items-center gap-2"><Network size={16} /> Sieć</h3>
          {vm.network.map((n, i) => (
            <div key={n.id} className="bg-base-300 rounded-lg p-3 grid grid-cols-2 gap-2 text-sm">
              <span className="text-base-content/60">Adapter {i + 1}</span>
              <div className="flex gap-2 justify-end">
                <select className="select select-bordered select-xs" value={n.mode}
                  onChange={e => onUpdate({
                    ...vm,
                    network: vm.network.map(x => x.id === n.id ? { ...x, mode: e.target.value as NetMode } : x),
                  })}>
                  {NET_MODES.map(m => <option key={m}>{m}</option>)}
                </select>
                <input type="checkbox" className="toggle toggle-success toggle-xs self-center"
                  checked={n.enabled}
                  onChange={e => onUpdate({
                    ...vm,
                    network: vm.network.map(x => x.id === n.id ? { ...x, enabled: e.target.checked } : x),
                  })} />
              </div>
              <span className="text-base-content/60">MAC</span><span className="font-mono">{n.mac}</span>
              <span className="text-base-content/60">IP</span><span className="font-mono">{n.ip}</span>
            </div>
          ))}
        </div>
      </div>

      <button className="btn btn-primary w-full" onClick={save}>
        <Save size={16} /> Zastosuj zmiany
      </button>
    </div>
  );
};
