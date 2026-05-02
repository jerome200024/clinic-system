const pool = require('../../config/db');
const { v4: uuidv4 } = require('uuid');

const createRecord = async ({ appointmentId, diagnosis, treatment, notes, doctorUserId }) => {
  // Verify appointment exists and belongs to this doctor
  const { rows: apptRows } = await pool.query(
    `SELECT a.*, d.user_id AS doctor_user_id
     FROM appointments a
     JOIN doctors d ON d.id = a.doctor_id
     WHERE a.id = $1`,
    [appointmentId]
  );

  if (apptRows.length === 0) {
    const error = new Error('Appointment not found');
    error.status = 404;
    throw error;
  }

  const appointment = apptRows[0];

  if (appointment.doctor_user_id !== doctorUserId) {
    const error = new Error('Not authorized to create record for this appointment');
    error.status = 403;
    throw error;
  }

  if (appointment.status !== 'confirmed' && appointment.status !== 'completed') {
    const error = new Error('Appointment must be confirmed before adding records');
    error.status = 400;
    throw error;
  }

  // Check if record already exists
  const { rows: existing } = await pool.query(
    'SELECT id FROM medical_records WHERE appointment_id = $1',
    [appointmentId]
  );

  if (existing.length > 0) {
    const error = new Error('Medical record already exists for this appointment');
    error.status = 409;
    throw error;
  }

  const id = uuidv4();
  const { rows } = await pool.query(
    `INSERT INTO medical_records (id, appointment_id, diagnosis, treatment, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [id, appointmentId, diagnosis, treatment, notes]
  );

  // Mark appointment as completed
  await pool.query(
    `UPDATE appointments SET status = 'completed', updated_at = NOW()
     WHERE id = $1`,
    [appointmentId]
  );

  return rows[0];
};

const getRecordByAppointment = async (appointmentId) => {
  const { rows } = await pool.query(
    `SELECT mr.*,
            du.name AS doctor_name, d.specialization,
            pu.name AS patient_name,
            a.scheduled_at, a.reason
     FROM medical_records mr
     JOIN appointments a ON a.id = mr.appointment_id
     JOIN doctors d ON d.id = a.doctor_id
     JOIN users du ON du.id = d.user_id
     JOIN patients p ON p.id = a.patient_id
     JOIN users pu ON pu.id = p.user_id
     WHERE mr.appointment_id = $1`,
    [appointmentId]
  );

  if (rows.length === 0) {
    const error = new Error('Medical record not found');
    error.status = 404;
    throw error;
  }

  return rows[0];
};

const getPatientRecords = async (patientUserId) => {
  const { rows } = await pool.query(
    `SELECT mr.*,
            du.name AS doctor_name, d.specialization,
            a.scheduled_at, a.reason,
            p.id AS prescription_id, p.medications, p.pdf_url
     FROM medical_records mr
     JOIN appointments a ON a.id = mr.appointment_id
     JOIN doctors d ON d.id = a.doctor_id
     JOIN users du ON du.id = d.user_id
     JOIN patients pat ON pat.id = a.patient_id
     JOIN users pu ON pu.id = pat.user_id
     LEFT JOIN prescriptions p ON p.record_id = mr.id
     WHERE pu.id = $1
     ORDER BY a.scheduled_at DESC`,
    [patientUserId]
  );

  return rows;
};

module.exports = { createRecord, getRecordByAppointment, getPatientRecords };