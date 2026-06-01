'use client';
import { useEffect, useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { LogIn, LogOut, Calculator as CalcIcon } from 'lucide-react';
import { auth } from '@/lib/calc/firebase';
import { SalesView } from '@/lib/calc/SalesView';

export default function CalculatorPage() {
  const [fbUser, setFbUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => onAuthStateChanged(auth, (u) => { setFbUser(u); setReady(true); }), []);

  const handleLogin = async () => {
    try { await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch (e) { console.error('Google login error:', e); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tính hoa hồng — Dream Sales</h1>
          <p className="text-slate-500 text-sm">Công cụ mô phỏng hoa hồng / chi phí / lợi nhuận theo tháng (dữ liệu lưu trên Firestore).</p>
        </div>
        {fbUser && (
          <button onClick={() => signOut(auth)} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100">
            <LogOut size={16} /> {fbUser.email}
          </button>
        )}
      </div>

      {!ready ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !fbUser ? (
        <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center mt-10">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CalcIcon size={32} />
          </div>
          <h2 className="text-lg font-bold mb-2">Cần đăng nhập Google</h2>
          <p className="text-slate-500 text-sm mb-6">Công cụ tính hoa hồng dùng tài khoản Google riêng (Firestore) để lưu kịch bản kế hoạch.</p>
          <button onClick={handleLogin} className="w-full py-3 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700">
            <LogIn size={18} /> Đăng nhập với Google
          </button>
        </div>
      ) : (
        <SalesView user={fbUser} />
      )}
    </div>
  );
}
