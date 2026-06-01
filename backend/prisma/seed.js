const bcrypt = require('bcryptjs');
const prisma = require('../src/lib/prisma');
const { COMMISSION_RATES, AGENCY_COMMISSION } = require('../src/services/commission');

async function main() {
  console.log('[seed] commission config...');
  for (const [tier, r] of Object.entries(COMMISSION_RATES)) {
    await prisma.commissionConfig.upsert({
      where: { tier },
      update: { selfSalePct: r.selfSale, directPct: r.direct, indirect2Pct: r.indirect2, indirect3Pct: r.indirect3, fixedSalary: r.fixedSalary },
      create: { tier, selfSalePct: r.selfSale, directPct: r.direct, indirect2Pct: r.indirect2, indirect3Pct: r.indirect3, fixedSalary: r.fixedSalary },
    });
  }
  for (const [group, r] of Object.entries(AGENCY_COMMISSION)) {
    await prisma.agencyCommissionConfig.upsert({
      where: { group },
      update: { commissionPct: r.commission, bonusPct: r.bonus },
      create: { group, commissionPct: r.commission, bonusPct: r.bonus },
    });
  }

  console.log('[seed] admin user...');
  const adminHash = await bcrypt.hash('Admin@1234', 10);
  await prisma.user.upsert({
    where: { email: 'admin@dream-sales.local' },
    update: {},
    create: { email: 'admin@dream-sales.local', passwordHash: adminHash, role: 'admin', name: 'Quản trị viên', rank: null },
  });

  console.log('[seed] CTV tree...');
  const ctvHash = await bcrypt.hash('Password@123', 10);
  async function ctv(email, name, rank, parentId) {
    return prisma.user.upsert({
      where: { email },
      update: { rank, parentId },
      create: { email, passwordHash: ctvHash, role: 'ctv', name, rank, parentId },
    });
  }
  const gdkd = await ctv('gdkd@dream-sales.local', 'Lê Văn GĐKD', 'GDKD', null);
  const gdv  = await ctv('gdv@dream-sales.local',  'Trần Thị GĐV',  'GDV',  gdkd.id);
  const tp   = await ctv('tp@dream-sales.local',   'Phạm Văn TP',   'TP',   gdv.id);
  const pp   = await ctv('pp@dream-sales.local',   'Nguyễn Thị PP', 'PP',   tp.id);
  const ctv1 = await ctv('ctv1@dream-sales.local', 'Hoàng Văn A',   'CTV',  pp.id);
  const ctv2 = await ctv('ctv2@dream-sales.local', 'Vũ Thị B',      'CTV',  pp.id);

  console.log('[seed] transactions (current month)...');
  // wipe prior seed txns to keep idempotent
  await prisma.transaction.deleteMany({ where: { customerId: null } });
  const COMBO = 1_800_000;
  async function combos(user, count) {
    for (let i = 0; i < count; i++) {
      await prisma.transaction.create({
        data: { ctvId: user.id, channel: 'ctv', status: 'CONFIRMED', totalAmount: COMBO },
      });
    }
  }
  await combos(ctv1, 30);
  await combos(ctv2, 20);
  await combos(pp, 10);
  await combos(tp, 5);
  await combos(gdv, 3);
  await combos(gdkd, 2);

  // A verified training log so management fees pass the 20h gate for the uplines.
  console.log('[seed] training logs (20h gate)...');
  const now = new Date();
  for (const trainer of [pp, tp, gdv, gdkd]) {
    const exists = await prisma.trainingLog.findFirst({ where: { trainerId: trainer.id, status: 'VERIFIED' } });
    if (!exists) {
      await prisma.trainingLog.create({
        data: {
          trainerId: trainer.id, traineeId: ctv1.id,
          sessionDate: now, durationMinutes: 20 * 60, content: 'Seed training session',
          status: 'VERIFIED', verifiedAt: now,
        },
      });
    }
  }

  console.log('[seed] done.');
  console.log('  admin: admin@dream-sales.local / Admin@1234');
  console.log('  ctv:   gdkd@dream-sales.local (and gdv/tp/pp/ctv1/ctv2) / Password@123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
