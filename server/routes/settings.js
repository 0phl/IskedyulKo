const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../db/connection');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get general settings
router.get('/general', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT business_name, slug, contact_info, address FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching general settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get business info by slug (public)
router.get('/business/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const [users] = await db.execute(
      'SELECT business_name, slug, contact_info, address FROM users WHERE slug = ?',
      [slug]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching business info:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update general settings
router.put('/general', authenticateToken, [
  body('businessName').notEmpty().trim(),
  body('contactInfo').optional().trim(),
  body('address').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { businessName, contactInfo, address } = req.body;

    const [result] = await db.execute(
      'UPDATE users SET business_name = ?, contact_info = ?, address = ? WHERE id = ?',
      [businessName, contactInfo || null, address || null, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Settings updated successfully' });

  } catch (error) {
    console.error('Error updating general settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get working hours
router.get('/working-hours', authenticateToken, async (req, res) => {
  try {
    const [workingHours] = await db.execute(
      'SELECT * FROM working_hours WHERE user_id = ? ORDER BY day_of_week',
      [req.user.userId]
    );

    res.json(workingHours);
  } catch (error) {
    console.error('Error fetching working hours:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get working hours by slug (public)
router.get('/working-hours/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    // Get user by slug
    const [users] = await db.execute(
      'SELECT id FROM users WHERE slug = ?',
      [slug]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const [workingHours] = await db.execute(
      'SELECT * FROM working_hours WHERE user_id = ? ORDER BY day_of_week',
      [users[0].id]
    );

    res.json(workingHours);
  } catch (error) {
    console.error('Error fetching public working hours:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update working hours
router.put('/working-hours', authenticateToken, [
  body('workingHours').isArray(),
  body('workingHours.*.day_of_week').isInt({ min: 0, max: 6 }),
  body('workingHours.*.is_open').isBoolean(),
  body('workingHours.*.open_time').custom((value, { req, path }) => {
    const index = path.split('[')[1].split(']')[0];
    const isOpen = req.body.workingHours[index].is_open;
    if (isOpen && (!value || !value.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/))) {
      throw new Error('Valid open_time is required when is_open is true');
    }
    return true;
  }),
  body('workingHours.*.close_time').custom((value, { req, path }) => {
    const index = path.split('[')[1].split(']')[0];
    const isOpen = req.body.workingHours[index].is_open;
    if (isOpen && (!value || !value.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/))) {
      throw new Error('Valid close_time is required when is_open is true');
    }
    return true;
  }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { workingHours } = req.body;

    // Delete existing working hours
    await db.execute(
      'DELETE FROM working_hours WHERE user_id = ?',
      [req.user.userId]
    );

    // Insert new working hours
    for (const hours of workingHours) {
      await db.execute(
        'INSERT INTO working_hours (user_id, day_of_week, is_open, open_time, close_time) VALUES (?, ?, ?, ?, ?)',
        [
          req.user.userId,
          hours.day_of_week,
          hours.is_open,
          hours.is_open ? hours.open_time : null,
          hours.is_open ? hours.close_time : null
        ]
      );
    }

    res.json({ message: 'Working hours updated successfully' });

  } catch (error) {
    console.error('Error updating working hours:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/password', authenticateToken, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Get current user
    const [users] = await db.execute(
      'SELECT password FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, users[0].password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await db.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.user.userId]
    );

    res.json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
