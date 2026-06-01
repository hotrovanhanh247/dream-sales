'use client';
import { useEffect, useState } from 'react';
import { get, RANK_LABELS } from '@/lib/api';

interface Node {
  id: number; name: string; rank: string; email?: string;
  selfCombos: number; teamCombos: number; children: Node[];
}

const RANK_COLOR: Record<string, string> = {
  GDKD: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  GDV: 'bg-violet-50 text-violet-700 border-violet-200',
  TP: 'bg-amber-50 text-amber-700 border-amber-200',
  PP: 'bg-slate-50 text-slate-700 border-slate-200',
  CTV: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

function TreeNode({ n, depth = 0 }: { n: Node; depth?: number }) {
  return (
    <li>
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${RANK_COLOR[n.rank] || RANK_COLOR.CTV}`}>
        <span className="text-sm font-bold">{n.name}</span>
        <span className="text-[10px] uppercase font-medium opacity-70">{n.rank}</span>
        <span className="text-[11px] text-slate-500">cá nhân {n.selfCombos} · nhóm {n.teamCombos}</span>
      </div>
      {n.children?.length > 0 && (
        <ul className="pl-4 border-l-2 border-slate-200 ml-2 mt-2 space-y-2">
          {n.children.map(c => <TreeNode key={c.id} n={c} depth={depth + 1} />)}
        </ul>
      )}
    </li>
  );
}

export default function TreePage() {
  const [tree, setTree] = useState<Node | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => { get<Node>('/api/ctv/tree').then(setTree).catch(e => setErr(e.message)); }, []);

  if (err) return <div className="text-rose-600">{err}</div>;
  if (!tree) return <div className="text-slate-400">Đang tải…</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Sơ đồ nhóm</h1>
      <p className="text-slate-500 text-sm mb-6">Combo cá nhân & combo nhóm (cộng dồn toàn nhánh) trong tháng.</p>
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <ul className="space-y-2"><TreeNode n={tree} /></ul>
      </div>
    </div>
  );
}
