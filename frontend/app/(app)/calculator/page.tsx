'use client';
import { useAuth } from '@/lib/auth';
import { SalesView } from '@/lib/calc/SalesView';

export default function CalculatorPage() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tính hoa hồng — Dream Sales</h1>
        <p className="text-slate-500 text-sm">Công cụ mô phỏng hoa hồng / chi phí / lợi nhuận theo tháng (dữ liệu lưu trên trình duyệt, theo tài khoản đang đăng nhập).</p>
      </div>

      {user ? (
        <SalesView accountId={String(user.id)} />
      ) : (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
