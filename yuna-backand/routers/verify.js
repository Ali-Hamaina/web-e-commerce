require('dotenv').config();
const express = require('express');
const router = express.Router();

router.post('/verify-code', (req, res) => {
  const { code } = req.body;

  if (code === process.env.ADMIN_PASSWORD) {
    res.status(200).json({ message: "تم التحقق بنجاح" });
  } else {
    res.status(401).json({ message: "كود غير صحيح" });
  }
});

module.exports = router;
