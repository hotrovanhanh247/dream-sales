'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, LogIn } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('admin@dream-sales.local');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const u = await login(email, password);
      router.replace(u.role === 'admin' ? '/admin' : '/dashboard');
    } catch (e: any) {
      setErr(e?.message || 'Đăng nhập thất bại');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
          <TrendingUp size={32} />
        </div>
        <h1 className="text-2xl font-bold text-center mb-1">Dream Sales</h1>
        <p className="text-slate-500 text-center text-sm mb-6">Đăng nhập hệ thống quản lý CTV</p>

        {err && <div className="mb-4 px-3 py-2 rounded-lg bg-rose-50 text-rose-600 text-sm">{err}</div>}

        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input
          type="email" value={email} onChange={e => setEmail(e.target.value)} required
          className="w-full mb-4 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
        <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
        <input
          type="password" value={password} onChange={e => setPassword(e.target.value)} required
          className="w-full mb-6 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
        <button
          type="submit" disabled={busy}
          className="w-full py-3 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          <LogIn size={18} /> {busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </button>
        <p className="text-xs text-slate-400 text-center mt-4">
          Demo: admin@dream-sales.local / Admin@1234 · gdkd@dream-sales.local / Password@123
        </p>
      </form>
    </div>
  );
}
