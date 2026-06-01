'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Network, Wallet, Calculator, Users, Percent,
  Coins, LogOut, TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { RANK_LABELS } from '@/lib/api';

const CTV_MENU = [
  { href: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/tree', label: 'Sơ đồ nhóm', icon: Network },
  { href: '/fees', label: 'Phí quản lý & thoát ly', icon: Wallet },
  { href: '/calculator', label: 'Tính hoa hồng (Dream Sales)', icon: Calculator },
];

const ADMIN_MENU = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/admin/ctv', label: 'Quản lý CTV', icon: Users },
  { href: '/admin/commission', label: 'Cấu hình hoa hồng', icon: Percent },
  { href: '/admin/payouts', label: 'Chi trả (phí QL & thoát ly)', icon: Coins },
  { href: '/calculator', label: 'Tính hoa hồng (Dream Sales)', icon: Calculator },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const menu = user.role === 'admin' ? ADMIN_MENU : CTV_MENU;

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 left-0">
        <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-200">
          <div className="w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
            <TrendingUp size={18} />
          </div>
          <div>
            <div className="font-bold leading-none">Dream Sales</div>
            <div className="text-[11px] text-slate-400">{user.role === 'admin' ? 'Quản trị' : 'CTV'}</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menu.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={18} /> {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-200">
          <div className="px-3 py-2 mb-1">
            <div className="text-sm font-semibold truncate">{user.name}</div>
            <div className="text-[11px] text-slate-400 truncate">
              {user.rank ? RANK_LABELS[user.rank] || user.rank : user.email}
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-6 md:p-8 max-w-6xl">{children}</main>
    </div>
  );
}
