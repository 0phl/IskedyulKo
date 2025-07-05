const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../db/connection');

const router = express.Router();

// Helper function to generate slug from business name
const generateSlug = (businessName) => {
  return businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// Helper function to create default working hours
const createDefaultWorkingHours = async (userId) => {
  const defaultHours = [
    { day: 1, open: '09:00:00', close: '17:00:00' }, // Monday
    { day: 2, open: '09:00:00', close: '17:00:00' }, // Tuesday
    { day: 3, open: '09:00:00', close: '17:00:00' }, // Wednesday
    { day: 4, open: '09:00:00', close: '17:00:00' }, // Thursday
    { day: 5, open: '09:00:00', close: '17:00:00' }, // Friday
    { day: 6, open: null, close: null, is_open: false }, // Saturday
    { day: 0, open: null, close: null, is_open: false }, // Sunday
  ];

  for (const hours of defaultHours) {
    await db.execute(
      'INSERT INTO working_hours (user_id, day_of_week, is_open, open_time, close_time) VALUES (?, ?, ?, ?, ?)',
      [userId, hours.day, hours.is_open !== false, hours.open, hours.close]
    );
  }
};

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('businessName').notEmpty().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, businessName, contactInfo, address } = req.body;

    // Check if user already exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate slug and check for uniqueness
    let slug = generateSlug(businessName);
    const [existingSlugs] = await db.execute(
      'SELECT id FROM users WHERE slug = ?',
      [slug]
    );

    if (existingSlugs.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const [result] = await db.execute(
      'INSERT INTO users (email, password, business_name, slug, contact_info, address) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, businessName, slug, contactInfo || null, address || null]
    );

    const userId = result.insertId;

    // Create default working hours
    await createDefaultWorkingHours(userId);

    // Generate JWT token
    const token = jwt.sign(
      { userId, email, businessName, slug },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        email,
        businessName,
        slug,
        contactInfo,
        address
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        businessName: user.business_name, 
        slug: user.slug 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        businessName: user.business_name,
        slug: user.slug,
        contactInfo: user.contact_info,
        address: user.address
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
