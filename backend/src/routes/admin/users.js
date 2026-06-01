const express = require('express');
const bcrypt = require('bcryptjs');
const { asyncHandler, AppError } = require('../../middleware/errorHandler');
const { validate, schemas } = require('../../middleware/validate');
const { invalidateCommissionCache } = require('../../services/commission');

const router = express.Router();
const prisma = require('../../lib/prisma');

const CTV_SELECT = {
  id: true, email: true, name: true, phone: true, rank: true,
  parentId: true, isActive: true, isBusinessHousehold: true, createdAt: true,
};

// List all CTV (flat)
router.get('/ctv', asyncHandler(async (_req, res) => {
  const ctvs = await prisma.user.findMany({
    where: { role: 'ctv' },
    select: CTV_SELECT,
    orderBy: [{ rank: 'asc' }, { createdAt: 'asc' }],
  });
  res.json({ ctvs });
}));

// Create a CTV
router.post('/ctv', validate(schemas.createCtv), asyncHandler(async (req, res) => {
  const { email, password, name, phone, parentId, rank } = req.body;
  const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (exists) throw new AppError('Email already in use', 409, 'EMAIL_TAKEN');

  if (parentId) {
    const parent = await prisma.user.findUnique({ where: { id: parentId }, select: { id: true, role: true } });
    if (!parent || parent.role !== 'ctv') throw new AppError('parentId must be an existing CTV', 400, 'BAD_PARENT');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, name, phone, role: 'ctv', rank: rank || 'CTV', parentId: parentId || null },
    select: CTV_SELECT,
  });
  invalidateCommissionCache();
  res.status(201).json(user);
}));

// Reassign a CTV to a new parent
router.patch('/ctv/:id/reassign', validate(schemas.reassignCtv), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { newParentId } = req.body;
  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
  if (!target || target.role !== 'ctv') throw new AppError('CTV not found', 404, 'CTV_NOT_FOUND');
  if (newParentId === id) throw new AppError('Cannot set self as parent', 400, 'SELF_PARENT');
  if (newParentId) {
    const parent = await prisma.user.findUnique({ where: { id: newParentId }, select: { id: true, role: true } });
    if (!parent || parent.role !== 'ctv') throw new AppError('newParentId must be an existing CTV', 400, 'BAD_PARENT');
  }
  const updated = await prisma.user.update({ where: { id }, data: { parentId: newParentId }, select: CTV_SELECT });
  invalidateCommissionCache();
  res.json(updated);
}));

// Change a CTV's rank
router.patch('/ctv/:id/rank', validate(schemas.changeRank), asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { newRank, reason } = req.body;
  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true, rank: true } });
  if (!target || target.role !== 'ctv') throw new AppError('CTV not found', 404, 'CTV_NOT_FOUND');

  const [updated] = await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { rank: newRank }, select: CTV_SELECT }),
    prisma.rankHistory.create({
      data: { ctvId: id, oldRank: target.rank || 'CTV', newRank, reason: reason || 'admin change', changedBy: 'admin', changedById: req.user.id },
    }),
  ]);
  invalidateCommissionCache();
  res.json(updated);
}));

// Activate / deactivate a CTV
router.patch('/ctv/:id/toggle-active', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true, isActive: true } });
  if (!target || target.role !== 'ctv') throw new AppError('CTV not found', 404, 'CTV_NOT_FOUND');
  const updated = await prisma.user.update({ where: { id }, data: { isActive: !target.isActive }, select: CTV_SELECT });
  invalidateCommissionCache();
  res.json(updated);
}));

module.exports = router;
