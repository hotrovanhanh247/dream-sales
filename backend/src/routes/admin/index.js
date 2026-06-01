const express = require('express');
const { authenticate, authorize } = require('../../middleware/auth');
const dashboardRouter = require('./dashboard');
const commissionRouter = require('./commission');
const usersRouter = require('./users');
const payoutsRouter = require('./payouts');

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.use('/', dashboardRouter);
router.use('/', commissionRouter);
router.use('/', usersRouter);
router.use('/', payoutsRouter);

module.exports = router;
