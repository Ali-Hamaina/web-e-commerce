// server.js أو في ملف routes منفصل
require('dotenv').config(); // لتحميل متغيرات .env

const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

app.post('/api/check-code', (req, res) => {
  const { code } = req.body;
  if (code === process.env.ADMIN_CODE) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
