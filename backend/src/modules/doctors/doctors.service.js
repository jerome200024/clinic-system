const pool = require('../../config/db');

const getAllDoctors = async ({ specialization, page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;
  let query = `
    SELECT d.id, d.specialization, d.license_no, d.consultation_fee,
           d.available_days, u.name, u.email, u.phone
    FROM doctors d
    JOIN users u ON u.id = d.user_id
    WHERE u.is_active = true
  `;
  const params = [];

  if (specialization) {
    params.push(specialization);
    query += ` AND d.specialization = $${params.length}`;
  }

  query += ` ORDER BY u.name ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const { rows } = await pool.query(query, params);
  return rows;
};

const getDoctorById = async (id) => {
  const { rows } = await pool.query(
    `SELECT d.id, d.specialization, d.license_no, d.consultation_fee,
            d.available_days, u.name, u.email, u.phone
     FROM doctors d
     JOIN users u ON u.id = d.user_id
     WHERE d.id = $1`,
    [id]
  );

  if (rows.length === 0) {
    const error = new Error('Doctor not found');
    error.status = 404;
    throw error;
  }

  return rows[0];
};

const getDoctorByUserId = async (userId) => {
  const { rows } = await pool.query(
    'SELECT * FROM doctors WHERE user_id = $1',
    [userId]
  );
  return rows[0];
};

const updateDoctor = async (id, userId, data) => {
  const { specialization, consultation_fee, available_days, license_no } = data;

  // Make sure doctor can only update their own profile
  const { rows: check } = await pool.query(
    'SELECT id FROM doctors WHERE id = $1 AND user_id = $2',
    [id, userId]
  );

  if (check.length === 0) {
    const error = new Error('Not authorized to update this profile');
    error.status = 403;
    throw error;
  }

  const { rows } = await pool.query(
    `UPDATE doctors
     SET specialization = COALESCE($1, specialization),
         consultation_fee = COALESCE($2, consultation_fee),
         available_days = COALESCE($3, available_days),
         license_no = COALESCE($4, license_no),
         updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [specialization, consultation_fee, available_days, license_no, id]
  );

  return rows[0];
};

const getAvailableSlots = async (doctorId, date) => {
  const doctor = await getDoctorById(doctorId);
  const availableDays = doctor.available_days;

  // Get day name from date e.g. "mon", "tue"
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const dayName = dayNames[new Date(date).getDay()];

  if (!availableDays[dayName]) {
    return [];
  }

  const [startTime, endTime] = availableDays[dayName];

  // Generate 30-minute slots
  const slots = [];
  let current = new Date(`${date}T${startTime}:00`);
  const end = new Date(`${date}T${endTime}:00`);

  while (current < end) {
    slots.push(current.toTimeString().slice(0, 5));
    current = new Date(current.getTime() + 30 * 60 * 1000);
  }

  // Remove already booked slots
  const { rows: booked } = await pool.query(
    `SELECT scheduled_at FROM appointments
     WHERE doctor_id = $1
     AND DATE(scheduled_at) = $2
     AND status NOT IN ('cancelled')`,
    [doctorId, date]
  );

  const bookedTimes = booked.map((r) =>
    new Date(r.scheduled_at).toTimeString().slice(0, 5)
  );

  return slots.filter((slot) => !bookedTimes.includes(slot));
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  getDoctorByUserId,
  updateDoctor,
  getAvailableSlots,
};