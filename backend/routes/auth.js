const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Admin verification middleware
const verifyAdmin = (req, res, next) => {
  const { code } = req.body;
  
  if (code !== process.env.ADMIN_CODE) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid admin code' 
    });
  }
  
  next();
};

// POST /api/auth/verify-admin - Verify admin code
router.post('/verify-admin', [
  body('code')
    .notEmpty()
    .withMessage('Admin code is required')
], verifyAdmin, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation failed', 
      errors: errors.array() 
    });
  }

  res.json({ 
    success: true, 
    message: 'Admin verified successfully' 
  });
});

module.exports = router;
