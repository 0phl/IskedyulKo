const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db/connection');
const { authenticateToken } = require('../middleware/auth');
const { generateTimeSlots, formatTo24Hour } = require('../utils/timeUtils');

const router = express.Router();

// Helper function to generate booking code
const generateBookingCode = (businessName) => {
  const prefix = businessName.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 10);
  const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${randomCode}`;
};

// Get all appointments (protected)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [appointments] = await db.execute(`
      SELECT a.*, s.name as service_name, s.price, s.duration
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      WHERE a.user_id = ?
      ORDER BY a.date DESC, a.time DESC
    `, [req.user.userId]);

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get today's appointments (protected)
router.get('/today', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const [appointments] = await db.execute(`
      SELECT a.*, s.name as service_name, s.price, s.duration
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      WHERE a.user_id = ? AND a.date = ?
      ORDER BY a.time ASC
    `, [req.user.userId, today]);

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching today\'s appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get upcoming appointments (protected)
router.get('/upcoming', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [appointments] = await db.execute(`
      SELECT a.*, s.name as service_name, s.price, s.duration
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      WHERE a.user_id = ? AND a.date > ? AND a.status IN ('pending', 'confirmed')
      ORDER BY a.date ASC, a.time ASC
    `, [req.user.userId, today]);

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create appointment (public - for customers)
router.post('/', [
  body('serviceId').isInt(),
  body('customerName').notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('date').isISO8601(),
  body('time').custom((value) => {
    // Accept both 12-hour format (e.g., "2:30 PM") and 24-hour format (e.g., "14:30")
    const time12Format = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;
    const time24Format = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!time12Format.test(value) && !time24Format.test(value)) {
      throw new Error('Time must be in 12-hour format (e.g., "2:30 PM") or 24-hour format (e.g., "14:30")');
    }
    return true;
  }),
  body('slug').notEmpty().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { serviceId, customerName, email, phone, date, slug } = req.body;
    let { time } = req.body;

    // Convert 12-hour format to 24-hour format if needed
    if (time.includes('AM') || time.includes('PM')) {
      time = formatTo24Hour(time);
    }

    // Get user by slug
    const [users] = await db.execute(
      'SELECT id, business_name FROM users WHERE slug = ?',
      [slug]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const user = users[0];

    // Verify service belongs to this user
    const [services] = await db.execute(
      'SELECT * FROM services WHERE id = ? AND user_id = ?',
      [serviceId, user.id]
    );

    if (services.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if time slot is available
    const [existingAppointments] = await db.execute(
      'SELECT id FROM appointments WHERE user_id = ? AND date = ? AND time = ? AND status != "cancelled"',
      [user.id, date, time]
    );

    if (existingAppointments.length > 0) {
      return res.status(400).json({ message: 'Time slot is not available' });
    }

    // Generate unique booking code
    let bookingCode;
    let isUnique = false;
    while (!isUnique) {
      bookingCode = generateBookingCode(user.business_name);
      const [existing] = await db.execute(
        'SELECT id FROM appointments WHERE booking_code = ?',
        [bookingCode]
      );
      isUnique = existing.length === 0;
    }

    // Create appointment
    const [result] = await db.execute(
      'INSERT INTO appointments (user_id, service_id, customer_name, email, phone, date, time, booking_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user.id, serviceId, customerName, email || null, phone || null, date, time, bookingCode]
    );

    res.status(201).json({
      message: 'Appointment booked successfully',
      bookingCode,
      appointmentId: result.insertId
    });

  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update appointment status (protected)
router.put('/:id', authenticateToken, [
  body('status').isIn(['pending', 'confirmed', 'cancelled', 'done']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Update appointment
    const [result] = await db.execute(
      'UPDATE appointments SET status = ? WHERE id = ? AND user_id = ?',
      [status, id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ message: 'Appointment updated successfully' });

  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available time slots for a specific date and business (public)
router.get('/available-slots/:slug/:date', async (req, res) => {
  try {
    const { slug, date } = req.params;
    const { duration, serviceId } = req.query;

    if (!duration) {
      return res.status(400).json({ message: 'Service duration is required' });
    }

    if (!serviceId) {
      return res.status(400).json({ message: 'Service ID is required' });
    }

    // Get user by slug
    const [users] = await db.execute(
      'SELECT id FROM users WHERE slug = ?',
      [slug]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const userId = users[0].id;

    // Get working hours for the selected date
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    const [workingHours] = await db.execute(
      'SELECT * FROM working_hours WHERE user_id = ? AND day_of_week = ?',
      [userId, dayOfWeek]
    );

    if (workingHours.length === 0 || !workingHours[0].is_open) {
      return res.json({ availableSlots: [], unavailableSlots: [] });
    }

    const workingHour = workingHours[0];

    // Generate all possible time slots
    const allSlots = generateTimeSlots(
      workingHour.open_time,
      workingHour.close_time,
      parseInt(duration)
    );

    // Get existing appointments for this date and service (only pending and confirmed block slots)
    const [existingAppointments] = await db.execute(
      'SELECT time FROM appointments WHERE user_id = ? AND date = ? AND service_id = ? AND status IN ("pending", "confirmed")',
      [userId, date, serviceId]
    );

    const bookedTimes24 = existingAppointments.map(apt => apt.time.substring(0, 5));

    // Filter out past times if the date is today
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime24 = now.toTimeString().substring(0, 5);

    const availableSlots = [];
    const unavailableSlots = [];

    allSlots.forEach(slot => {
      // Convert 12-hour slot back to 24-hour for comparison
      const slot24 = formatTo24Hour(slot);
      const isBooked = bookedTimes24.includes(slot24);
      const isPastTime = date === today && slot24 <= currentTime24;

      if (isBooked || isPastTime) {
        unavailableSlots.push({
          time: slot,
          reason: isBooked ? 'booked' : 'past'
        });
      } else {
        availableSlots.push(slot);
      }
    });

    res.json({ availableSlots, unavailableSlots });

  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Track appointment by booking code (public)
router.get('/track/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const [appointments] = await db.execute(`
      SELECT a.*, s.name as service_name, s.price, s.duration, u.business_name
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      JOIN users u ON a.user_id = u.id
      WHERE a.booking_code = ?
    `, [code]);

    if (appointments.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(appointments[0]);

  } catch (error) {
    console.error('Error tracking appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
