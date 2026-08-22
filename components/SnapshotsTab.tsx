import React, { useState } from 'react';
import { Camera, RotateCcw, Trash2, Plus } from 'lucide-react';
import { VM, Snapshot } from '../types';

let _snapId = 10;

export const SnapshotsTab: React.FC<{
  vm: VM;
  onUpdate: (v: VM) => void;
  onToast: (msg: string) => void;
}> = ({ vm, onUpdate, onToast }) => {
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const createSnapshot = () => {
    if (!newName.trim()) return;
    const snap: Snapshot = {
      id: `s${++_snapId}`,
      name: newName.trim(),
      description: newDesc.trim() || 'Ręcznie utworzony snapshot',
      createdAt: new Date().toLocaleString('pl-PL'),
      size: Math.round(vm.disks.reduce((a, d) => a + d.used, 0) * 1024 * 0.7),
      isCurrent: false,
    };
    onUpdate({ ...vm, snapshots: [...vm.snapshots, snap] });
    setNewName(''); setNewDesc('');
    onToast(`📷 Snapshot "${snap.name}" utworzony`);
  };

  const restore = (id: string) => {
    onUpdate({ ...vm, snapshots: vm.snapshots.map(s => ({ ...s, isCurrent: s.id === id })) });
    onToast('✅ Snapshot przywrócony');
  };

  const del = (id: string) => {
    onUpdate({ ...vm, snapshots: vm.snapshots.filter(s => s.id !== id) });
    onToast('🗑️ Snapshot usunięty');
  };

  return (
    <div className="space-y-5 p-1">
      {/* Utwórz nowy */}
      <div className="card bg-base-200">
        <div className="card-body gap-3">
          <h3 className="font-semibold flex items-center gap-2"><Plus size={16} /> Nowy snapshot</h3>
          <input className="input input-bordered w-full" placeholder="Nazwa snapshotu…"
            value={newName} onChange={e => setNewName(e.target.value)} />
          <input className="input input-bordered w-full" placeholder="Opis (opcjonalny)…"
            value={newDesc} onChange={e => setNewDesc(e.target.value)} />
          <button className="btn btn-primary" onClick={createSnapshot} disabled={!newName.trim()}>
            <Camera size={16} /> Utwórz snapshot
          </button>
        </div>
      </div>

      {/* Lista snapshotów */}
      <div className="space-y-3">
        {vm.snapshots.length === 0 && (
          <p className="text-center text-base-content/50 py-8">Brak snapshotów</p>
        )}
        {vm.snapshots.map(s => (
          <div key={s.id} className={`card bg-base-200 border ${s.isCurrent ? 'border-success' : 'border-transparent'}`}>
            <div className="card-body py-3 gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera size={14} className="opacity-50" />
                  <span className="font-semibold text-sm">{s.name}</span>
                  {s.isCurrent && <span className="badge badge-success badge-xs">aktualny</span>}
                </div>
                <div className="flex gap-1">
                  {!s.isCurrent && (
                    <button className="btn btn-xs btn-outline btn-success" onClick={() => restore(s.id)}>
                      <RotateCcw size={12} /> Przywróć
                    </button>
                  )}
                  <button className="btn btn-xs btn-outline btn-error" onClick={() => del(s.id)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-base-content/60">{s.description}</p>
              <div className="flex gap-4 text-xs text-base-content/50 mt-1">
                <span>📅 {s.createdAt}</span>
                <span>💾 {(s.size / 1024).toFixed(1)} GB</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
