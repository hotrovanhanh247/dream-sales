# Dream Sales

Monorepo merging **CCB Mart's CTV payout logic** with the **Dream Sales commission calculator**.

```
dream-sales/
├── backend/        Express + Prisma + PostgreSQL — lean CTV payout API (ported from CCB Mart)
├── frontend/       Next.js 16 — CTV/Admin app + Dream Sales calculator menu
├── scripts/        Firebase ops helpers (rules deploy/check, auth domain)
├── firestore.rules Firestore security rules (calculator data)
└── firebase.json   Firebase project config (dream-sales-318e8)
```

## Backend (`/backend`)

Lean port of CCB Mart's CTV subsystem. Hierarchy of 5 ranks (CTV → PP → TP → GĐV → GĐKD)
with **three payout engines**, kept verbatim from the original:

- **Commission** — self-sale + F1/F2/F3 (direct/indirect2/indirect3) + fixed salary, capped by a 5%-of-revenue salary fund.
- **Management fee** — CCB Mart pays uplines 10%/5%/3% on a downline's personal combo revenue, gated on ≥20h training/month.
- **Breakaway (thoát ly)** — when a trainee reaches their mentor's rank, they re-parent to the grandparent and old uplines earn fixed per-combo fees for 12 months.

Stack: Express 4, Prisma 6, PostgreSQL, JWT auth, in-memory cache (Redis optional). Deploy: **Railway**.

```bash
cd backend
cp .env.example .env          # set DATABASE_URL + JWT_SECRET
npm install
npx prisma migrate deploy
npm run seed                  # admin + demo CTV tree + transactions
npm run dev                   # http://localhost:8080
```

Seed accounts: `admin@dream-sales.local / Admin@1234` · `gdkd@dream-sales.local … / Password@123`

## Frontend (`/frontend`)

Next.js 16 app. JWT login → role-based menu:

- **CTV**: dashboard (commission breakdown, KPI), org tree, management & breakaway fees, calculator.
- **Admin**: dashboard, CTV management, commission config/report, payout runs, calculator.
- **Calculator** (Dream Sales): the original commission/cost/profit planner, backed by Firestore (`dream-sales-318e8`), Google sign-in.

Stack: Next.js 16, React 19, Tailwind 4, recharts, Firebase. Deploy: **Vercel** (project root = `frontend/`).

```bash
cd frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:8090" > .env.local
npm install
npm run dev                   # http://localhost:3000
```
