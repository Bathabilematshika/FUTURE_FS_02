const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const router = express.Router();

// The admin password is hashed once when the server starts
const adminPasswordHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || '', 10);

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const emailOk =
  email &&
  process.env.ADMIN_EMAIL &&
  email.trim().toLowerCase() === process.env.ADMIN_EMAIL.trim().toLowerCase();
  const passwordOk = password && (await bcrypt.compare(password, adminPasswordHash));

  if (!emailOk || !passwordOk) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: '8h',
  });
  res.json({ token });
});

module.exports = router;