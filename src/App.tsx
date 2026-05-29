import { useEffect, useState } from 'react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { TrendingUp, LogIn, LogOut, Moon, Sun, AlertCircle } from 'lucide-react';
import { db, auth } from './firebase';
import { Button, Card } from './lib/ui';
import { SalesView } from './sales/SalesView';

const ALLOWED_EMAILS = (import.meta.env.VITE_ALLOWED_EMAILS || '')
  .split(',')
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email?.toLowerCase() || '';
        if (ALLOWED_EMAILS.length === 0 || ALLOWED_EMAILS.includes(email)) {
          setUser(firebaseUser);
          setAccessDenied(false);
        } else {
          setUser(null);
          setAccessDenied(true);
        }
      } else {
        setUser(null);
        setAccessDenied(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = () => signOut(auth);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'userPrefs', user.uid));
        if (cancelled) return;
        const t = snap.data()?.theme;
        if (t === 'light' || t === 'dark') setTheme(t);
      } catch (err) {
        console.error('Load theme pref failed:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const toggleTheme = async () => {
    const next: 'light' | 'dark' = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (user) {
      try {
        await setDoc(doc(db, 'userPrefs', user.uid), { theme: next }, { merge: true });
      } catch (err) {
        console.error('Save theme pref failed:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Bạn không có quyền truy cập</h1>
          <p className="text-slate-500 mb-8">Tài khoản của bạn không được phép truy cập vào hệ thống này. Vui lòng liên hệ quản trị viên.</p>
          <Button
            variant="secondary"
            onClick={() => { signOut(auth); setAccessDenied(false); }}
            className="w-full py-3"
          >
            <LogOut size={18} className="mr-2" />
            Quay lại đăng nhập
          </Button>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <TrendingUp size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Dream Sales</h1>
          <p className="text-slate-500 mb-8">Quản lý hoa hồng, chi phí và lợi nhuận theo tháng. Vui lòng đăng nhập để tiếp tục.</p>
          <Button onClick={handleLogin} className="w-full py-3">
            <LogIn size={18} className="mr-2" />
            Đăng nhập với Google
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans text-[15px] md:text-base">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-6 py-3 md:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold leading-none">Dream Sales</h1>
              <span className="text-xs text-slate-500 hidden sm:block">Quản lý hoa hồng</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 pl-3 md:pl-4">
            {user.photoURL && (
              <img src={user.photoURL} className="w-8 h-8 md:w-10 md:h-10 rounded-xl border border-slate-200" alt="" />
            )}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Bật chế độ sáng' : 'Bật chế độ tối'}
              title={theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
              className="w-8 h-8 md:w-10 md:h-10 text-slate-400 hover:text-amber-500 transition-colors flex items-center justify-center"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={handleLogout}
              aria-label="Đăng xuất"
              title="Đăng xuất"
              className="w-8 h-8 md:w-10 md:h-10 text-slate-400 hover:text-rose-500 transition-colors flex items-center justify-center"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-4 md:pt-6 pb-24 md:pb-6">
        <SalesView user={user} />
      </main>
    </div>
  );
}
