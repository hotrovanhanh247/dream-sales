const express = require('express');
const { getCachedOrCompute } = require('../../services/cache');
const { calculateSalaryFundStatus } = require('../../services/commission');
const { asyncHandler } = require('../../middleware/errorHandler');

const router = express.Router();
const prisma = require('../../lib/prisma');

// Admin overview: CTV counts by rank, monthly revenue, salary-fund status.
router.get('/dashboard', asyncHandler(async (_req, res) => {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const data = await getCachedOrCompute(`admin:dashboard:${month}`, 120, async () => {
    const [byRank, monthAgg, totalCtv, activeCtv, salaryFund] = await Promise.all([
      prisma.user.groupBy({ by: ['rank'], where: { role: 'ctv', isActive: true }, _count: { id: true } }),
      prisma.transaction.aggregate({
        where: { channel: 'ctv', status: 'CONFIRMED', createdAt: { gte: startOfMonth } },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
      prisma.user.count({ where: { role: 'ctv' } }),
      prisma.user.count({ where: { role: 'ctv', isActive: true } }),
      calculateSalaryFundStatus(month),
    ]);

    return {
      month,
      ctvByRank: byRank.map(r => ({ rank: r.rank || 'CTV', count: r._count.id })),
      totalCtv,
      activeCtv,
      monthRevenue: Number(monthAgg._sum.totalAmount) || 0,
      monthCombos: monthAgg._count.id,
      salaryFund,
    };
  });

  res.json(data);
}));

module.exports = router;
