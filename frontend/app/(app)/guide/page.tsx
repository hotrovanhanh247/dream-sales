'use client';

import { useEffect, useState } from 'react';
import {
  BookOpen, Users, Network, Wallet, Coins, Percent, Calculator,
  LayoutDashboard, Shield, GitBranch, Sparkles, AlertCircle, ChevronRight,
} from 'lucide-react';

/**
 * Trang Hướng dẫn sử dụng — tổng hợp toàn bộ luồng nghiệp vụ + công thức
 * tính + cách thao tác trên từng menu của Dream Sales.
 *
 * Layout: sidebar TOC bên trái (sticky) + nội dung bên phải. Scrollspy
 * cập nhật active section khi user cuộn.
 */

type Section = { id: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }> };

const SECTIONS: Section[] = [
  { id: 'intro',         label: '1. Giới thiệu hệ thống',  icon: Sparkles },
  { id: 'rank',          label: '2. Cấp bậc & cây nhân sự', icon: GitBranch },
  { id: 'login',         label: '3. Đăng nhập',             icon: Shield },
  { id: 'ctv-dashboard', label: '4. CTV — Tổng quan',       icon: LayoutDashboard },
  { id: 'ctv-tree',      label: '5. CTV — Sơ đồ nhóm',      icon: Network },
  { id: 'ctv-fees',      label: '6. CTV — Phí & thoát ly',  icon: Wallet },
  { id: 'admin-dash',    label: '7. Admin — Tổng quan',     icon: LayoutDashboard },
  { id: 'admin-ctv',     label: '8. Admin — Quản lý CTV',   icon: Users },
  { id: 'admin-comm',    label: '9. Admin — Cấu hình HH',   icon: Percent },
  { id: 'admin-payouts', label: '10. Admin — Chi trả',      icon: Coins },
  { id: 'calculator',    label: '11. Calculator',           icon: Calculator },
  { id: 'engines',       label: '12. Cơ chế tính tiền',     icon: Sparkles },
  { id: 'faq',           label: '13. FAQ & lỗi thường gặp', icon: AlertCircle },
];

export default function GuidePage() {
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  // Scroll-spy: cập nhật `active` khi section vào tầm nhìn
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          // Chọn entry gần top viewport nhất
          const top = visible.reduce((a, b) =>
            (a.boundingClientRect.top < b.boundingClientRect.top ? a : b)
          );
          setActive(top.target.id);
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex gap-8">
      {/* TOC sticky bên trái */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-6 space-y-1">
          <div className="flex items-center gap-2 px-3 py-2 mb-2 border-b border-slate-200">
            <BookOpen size={18} className="text-indigo-600" />
            <span className="text-sm font-bold">Mục lục</span>
          </div>
          {SECTIONS.map((s) => {
            const isActive = active === s.id;
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <s.icon size={14} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                <span className="truncate">{s.label}</span>
                {isActive && <ChevronRight size={12} className="ml-auto" />}
              </a>
            );
          })}
        </div>
      </aside>

      {/* Nội dung */}
      <article className="flex-1 prose-doc max-w-none space-y-12 pb-24">
        <header>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <BookOpen className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-0">Hướng dẫn sử dụng</h1>
              <p className="text-slate-500 text-sm mt-1">
                Tổng hợp luồng nghiệp vụ, công thức tính, và cách thao tác trên từng menu.
              </p>
            </div>
          </div>
        </header>

        {/* 1. Giới thiệu */}
        <Section id="intro" title="1. Giới thiệu hệ thống">
          <p>
            <strong>Dream Sales</strong> là hệ thống kết hợp 2 thành phần:
          </p>
          <ul>
            <li>
              <strong>Cổng quản lý CTV</strong> — port lại từ CCB Mart, tính
              hoa hồng / phí quản lý / phí thoát ly cho mạng lưới CTV 5 cấp
              (CTV → PP → TP → GĐV → GĐKD).
            </li>
            <li>
              <strong>Dream Sales Calculator</strong> — bộ máy tính hoa hồng /
              chi phí / lợi nhuận, dữ liệu lưu trên Firebase Firestore, đăng
              nhập Google.
            </li>
          </ul>
          <p>
            Hệ thống chia <strong>2 vai trò</strong>: <em>CTV</em> (cộng tác viên)
            và <em>Admin</em> (quản trị viên). Mỗi vai trò có menu riêng (xem
            sidebar trái).
          </p>
          <Callout type="info">
            <strong>Stack kỹ thuật:</strong> Backend Express + Prisma + PostgreSQL
            (cổng 8080, deploy Railway). Frontend Next.js 16 + React 19 + Tailwind 4
            (cổng 3001 local, deploy Vercel). Calculator dùng Firebase project
            <code>dream-sales-318e8</code>.
          </Callout>
        </Section>

        {/* 2. Cấp bậc */}
        <Section id="rank" title="2. Cấp bậc & cây nhân sự">
          <p>
            Mạng lưới phân cấp 5 tầng, mỗi tầng có hệ số hoa hồng và lương cứng riêng:
          </p>
          <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left">Cấp</th>
                <th className="px-3 py-2 text-left">Mã</th>
                <th className="px-3 py-2 text-right">Self-sale</th>
                <th className="px-3 py-2 text-right">F1</th>
                <th className="px-3 py-2 text-right">F2</th>
                <th className="px-3 py-2 text-right">F3</th>
                <th className="px-3 py-2 text-right">Lương cứng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr><td className="px-3 py-2">Giám đốc kinh doanh</td><td className="px-3 py-2"><code>GDKD</code></td><td className="px-3 py-2 text-right">38%</td><td className="px-3 py-2 text-right">10%</td><td className="px-3 py-2 text-right">5%</td><td className="px-3 py-2 text-right">3%</td><td className="px-3 py-2 text-right">30 tr</td></tr>
              <tr><td className="px-3 py-2">Giám đốc vùng</td><td className="px-3 py-2"><code>GDV</code></td><td className="px-3 py-2 text-right">35%</td><td className="px-3 py-2 text-right">10%</td><td className="px-3 py-2 text-right">5%</td><td className="px-3 py-2 text-right">—</td><td className="px-3 py-2 text-right">18 tr</td></tr>
              <tr><td className="px-3 py-2">Trưởng phòng</td><td className="px-3 py-2"><code>TP</code></td><td className="px-3 py-2 text-right">30%</td><td className="px-3 py-2 text-right">10%</td><td className="px-3 py-2 text-right">—</td><td className="px-3 py-2 text-right">—</td><td className="px-3 py-2 text-right">10 tr</td></tr>
              <tr><td className="px-3 py-2">Phó phòng</td><td className="px-3 py-2"><code>PP</code></td><td className="px-3 py-2 text-right">20%</td><td className="px-3 py-2 text-right">—</td><td className="px-3 py-2 text-right">—</td><td className="px-3 py-2 text-right">—</td><td className="px-3 py-2 text-right">5 tr</td></tr>
              <tr><td className="px-3 py-2">Cộng tác viên</td><td className="px-3 py-2"><code>CTV</code></td><td className="px-3 py-2 text-right">20%</td><td className="px-3 py-2 text-right">—</td><td className="px-3 py-2 text-right">—</td><td className="px-3 py-2 text-right">—</td><td className="px-3 py-2 text-right">0</td></tr>
            </tbody>
          </table>
          <ul>
            <li><strong>F1</strong> = downline trực tiếp (cấp con).</li>
            <li><strong>F2</strong> = cháu (con của F1).</li>
            <li><strong>F3</strong> = chắt (con của F2).</li>
            <li>Lương cứng được cấp khi đủ điều kiện đào tạo & quỹ lương (cap 5% doanh thu).</li>
          </ul>
        </Section>

        {/* 3. Đăng nhập */}
        <Section id="login" title="3. Đăng nhập">
          <p>Truy cập <code>/login</code>, nhập email + mật khẩu → hệ thống cấp JWT (7 ngày), lưu vào localStorage.</p>
          <h4>Tài khoản demo (seed sẵn)</h4>
          <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left">Vai trò</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Mật khẩu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr><td className="px-3 py-2"><strong>Admin</strong></td><td className="px-3 py-2"><code>admin@dream-sales.local</code></td><td className="px-3 py-2"><code>Admin@1234</code></td></tr>
              <tr><td className="px-3 py-2">GĐKD</td><td className="px-3 py-2"><code>gdkd@dream-sales.local</code></td><td className="px-3 py-2"><code>Password@123</code></td></tr>
              <tr><td className="px-3 py-2">GĐV</td><td className="px-3 py-2"><code>gdv@dream-sales.local</code></td><td className="px-3 py-2"><code>Password@123</code></td></tr>
              <tr><td className="px-3 py-2">TP</td><td className="px-3 py-2"><code>tp@dream-sales.local</code></td><td className="px-3 py-2"><code>Password@123</code></td></tr>
              <tr><td className="px-3 py-2">PP</td><td className="px-3 py-2"><code>pp@dream-sales.local</code></td><td className="px-3 py-2"><code>Password@123</code></td></tr>
              <tr><td className="px-3 py-2">CTV</td><td className="px-3 py-2"><code>ctv1@dream-sales.local</code>, <code>ctv2@…</code></td><td className="px-3 py-2"><code>Password@123</code></td></tr>
            </tbody>
          </table>
          <Callout type="warn">
            Token hết hạn sau 7 ngày — sau đó hệ thống tự redirect về <code>/login</code>.
            Đăng xuất ở nút "Đăng xuất" góc dưới sidebar.
          </Callout>
        </Section>

        {/* 4. CTV — Dashboard */}
        <Section id="ctv-dashboard" title="4. CTV — Tổng quan">
          <p>Mặc định CTV vào <code>/dashboard</code> sau khi đăng nhập.</p>
          <p>4 ô chỉ số chính ở top:</p>
          <ul>
            <li><strong>Doanh thu tháng</strong> — tổng <code>totalAmount</code> các Transaction tháng hiện tại.</li>
            <li><strong>Hoa hồng tháng</strong> — kết quả engine Commission (self + F1/F2/F3).</li>
            <li><strong>Phí quản lý nhận</strong> — uplines nhận từ doanh thu cá nhân của downlines (gated 20h đào tạo).</li>
            <li><strong>Phí thoát ly</strong> — fixed per-combo trong 12 tháng sau khi downline tự lên rank.</li>
          </ul>
          <p>Bảng "Lịch sử rank" và biểu đồ doanh thu 6 tháng gần nhất ở dưới.</p>
        </Section>

        {/* 5. CTV — Tree */}
        <Section id="ctv-tree" title="5. CTV — Sơ đồ nhóm">
          <p>Trang <code>/tree</code> hiển thị toàn bộ downline (F1/F2/F3) của user hiện tại dưới dạng cây.</p>
          <ul>
            <li>Tên + cấp bậc của từng node.</li>
            <li>Hover/click để xem chi tiết: doanh thu cá nhân tháng + số con trực tiếp.</li>
            <li>Đường line màu khác nhau theo cấp (giúp dễ nhìn cây sâu).</li>
          </ul>
        </Section>

        {/* 6. CTV — Fees */}
        <Section id="ctv-fees" title="6. CTV — Phí quản lý & Phí thoát ly">
          <p>Trang <code>/fees</code> liệt kê 2 loại phí nhận được trong tháng:</p>
          <h4>Phí quản lý (Management Fee)</h4>
          <p>
            Khi downline F1/F2/F3 bán combo, upline nhận <strong>10% / 5% / 3%</strong>
            doanh thu combo cá nhân của downline đó. Điều kiện: upline phải có ≥20h
            đào tạo trong tháng (xem cột "20h gate" → tick xanh nếu đạt).
          </p>
          <h4>Phí thoát ly (Breakaway Fee)</h4>
          <p>
            Khi downline tự lên cùng rank với upline → downline <em>thoát ly</em> (re-parent
            lên grandparent). Để bù đắp, upline cũ vẫn nhận một khoản <strong>fixed
            per-combo</strong> trong <strong>12 tháng</strong> đầu sau breakaway.
          </p>
          <Callout type="info">
            Tier phí thoát ly = (cấp upline cũ × COMBO_PRICE × hệ số). Cấu hình combo
            mặc định ở env <code>COMBO_PRICE=1.800.000đ</code>.
          </Callout>
        </Section>

        {/* 7. Admin — Dashboard */}
        <Section id="admin-dash" title="7. Admin — Tổng quan">
          <p>Trang <code>/admin</code> (chỉ admin):</p>
          <ul>
            <li><strong>Tổng doanh thu</strong> hệ thống tháng / quý / năm.</li>
            <li><strong>Tổng hoa hồng + lương cứng</strong> đã chi.</li>
            <li><strong>% sử dụng quỹ lương</strong> (cap 5% doanh thu — cảnh báo nếu {'>'}80%).</li>
            <li><strong>Top CTV</strong> theo doanh số + theo tăng trưởng F1.</li>
          </ul>
        </Section>

        {/* 8. Admin — CTV */}
        <Section id="admin-ctv" title="8. Admin — Quản lý CTV">
          <p>Trang <code>/admin/ctv</code>:</p>
          <ul>
            <li><strong>Bảng danh sách</strong> tất cả CTV + filter theo rank / parent / active.</li>
            <li><strong>Tạo CTV mới</strong> — chọn rank + parent (manager trực tiếp).</li>
            <li><strong>Đổi rank</strong> — log lại oldRank/newRank trong <code>RankHistory</code>.</li>
            <li><strong>Chuyển manager</strong> (re-parent thủ công, kèm validate vòng cây).</li>
            <li><strong>Tắt/bật</strong> tài khoản (isActive).</li>
          </ul>
        </Section>

        {/* 9. Admin — Commission */}
        <Section id="admin-comm" title="9. Admin — Cấu hình hoa hồng">
          <p>Trang <code>/admin/commission</code>:</p>
          <ul>
            <li>Sửa % hoa hồng (self / F1 / F2 / F3) cho từng cấp.</li>
            <li>Sửa mức lương cứng cố định / tháng.</li>
            <li>Sửa hệ số phí thoát ly per-combo.</li>
            <li>Mọi thay đổi sẽ áp dụng cho tháng tiếp theo (tránh phá vỡ payout đang chạy).</li>
          </ul>
          <Callout type="warn">
            Đây là setting <strong>toàn hệ thống</strong> — chỉ super-admin nên sửa.
            Cấu hình lưu trong table <code>CommissionConfig</code>; có cache 60s.
          </Callout>
        </Section>

        {/* 10. Admin — Payouts */}
        <Section id="admin-payouts" title="10. Admin — Chi trả">
          <p>Trang <code>/admin/payouts</code> để chạy payout cuối tháng:</p>
          <ol>
            <li><strong>Chọn tháng</strong> (vd <code>2026-06</code>).</li>
            <li>Hệ thống tính tự động: commission + management fee + breakaway fee + lương cứng.</li>
            <li>Hiển thị bảng <em>preview</em>: ai nhận bao nhiêu, breakdown từng khoản.</li>
            <li>Bấm <strong>"Chốt chi trả"</strong> → lock các con số, in xuất file Excel/PDF.</li>
            <li>Sau khi chốt không thể sửa rank/hoa hồng của tháng đó.</li>
          </ol>
        </Section>

        {/* 11. Calculator */}
        <Section id="calculator" title="11. Calculator (Dream Sales)">
          <p>Trang <code>/calculator</code> dùng bộ máy tính độc lập, dữ liệu lưu Firebase:</p>
          <ul>
            <li><strong>Đăng nhập Google</strong> riêng cho calculator (khác JWT app chính).</li>
            <li><strong>Tạo nhiều dự án</strong>, mỗi dự án có doanh thu / chi phí / lợi nhuận.</li>
            <li>Recharts vẽ biểu đồ break-even, ROI, dòng tiền.</li>
            <li>Chia sẻ link dự án (Firestore rules giới hạn theo email owner).</li>
          </ul>
          <Callout type="info">
            Firebase config đã có sẵn trong <code>firebase-web-config.json</code> ở
            root repo, project <code>dream-sales-318e8</code>. Không cần setup thêm.
          </Callout>
        </Section>

        {/* 12. Engines */}
        <Section id="engines" title="12. Cơ chế tính tiền — 3 engine">
          <h4>12.1 Commission (services/commission.js)</h4>
          <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-xs overflow-x-auto"><code>{`totalIncome =
    selfSalesAmount  × selfSale%
  + Σ(F1 revenue)    × direct%
  + Σ(F2 revenue)    × indirect2%
  + Σ(F3 revenue)    × indirect3%
  + fixedSalary    (nếu enabled + đủ điều kiện)

// Cap: tổng lương cứng toàn hệ thống ≤ 5% doanh thu CTV channel.`}</code></pre>

          <h4>12.2 Management Fee (services/managementFee.js)</h4>
          <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-xs overflow-x-auto"><code>{`Với mỗi downline d trong cây:
  if d không thoát ly:
    upline.f1  += d.selfRevenue × 10%   (nếu trainingHours ≥ 20h)
    upline.f2  += d.selfRevenue ×  5%
    upline.f3  += d.selfRevenue ×  3%

// Gate 20h: tổng trainingMinutes(month, upline) ≥ 1200`}</code></pre>

          <h4>12.3 Breakaway (services/breakaway.js)</h4>
          <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-xs overflow-x-auto"><code>{`Khi mentee.rank === mentor.rank:
  1. BreakawayLog ghi nhận old/new parent + ngày
  2. Mentee.parentId = mentor.parentId (re-parent lên grandparent)
  3. 12 tháng tiếp theo, upline cũ vẫn nhận BreakawayFee
       fee = COMBO_PRICE × tierMultiplier[oldRank]
     mỗi combo mentee bán được.`}</code></pre>
        </Section>

        {/* 13. FAQ */}
        <Section id="faq" title="13. FAQ & lỗi thường gặp">
          <h4>Token hết hạn / 401 Unauthorized</h4>
          <p>Hệ thống tự logout và redirect <code>/login</code>. Đăng nhập lại bằng tài khoản demo.</p>

          <h4>Calculator hỏi đăng nhập Google nhưng không hiện popup</h4>
          <p>Trình duyệt block popup → cho phép popup cho <code>localhost:3001</code> trong settings.</p>

          <h4>Số liệu không cập nhật ngay sau khi sửa rank/commission</h4>
          <p>
            Backend cache TTL 60s. Đợi 1 phút hoặc restart backend
            (<code>pkill -f &quot;node src/server.js&quot;</code>).
          </p>

          <h4>Phí quản lý của tôi = 0 dù downline có doanh thu</h4>
          <p>
            Kiểm tra cột "20h gate" trên trang <code>/fees</code>. Nếu chưa đạt 20h
            đào tạo trong tháng thì phí F1 bị skip (CCB Mart rule).
          </p>

          <h4>Liên hệ hỗ trợ</h4>
          <p>
            Mọi vấn đề kỹ thuật / bug, vui lòng tạo issue trong repo
            <a href="https://github.com/hotrovanhanh247/dream-sales" target="_blank" rel="noreferrer" className="text-indigo-600 underline ml-1">hotrovanhanh247/dream-sales</a>.
          </p>
        </Section>

        <footer className="text-xs text-slate-400 pt-8 border-t border-slate-200">
          Dream Sales · Hướng dẫn được tự sinh từ codebase. Sửa file{' '}
          <code>frontend/app/(app)/guide/page.tsx</code> nếu muốn thay đổi nội dung.
        </footer>
      </article>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6">
      <h2 className="text-xl font-bold mb-4 pb-2 border-b border-slate-200">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-slate-700 [&_h4]:font-semibold [&_h4]:text-slate-900 [&_h4]:mt-4 [&_h4]:mb-2 [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[0.85em] [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1 [&_p]:my-0 [&_table_code]:bg-transparent">
        {children}
      </div>
    </section>
  );
}

function Callout({ type, children }: { type: 'info' | 'warn'; children: React.ReactNode }) {
  const style = type === 'warn'
    ? 'border-amber-200 bg-amber-50 text-amber-900'
    : 'border-sky-200 bg-sky-50 text-sky-900';
  const Icon = type === 'warn' ? AlertCircle : Sparkles;
  return (
    <div className={`flex gap-3 p-3 rounded-lg border ${style} text-sm my-3`}>
      <Icon size={16} className="shrink-0 mt-0.5" />
      <div className="space-y-1 [&_code]:bg-white/60 [&_code]:px-1 [&_code]:rounded">{children}</div>
    </div>
  );
}
