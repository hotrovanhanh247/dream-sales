const express = require('express');
const { calculateMonthlyManagementFees } = require('../../services/managementFee');
const { handleBreakaway, processMonthlyBreakawayFees, shouldBreakaway } = require('../../services/breakaway');
const { asyncHandler, AppError } = require('../../middleware/errorHandler');
const { validate, schemas } = require('../../middleware/validate');

const router = express.Router();
const prisma = require('../../lib/prisma');

// ---- Management fees (F1/F2/F3) ----

// Run monthly management-fee calculation (idempotent — recomputes PENDING for the month)
router.post('/management-fees/run', validate(schemas.monthQuery, 'query'), asyncHandler(async (req, res) => {
  const now = new Date();
  const month = req.query.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  res.json(await calculateMonthlyManagementFees(month));
}));

// List management-fee records for a month
router.get('/management-fees', validate(schemas.monthQuery, 'query'), asyncHandler(async (req, res) => {
  const now = new Date();
  const month = req.query.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const records = await prisma.managementFee.findMany({
    where: { month },
    include: {
      fromUser: { select: { id: true, name: true, rank: true } },
      toUser: { select: { id: true, name: true, rank: true } },
    },
    orderBy: [{ toUserId: 'asc' }, { level: 'asc' }],
  });
  res.json({ month, records });
}));

// ---- Breakaway (thoát ly) ----

// Manually trigger a breakaway when a trainee has reached >= mentor rank
router.post('/breakaway/trigger', asyncHandler(async (req, res) => {
  const { traineeId, mentorId } = req.body;
  if (!traineeId || !mentorId) throw new AppError('traineeId and mentorId required', 400, 'MISSING_FIELDS');
  const result = await handleBreakaway(parseInt(traineeId, 10), parseInt(mentorId, 10));
  res.json(result);
}));

// Run monthly breakaway-fee calculation (phase-1 fixed per-combo fees)
router.post('/breakaway/fees/run', validate(schemas.monthQuery, 'query'), asyncHandler(async (req, res) => {
  const now = new Date();
  const month = req.query.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  res.json(await processMonthlyBreakawayFees(month));
}));

// List active breakaway logs
router.get('/breakaway/logs', asyncHandler(async (_req, res) => {
  const logs = await prisma.breakawayLog.findMany({
    include: {
      user: { select: { id: true, name: true, rank: true } },
      oldParent: { select: { id: true, name: true, rank: true } },
      newParent: { select: { id: true, name: true, rank: true } },
    },
    orderBy: { breakawayAt: 'desc' },
  });
  res.json({ logs });
}));

// Check whether a trainee would break away from a mentor (preview, no writes)
router.get('/breakaway/check', asyncHandler(async (req, res) => {
  const traineeId = parseInt(req.query.traineeId, 10);
  const mentorId = parseInt(req.query.mentorId, 10);
  if (!traineeId || !mentorId) throw new AppError('traineeId and mentorId required', 400, 'MISSING_FIELDS');
  const [trainee, mentor] = await Promise.all([
    prisma.user.findUnique({ where: { id: traineeId }, select: { rank: true } }),
    prisma.user.findUnique({ where: { id: mentorId }, select: { rank: true } }),
  ]);
  if (!trainee || !mentor) throw new AppError('Trainee or mentor not found', 404, 'NOT_FOUND');
  res.json({ breakaway: shouldBreakaway(trainee.rank, mentor.rank), traineeRank: trainee.rank, mentorRank: mentor.rank });
}));

module.exports = router;
