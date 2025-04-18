const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all investments for the current user
router.get('/', async (req, res) => {
  try {
    const userId = req.session.userId; // Assuming session middleware is set up
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User not authenticated' });
    }

    const [investments] = await db.execute(
      'SELECT * FROM investments WHERE user_id = ? ORDER BY date DESC',
      [userId]
    );

    res.json({ success: true, investments });
  } catch (err) {
    console.error('Error fetching investments:', err);
    res.status(500).json({ success: false, message: 'Server error', errorDetails: err.message });
  }
});

// POST a new investment
router.post('/', async (req, res) => {
  try {
    const { name, amount, type, date } = req.body;
    const userId = req.session.userId;

    if (!name || !amount || !type || !date) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a positive number' });
    }

    await db.execute(
      'INSERT INTO investments (user_id, name, amount, type, date) VALUES (?, ?, ?, ?, ?)',
      [userId, name, amount, type, date]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error adding investment:', err);
    res.status(500).json({ success: false, message: 'Server error', errorDetails: err.message });
  }
});

module.exports = router;
