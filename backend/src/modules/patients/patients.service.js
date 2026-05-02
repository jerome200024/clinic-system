const pool = require('../../config/db');

const getPatientByUserId = async (userId) => {
  const { rows } = await pool.query(
    `SELECT p.*, u.name, u.email, u.phone
     FROM patients p
     JOIN users u ON u.id = p.user_id
     WHERE p.user_id = $1`,
    [userId]
  );
  return rows[0];
};

const getPatientById = async (id) => {
  const { rows } = await pool.query(
    `SELECT p.*, u.name, u.email, u.phone
     FROM patients p
     JOIN users u ON u.id = p.user_id
     WHERE p.id = $1`,
    [id]
  );

  if (rows.length === 0) {
    const error = new Error('Patient not found');
    error.status = 404;
    throw error;
  }

  return rows[0];
};

const getAllPatients = async ({ page = 1, limit = 10, search }) => {
  const offset = (page - 1) * limit;
  let query = `
    SELECT p.id, p.date_of_birth, p.blood_type, p.emergency_contact,
           u.name, u.email, u.phone
    FROM patients p
    JOIN users u ON u.id = p.user_id
    WHERE u.is_active = true
  `;
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`;
  }

  query += ` ORDER BY u.name ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const { rows } = await pool.query(query, params);
  return rows;
};

const updatePatient = async (id, userId, data) => {
  const { date_of_birth, blood_type, medical_history, emergency_contact } = data;

  const { rows: check } = await pool.query(
    'SELECT id FROM patients WHERE id = $1 AND user_id = $2',
    [id, userId]
  );

  if (check.length === 0) {
    const error = new Error('Not authorized to update this profile');
    error.status = 403;
    throw error;
  }

  const { rows } = await pool.query(
    `UPDATE patients
     SET date_of_birth = COALESCE($1, date_of_birth),
         blood_type = COALESCE($2, blood_type),
         medical_history = COALESCE($3, medical_history),
         emergency_contact = COALESCE($4, emergency_contact),
         updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [date_of_birth, blood_type, medical_history, emergency_contact, id]
  );

  return rows[0];
};

module.exports = {
  getPatientByUserId,
  getPatientById,
  getAllPatients,
  updatePatient,
};