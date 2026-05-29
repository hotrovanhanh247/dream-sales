# Dream Sales

Sales commission planner — tách độc lập từ MCRoomRent. Tính hoa hồng, chi phí dịch vụ,
chi phí cố định và lợi nhuận theo từng vị trí (GĐKD / GĐ Vùng / TP / PP / CTV) qua 12 tháng,
kèm sơ đồ tổ chức F1/F2/F3.

## Stack
- Vite + React 19 + TypeScript
- Tailwind CSS v4
- Firebase (Firestore + Google Auth)
- Deploy: Vercel

## Dev
```bash
npm install
npm run dev          # http://localhost:3001
```

## Cấu hình
- `firebase-web-config.json` — config web SDK (public, project `dream-sales-318e8`).
- `VITE_ALLOWED_EMAILS` — danh sách email được đăng nhập (xem `.env` / `.env.production`).
  Gate thực thi nằm ở `firestore.rules`; giữ hai nơi đồng bộ.

## Firestore
- Collections: `salesMonths`, `salesMembers`, `userPrefs`.
- Deploy rules: `firebase deploy --only firestore:rules --project dream-sales-318e8`.

## Migrate dữ liệu (một lần, từ MCRoomRent)
```bash
npm run migrate:sales
```
Cần hai service-account key trong `~/Secrets/` (xem `scripts/migrate-sales.cjs`).
