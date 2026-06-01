'use client';
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { SalesMember } from './types';
import { Button, Input, cn } from '../ui';
import { SALES_POSITIONS, POSITION_RANK, compareMembers, type SalesPositionKey } from './constants';

export function OrgRosterEditor({ position, members, onAdd, onDelete }: {
  position: SalesPositionKey;
  members: SalesMember[];
  onAdd: (member: Omit<SalesMember, 'id'>) => void;
  onDelete: (id: string) => void;
}) {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [count, setCount] = useState<string>('1');

  const ownMembers = members.filter(m => m.position === position).sort(compareMembers);
  const rank = POSITION_RANK[position];
  const possibleParents = members.filter(m => POSITION_RANK[m.position] < rank).sort(compareMembers);
  const requiresParent = rank > 0;
  const short = SALES_POSITIONS[position].short;

  const parentLabel = (m: SalesMember) => {
    if (!m.parentId) return null;
    const p = members.find(x => x.id === m.parentId);
    if (!p) return '(cấp trên đã xoá)';
    return `${p.name || `${SALES_POSITIONS[p.position].short} ×${p.count}`} (${SALES_POSITIONS[p.position].short})`;
  };

  const generateNames = (base: string, n: number): string[] => {
    const ownNames = ownMembers.map(m => m.name || '').filter(Boolean);
    if (n === 1 && !ownNames.includes(base)) return [base];
    const escaped = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`^${escaped} (\\d+)$`);
    let maxN = 0;
    for (const nm of ownNames) {
      if (nm === base) maxN = Math.max(maxN, 1);
      const mm = nm.match(pattern);
      if (mm) maxN = Math.max(maxN, parseInt(mm[1], 10));
    }
    return Array.from({ length: n }, (_, i) => `${base} ${maxN + 1 + i}`);
  };

  const handleAdd = () => {
    if (requiresParent && !parentId) return;
    const n = Math.max(1, Number(count) || 1);
    const base = name.trim() || short;
    const generated = generateNames(base, n);
    generated.forEach(genName => {
      onAdd({
        position,
        name: genName,
        parentId: requiresParent ? parentId : undefined,
        count: 1,
      });
    });
    setName('');
    setCount('1');
  };

  return (
    <div>
      <div className="space-y-2 mb-3 max-h-72 overflow-y-auto">
        {ownMembers.length === 0 ? (
          <p className="text-sm text-slate-400 italic">Chưa có {SALES_POSITIONS[position].label}.</p>
        ) : ownMembers.map(m => (
          <div key={m.id} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-slate-800 truncate">
                {m.name || `${SALES_POSITIONS[position].short} ×${m.count}`}
              </div>
              {m.parentId && (
                <div className="text-[11px] text-slate-500 truncate">↳ {parentLabel(m)}</div>
              )}
            </div>
            <button
              onClick={() => onDelete(m.id)}
              className="w-8 h-8 text-rose-400 hover:text-rose-600 flex items-center justify-center shrink-0"
              title="Xoá"
              type="button"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className={cn('grid gap-2 p-3 rounded-xl bg-slate-50 border border-dashed border-slate-300',
        requiresParent ? 'grid-cols-2 md:grid-cols-[1fr_70px_1fr_auto]' : 'grid-cols-[1fr_70px_auto]')}>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={`Tên (mặc định "${short}")`}
        />
        <Input
          type="number"
          min={1}
          value={count}
          onChange={e => setCount(e.target.value)}
          placeholder="SL"
        />
        {requiresParent && (
          <select
            value={parentId}
            onChange={e => setParentId(e.target.value)}
            className="w-full col-span-2 md:col-span-1 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white text-slate-900 text-sm"
          >
            <option value="">— Chọn cấp trên —</option>
            {possibleParents.length === 0 ? (
              <option value="" disabled>Chưa có cấp trên nào</option>
            ) : possibleParents.map(p => (
              <option key={p.id} value={p.id}>
                {p.name || `${SALES_POSITIONS[p.position].short} ×${p.count}`} — {SALES_POSITIONS[p.position].short}
              </option>
            ))}
          </select>
        )}
        <Button
          onClick={handleAdd}
          disabled={requiresParent && !parentId}
          className={cn(requiresParent && 'col-span-2 md:col-span-1')}
        >
          <Plus size={16} className="mr-1" /> Thêm
        </Button>
      </div>
    </div>
  );
}