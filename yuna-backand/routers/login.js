const express = require('express');
const router = express.Router();
require('dotenv').config();

router.post('/', (req, res) => {
  const { password } = req.body;

  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'كلمة المرور خاطئة' });
  }
});

module.exports = router;
