const pool = require('../../config/db');
const { v4: uuidv4 } = require('uuid');
const { sendEmail } = require('../../utils/mailer');
const { appointmentBooked } = require('../../utils/emailTemplates');
const { appointmentConfirmed } = require('../../utils/emailTemplates');


const bookAppointment = async ({ patientUserId, doctorId, scheduled_at, reason }) => {
  // Get patient profile id from user id
  const { rows: patientRows } = await pool.query(
    'SELECT id FROM patients WHERE user_id = $1',
    [patientUserId]
  );

  if (patientRows.length === 0) {
    const error = new Error('Patient profile not found');
    error.status = 404;
    throw error;
  }

  const patientId = patientRows[0].id;

  // Check doctor exists
  const { rows: doctorRows } = await pool.query(
    'SELECT id, available_days, consultation_fee FROM doctors WHERE id = $1',
    [doctorId]
  );

  if (doctorRows.length === 0) {
    const error = new Error('Doctor not found');
    error.status = 404;
    throw error;
  }

  const doctor = doctorRows[0];

  // Check slot is not already taken
  const { rows: conflict } = await pool.query(
    `SELECT id FROM appointments
     WHERE doctor_id = $1
     AND scheduled_at = $2
     AND status NOT IN ('cancelled')`,
    [doctorId, scheduled_at]
  );

  if (conflict.length > 0) {
    const error = new Error('This time slot is already booked');
    error.status = 409;
    throw error;
  }

  // Check day is available
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const dayName = dayNames[new Date(scheduled_at).getDay()];
  const availableDays = doctor.available_days;

  if (!availableDays[dayName]) {
    const error = new Error('Doctor is not available on this day');
    error.status = 400;
    throw error;
  }

  const id = uuidv4();

  const { rows } = await pool.query(
    `INSERT INTO appointments (id, patient_id, doctor_id, scheduled_at, reason, status)
     VALUES ($1, $2, $3, $4, $5, 'pending')
     RETURNING *`,
    [id, patientId, doctorId, scheduled_at, reason]
  );

  // Auto create billing record
  await pool.query(
    `INSERT INTO billing (id, appointment_id, amount, status)
     VALUES ($1, $2, $3, 'unpaid')`,
    [uuidv4(), id, doctor.consultation_fee]
  );

  // Send booking confirmation email
  try {
    const { rows: patientUser } = await pool.query(
      `SELECT u.email, u.name FROM users u
       JOIN patients p ON p.user_id = u.id
       WHERE p.id = $1`,
      [patientId]
    );

    const { rows: doctorUser } = await pool.query(
      `SELECT u.name FROM users u
       JOIN doctors d ON d.user_id = u.id
       WHERE d.id = $1`,
      [doctorId]
    );

    if (patientUser.length > 0) {
      const template = appointmentBooked({
        patientName: patientUser[0].name,
        doctorName: doctorUser[0].name,
        scheduledAt: scheduled_at,
        reason,
      });
      await sendEmail({ to: patientUser[0].email, ...template });
    }
  } catch (err) {
    console.error('Booking email failed:', err.message);
  }

  return rows[0];
};

const getAppointments = async ({ userId, role, status, page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;
  let query = '';
  const params = [];

  if (role === 'patient') {
    query = `
      SELECT a.*, 
             u.name AS doctor_name, d.specialization,
             b.amount, b.status AS billing_status
      FROM appointments a
      JOIN doctors d ON d.id = a.doctor_id
      JOIN users u ON u.id = d.user_id
      JOIN patients p ON p.id = a.patient_id
      LEFT JOIN billing b ON b.appointment_id = a.id
      WHERE p.user_id = $1
    `;
    params.push(userId);
  } else if (role === 'doctor') {
    query = `
      SELECT a.*,
             pu.name AS patient_name, pat.blood_type,
             b.amount, b.status AS billing_status
      FROM appointments a
      JOIN patients pat ON pat.id = a.patient_id
      JOIN users pu ON pu.id = pat.user_id
      JOIN doctors d ON d.id = a.doctor_id
      LEFT JOIN billing b ON b.appointment_id = a.id
      WHERE d.user_id = $1
    `;
    params.push(userId);
  } else {
    // Admin sees all
    query = `
      SELECT a.*,
             pu.name AS patient_name,
             du.name AS doctor_name,
             d.specialization,
             b.amount, b.status AS billing_status
      FROM appointments a
      JOIN patients pat ON pat.id = a.patient_id
      JOIN users pu ON pu.id = pat.user_id
      JOIN doctors d ON d.id = a.doctor_id
      JOIN users du ON du.id = d.user_id
      LEFT JOIN billing b ON b.appointment_id = a.id
      WHERE 1=1
    `;
  }

  if (status) {
    params.push(status);
    query += ` AND a.status = $${params.length}`;
  }

  query += ` ORDER BY a.scheduled_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const { rows } = await pool.query(query, params);
  return rows;
};

const getAppointmentById = async (id, userId, role) => {
  const { rows } = await pool.query(
    `SELECT a.*,
            pu.name AS patient_name, pu.email AS patient_email,
            du.name AS doctor_name, d.specialization,
            b.amount, b.status AS billing_status
     FROM appointments a
     JOIN patients pat ON pat.id = a.patient_id
     JOIN users pu ON pu.id = pat.user_id
     JOIN doctors d ON d.id = a.doctor_id
     JOIN users du ON du.id = d.user_id
     LEFT JOIN billing b ON b.appointment_id = a.id
     WHERE a.id = $1`,
    [id]
  );

  if (rows.length === 0) {
    const error = new Error('Appointment not found');
    error.status = 404;
    throw error;
  }

  return rows[0];
};

const updateStatus = async (appointmentId, newStatus, userId, role) => {
  const { rows } = await pool.query(
    'SELECT * FROM appointments WHERE id = $1',
    [appointmentId]
  );

  if (rows.length === 0) {
    const error = new Error('Appointment not found');
    error.status = 404;
    throw error;
  }

  const appointment = rows[0];

  // Define allowed transitions per role
  const allowed = {
    patient: { pending: ['cancelled'] },
    doctor: { pending: ['confirmed', 'cancelled'], confirmed: ['completed', 'cancelled'] },
    admin: { pending: ['confirmed', 'cancelled'], confirmed: ['completed', 'cancelled'] },
  };

  const allowedNextStatuses = allowed[role]?.[appointment.status] || [];

  if (!allowedNextStatuses.includes(newStatus)) {
    const error = new Error(
      `Cannot change status from "${appointment.status}" to "${newStatus}" as ${role}`
    );
    error.status = 400;
    throw error;
  }

  const { rows: updated } = await pool.query(
    `UPDATE appointments SET status = $1, updated_at = NOW()
     WHERE id = $2 RETURNING *`,
    [newStatus, appointmentId]
  );

  // Send confirmation email when status changes to confirmed
  if (newStatus === 'confirmed') {
    try {
      const { rows: details } = await pool.query(
        `SELECT pu.email, pu.name AS patient_name,
                du.name AS doctor_name,
                a.scheduled_at, a.reason
         FROM appointments a
         JOIN patients p ON p.id = a.patient_id
         JOIN users pu ON pu.id = p.user_id
         JOIN doctors d ON d.id = a.doctor_id
         JOIN users du ON du.id = d.user_id
         WHERE a.id = $1`,
        [appointmentId]
      );

      if (details.length > 0) {
        const template = appointmentConfirmed({
          patientName: details[0].patient_name,
          doctorName: details[0].doctor_name,
          scheduledAt: details[0].scheduled_at,
          reason: details[0].reason,
        });
        await sendEmail({ to: details[0].email, ...template });
      }
    } catch (err) {
      console.error('Confirmation email failed:', err.message);
    }
  }

  return updated[0];
};

module.exports = {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  updateStatus,
};