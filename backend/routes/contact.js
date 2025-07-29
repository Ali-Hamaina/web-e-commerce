const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// Create contact route
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'الرجاء ملء جميع الحقول المطلوبة'
      });
    }

    // Create new contact message
    const contact = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      subject: subject ? subject.trim() : 'رسالة عامة',
      message: message.trim()
    });

    const savedContact = await contact.save();

    console.log('📧 Contact form submission saved:', {
      id: savedContact._id,
      name: savedContact.name,
      email: savedContact.email,
      subject: savedContact.subject,
      timestamp: savedContact.createdAt
    });

    res.json({
      success: true,
      message: 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً',
      contactId: savedContact._id
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في إرسال الرسالة'
    });
  }
});

// GET /api/contact - Get all contact messages (Admin only)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(filter);

    res.json({
      success: true,
      contacts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching contacts', 
      error: error.message 
    });
  }
});

// GET /api/contact/:id - Get single contact message
router.get('/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ 
        success: false,
        message: 'Contact message not found' 
      });
    }

    res.json({
      success: true,
      contact
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid contact ID' 
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Error fetching contact', 
      error: error.message 
    });
  }
});

// PATCH /api/contact/:id/status - Update contact status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['unread', 'read', 'replied'].includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid status' 
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({ 
        success: false,
        message: 'Contact message not found' 
      });
    }

    res.json({
      success: true,
      message: 'Contact status updated successfully',
      contact
    });
  } catch (error) {
    console.error('Error updating contact status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating contact status', 
      error: error.message 
    });
  }
});

// POST /api/contact/:id/reply - Add admin reply
router.post('/:id/reply', async (req, res) => {
  try {
    const { adminReply } = req.body;

    if (!adminReply || !adminReply.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'Reply message is required' 
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { 
        adminReply: adminReply.trim(),
        status: 'replied',
        repliedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({ 
        success: false,
        message: 'Contact message not found' 
      });
    }

    res.json({
      success: true,
      message: 'Reply added successfully',
      contact
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error adding reply', 
      error: error.message 
    });
  }
});

// DELETE /api/contact/:id - Delete contact message
router.delete('/:id', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({ 
        success: false,
        message: 'Contact message not found' 
      });
    }

    res.json({
      success: true,
      message: 'Contact message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting contact', 
      error: error.message 
    });
  }
});

module.exports = router;
