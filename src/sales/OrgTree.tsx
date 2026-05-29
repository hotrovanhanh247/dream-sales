import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import type { SalesMember } from '../types';
import { cn } from '../lib/ui';
import { SALES_POSITIONS, compareMembers, countSubtree } from './constants';

function OrgLeafChip({ m }: { m: SalesMember; key?: React.Key }) {
  const p = SALES_POSITIONS[m.position];
  const label = m.name || `${p.short} ×${m.count}`;
  return (
    <div className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-slate-200', p.bgSoft, p.text)}>
      <span className={cn('inline-block w-1.5 h-1.5 rounded-full', p.bg)} />
      <span className="text-xs font-bold">{label}</span>
      <span className="text-[9px] text-slate-400 font-medium uppercase">{p.short}</span>
    </div>
  );
}

function OrgNode({ m, members, collapsed, onToggle }: {
  m: SalesMember;
  members: SalesMember[];
  collapsed: Set<string>;
  onToggle: (id: string) => void;
  key?: React.Key;
}) {
  const children = members.filter(c => c.parentId === m.id).sort(compareMembers);
  const p = SALES_POSITIONS[m.position];
  const label = m.name || `${p.short} ×${m.count}`;
  const hasChildren = children.length > 0;
  const isCollapsed = collapsed.has(m.id);
  const subtreeCount = hasChildren ? countSubtree(m.id, members) : 0;
  const branches = children.filter(c => members.some(x => x.parentId === c.id));
  const leaves = children.filter(c => !members.some(x => x.parentId === c.id));
  return (
    <li>
      <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200', p.bgSoft, p.text)}>
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(m.id)}
            className="flex items-center justify-center w-4 h-4 rounded hover:bg-slate-200/60"
            title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
          >
            {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
          </button>
        ) : (
          <span className={cn('inline-block w-1.5 h-1.5 rounded-full', p.bg)} />
        )}
        <span className="text-sm font-bold">{label}</span>
        <span className="text-[10px] text-slate-400 font-medium uppercase">{p.short}</span>
        {hasChildren && (
          <span className="text-[10px] text-slate-500 font-medium" title={`${children.length} trực tiếp · ${subtreeCount} tổng`}>
            ({children.length}/{subtreeCount})
          </span>
        )}
      </div>
      {hasChildren && !isCollapsed && (
        <div className="pl-4 border-l-2 border-slate-200 ml-2 mt-2 space-y-2">
          {branches.length > 0 && (
            <ul className="space-y-2">
              {branches.map(c => <OrgNode key={c.id} m={c} members={members} collapsed={collapsed} onToggle={onToggle} />)}
            </ul>
          )}
          {leaves.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {leaves.map(c => <OrgLeafChip key={c.id} m={c} />)}
            </div>
          )}
        </div>
      )}
    </li>
  );
}

export function OrgTree({ members }: { members: SalesMember[] }) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  if (members.length === 0) {
    return <p className="text-sm text-slate-400 italic">Thêm thành viên để hiển thị sơ đồ.</p>;
  }
  const roots = members.filter(m => m.position === 'gdkd' && !m.parentId).sort(compareMembers);
  const orphans = members.filter(m => m.parentId && !members.find(p => p.id === m.parentId)).sort(compareMembers);
  if (roots.length === 0 && orphans.length === 0) {
    return <p className="text-sm text-amber-600 italic">Chưa có GĐKD nào — thêm một GĐKD để hiển thị sơ đồ.</p>;
  }

  const toggle = (id: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const parentIds = members.filter(m => members.some(c => c.parentId === m.id)).map(m => m.id);
  const allExpanded = collapsed.size === 0;
  const allCollapsed = parentIds.length > 0 && parentIds.every(id => collapsed.has(id));

  return (
    <div>
      <div className="flex items-center gap-3 mb-2 text-[11px]">
        <button
          type="button"
          onClick={() => setCollapsed(new Set())}
          disabled={allExpanded}
          className="font-bold text-indigo-600 hover:text-indigo-800 disabled:text-slate-300 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <ChevronDown size={12} />Mở rộng
        </button>
        <span className="text-slate-300">·</span>
        <button
          type="button"
          onClick={() => setCollapsed(new Set(parentIds))}
          disabled={allCollapsed}
          className="font-bold text-slate-500 hover:text-slate-700 disabled:text-slate-300 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <ChevronRight size={12} />Thu gọn
        </button>
      </div>
      <div className="space-y-3">
        {roots.length > 0 && (
          <ul className="space-y-2">
            {roots.map(r => <OrgNode key={r.id} m={r} members={members} collapsed={collapsed} onToggle={toggle} />)}
          </ul>
        )}
        {orphans.length > 0 && (
          <div className="pt-3 border-t border-dashed border-amber-300">
            <p className="text-xs font-bold text-amber-600 mb-2">Mồ côi (cấp trên đã xoá):</p>
            <ul className="space-y-2">
              {orphans.map(o => <OrgNode key={o.id} m={o} members={members} collapsed={collapsed} onToggle={toggle} />)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
