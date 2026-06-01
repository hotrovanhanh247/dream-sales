const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { loginLimiter } = require('../middleware/rateLimiter');
const { validate, schemas } = require('../middleware/validate');
const { authenticate: authMw } = require('../middleware/auth');

const router = express.Router();
const prisma = require('../lib/prisma');

router.post('/login', loginLimiter, validate(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.isActive) return res.status(403).json({ error: 'Account is inactive' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, rank: user.rank, name: user.name },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, rank: user.rank, name: user.name },
    });
  } catch (err) {
    console.error('[auth/login]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', (_req, res) => res.json({ success: true }));

router.get('/me', authMw, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, role: true, rank: true, name: true, phone: true, isActive: true },
    });
    if (!user || !user.isActive) return res.status(401).json({ error: 'Account inactive or not found' });
    const { isActive, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    console.error('[auth/me]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
