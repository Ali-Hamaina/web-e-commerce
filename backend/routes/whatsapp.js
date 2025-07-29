const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// POST /api/whatsapp/order - Generate WhatsApp message with product data only
router.post('/order', async (req, res) => {
  try {
    const { items, customerInfo } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        message: 'Items are required for WhatsApp order' 
      });
    }

    if (!customerInfo || !customerInfo.name || !customerInfo.phone) {
      return res.status(400).json({ 
        message: 'Customer name and phone are required for WhatsApp order' 
      });
    }

    // Verify all products exist and build clean product data
    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ 
          message: `Product with ID ${item.productId} not found` 
        });
      }

      if (!product.inStock) {
        return res.status(400).json({ 
          message: `Product "${product.name}" is out of stock` 
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        total: itemTotal
      });
    }

    // Generate WhatsApp message with ONLY order details (no customer info)
    const productList = orderItems.map((item) => 
      `- Produit : ${item.name}\n- Quantité : ${item.quantity}\n- Prix total : ${item.total.toFixed(2)} MAD`
    ).join('\n\n');

    const whatsappMessage = `Nouvelle commande :

${productList}

Total de la commande : ${totalAmount.toFixed(2)} MAD`;

    // Also generate Arabic version as alternative
    const productListArabic = orderItems.map((item) => 
      `- المنتج: ${item.name}\n- الكمية: ${item.quantity}\n- السعر الإجمالي: ${item.total.toFixed(2)} درهم`
    ).join('\n\n');

    const whatsappMessageArabic = `طلب جديد:

${productListArabic}

إجمالي الطلب: ${totalAmount.toFixed(2)} درهم`;

    // Return clean message data without saving to database
    res.json({
      success: true,
      message: 'WhatsApp message generated successfully',
      whatsappData: {
        message: whatsappMessage, // French format as requested
        messageArabic: whatsappMessageArabic, // Arabic alternative
        phoneNumber: '212713071000', // Your WhatsApp business number
        totalAmount,
        itemCount: orderItems.length
      }
    });

  } catch (error) {
    console.error('Error generating WhatsApp order:', error);
    res.status(500).json({ 
      message: 'Error generating WhatsApp order', 
      error: error.message 
    });
  }
});

module.exports = router;
