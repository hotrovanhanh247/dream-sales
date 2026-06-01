const express = require('express');
const {
  getCommissionRates,
  invalidateCommissionCache,
  calculateAllCtvCommissions,
  calculateSalaryFundStatus,
} = require('../../services/commission');
const { validate, schemas } = require('../../middleware/validate');
const { asyncHandler } = require('../../middleware/errorHandler');

const router = express.Router();
const prisma = require('../../lib/prisma');

// View commission rate config
router.get('/config/commission', asyncHandler(async (_req, res) => {
  const [ctvConfig, rates] = await Promise.all([
    prisma.commissionConfig.findMany({ orderBy: { id: 'asc' } }),
    getCommissionRates(),
  ]);
  res.json({ ctvConfig, rates });
}));

// Update a rank's commission rates
router.put('/config/commission/:tier', validate(schemas.updateCommission), asyncHandler(async (req, res) => {
  const { selfSalePct, directPct, indirect2Pct, indirect3Pct, fixedSalary } = req.body;
  const config = await prisma.commissionConfig.update({
    where: { tier: req.params.tier },
    data: { selfSalePct, directPct, indirect2Pct, indirect3Pct, fixedSalary },
  });
  invalidateCommissionCache();
  res.json(config);
}));

// Commission report for all CTV in a month
router.get('/commission/report', validate(schemas.monthQuery, 'query'), asyncHandler(async (req, res) => {
  const now = new Date();
  const month = req.query.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const results = await calculateAllCtvCommissions(month);
  res.json({ month, rows: Array.from(results.values()) });
}));

// Salary-fund usage status (fixed salaries vs 5% of CTV revenue)
router.get('/commission/salary-fund', validate(schemas.monthQuery, 'query'), asyncHandler(async (req, res) => {
  const now = new Date();
  const month = req.query.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  res.json(await calculateSalaryFundStatus(month));
}));

module.exports = router;
