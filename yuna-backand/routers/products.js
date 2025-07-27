
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// ✅ جلب كل المنتجات
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب المنتجات', error });
  }
});

// ✅ إضافة منتج جديد
router.post('/', async (req, res) => {
  try {
    const { name, price, image } = req.body;

    if (!name || !price || !image) {
      return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
    }

    const newProduct = new Product({
      name,
      price,
      image
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'فشل في إضافة المنتج', error });
  }
});

// ✅ حذف منتج
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }

    res.json({ message: 'تم حذف المنتج بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ أثناء الحذف', error });
  }
});

// ✅ تعديل منتج
router.put('/:id', async (req, res) => {
  try {
    const { name, price, image } = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price, image },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'فشل في تعديل المنتج', error });
  }
});

module.exports = router;
