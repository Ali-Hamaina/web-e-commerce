// routes/verifyCode.js
const express = require('express');
const router = express.Router();

require('dotenv').config();

router.post('/', (req, res) => {
  const { code } = req.body;
  if (code === process.env.ADMIN_PASSWORD) {
    res.status(200).json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'رمز خاطئ' });
  }
});

module.exports = router;
