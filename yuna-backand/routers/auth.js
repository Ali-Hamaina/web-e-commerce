const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');
const bcrypt = require('bcrypt');

// تسجيل دخول الأدمن
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // التحقق من وجود بيانات
    if (!username || !password) {
      return res.status(400).json({ message: 'يرجى إدخال اسم المستخدم وكلمة المرور.' });
    }

    // البحث عن الأدمن في القاعدة
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
    }

    // التحقق من كلمة المرور
    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
    }

    // تسجيل الدخول ناجح
    // يمكنك هنا إنشاء جلسة أو توكن JWT أو أي طريقة تحبها للمصادقة
    // الآن نرسل رد بنجاح فقط:
    res.json({ message: 'تم تسجيل الدخول بنجاح.', admin: { username: admin.username } });

  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم.' });
  }
});

module.exports = router;
