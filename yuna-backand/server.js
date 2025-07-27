require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); 
app.use(express.json());

app.post('/api/verify-code', (req, res) => {
  const inputCode = req.body.code;
  const secretCode = process.env.ADMIN_CODE;

  if (inputCode === secretCode) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
});

app.listen(3000, () => console.log('✅ Server running on http://localhost:3000'));
