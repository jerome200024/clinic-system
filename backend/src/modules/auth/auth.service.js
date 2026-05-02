const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../../config/db');

const generateTokens = (user) => {
  const payload = { id: user.id, role: user.role, name: user.name };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
};

const register = async ({ name, email, password, role, phone }) => {
  // Check if email already exists
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    const error = new Error('Email already in use');
    error.status = 409;
    throw error;
  }

  const password_hash = await bcrypt.hash(password, 12);
  const id = uuidv4();

  // Insert into users
  const { rows } = await pool.query(
    `INSERT INTO users (id, name, email, password_hash, role, phone)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role`,
    [id, name, email, password_hash, role, phone]
  );

  const user = rows[0];

  // Create profile based on role
  if (role === 'patient') {
    await pool.query(
      'INSERT INTO patients (id, user_id) VALUES ($1, $2)',
      [uuidv4(), user.id]
    );
  } else if (role === 'doctor') {
    await pool.query(
      `INSERT INTO doctors (id, user_id, specialization, license_no)
       VALUES ($1, $2, $3, $4)`,
      [uuidv4(), user.id, 'General', 'TEMP-' + uuidv4().slice(0, 8).toUpperCase()]
    );
  }

  const tokens = generateTokens(user);
  return { user, ...tokens };
};

const login = async ({ email, password }) => {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE email = $1 AND is_active = true',
    [email]
  );

  if (rows.length === 0) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  const user = rows[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  const tokens = generateTokens(user);
  return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, ...tokens };
};

const refresh = (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const payload = { id: decoded.id, role: decoded.role, name: decoded.name };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return { accessToken };
  } catch (err) {
    const error = new Error('Invalid refresh token');
    error.status = 401;
    throw error;
  }
};

const getMe = async (userId) => {
  const { rows } = await pool.query(
    'SELECT id, name, email, role, phone, is_active, created_at FROM users WHERE id = $1',
    [userId]
  );
  return rows[0];
};

module.exports = { register, login, refresh, getMe };