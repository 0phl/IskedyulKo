const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db/connection');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all services for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [services] = await db.execute(
      'SELECT * FROM services WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.userId]
    );

    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get services by business slug (public)
router.get('/public/:slug', async (req, res) => {
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

    const [services] = await db.execute(
      'SELECT * FROM services WHERE user_id = ? ORDER BY created_at DESC',
      [users[0].id]
    );

    res.json(services);
  } catch (error) {
    console.error('Error fetching public services:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create service
router.post('/', authenticateToken, [
  body('name').notEmpty().trim(),
  body('price').isFloat({ min: 0 }),
  body('duration').isInt({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, price, duration } = req.body;

    const [result] = await db.execute(
      'INSERT INTO services (user_id, name, price, duration) VALUES (?, ?, ?, ?)',
      [req.user.userId, name, price, duration]
    );

    res.status(201).json({
      message: 'Service created successfully',
      serviceId: result.insertId
    });

  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update service
router.put('/:id', authenticateToken, [
  body('name').notEmpty().trim(),
  body('price').isFloat({ min: 0 }),
  body('duration').isInt({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, price, duration } = req.body;

    const [result] = await db.execute(
      'UPDATE services SET name = ?, price = ?, duration = ? WHERE id = ? AND user_id = ?',
      [name, price, duration, id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({ message: 'Service updated successfully' });

  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete service
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if service has any appointments
    const [appointments] = await db.execute(
      'SELECT id FROM appointments WHERE service_id = ? AND status != "cancelled"',
      [id]
    );

    if (appointments.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete service with active appointments' 
      });
    }

    const [result] = await db.execute(
      'DELETE FROM services WHERE id = ? AND user_id = ?',
      [id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json({ message: 'Service deleted successfully' });

  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
