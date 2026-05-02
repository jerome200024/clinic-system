const pool = require('../../config/db');
const { v4: uuidv4 } = require('uuid');
const { generatePrescriptionPDF } = require('../../utils/pdf');
const { sendEmail } = require('../../utils/mailer');
const { prescriptionReady } = require('../../utils/emailTemplates');

const createPrescription = async ({ recordId, medications, doctorUserId }) => {
  // Verify record exists and belongs to this doctor
  const { rows: recordRows } = await pool.query(
    `SELECT mr.*,
            du.id AS doctor_user_id,
            du.name AS doctor_name,
            d.specialization,
            pu.name AS patient_name,
            a.scheduled_at,
            a.reason
     FROM medical_records mr
     JOIN appointments a ON a.id = mr.appointment_id
     JOIN doctors d ON d.id = a.doctor_id
     JOIN users du ON du.id = d.user_id
     JOIN patients p ON p.id = a.patient_id
     JOIN users pu ON pu.id = p.user_id
     WHERE mr.id = $1`,
    [recordId]
  );

  if (recordRows.length === 0) {
    const error = new Error('Medical record not found');
    error.status = 404;
    throw error;
  }

  const record = recordRows[0];

  if (record.doctor_user_id !== doctorUserId) {
    const error = new Error('Not authorized');
    error.status = 403;
    throw error;
  }

  const id = uuidv4();

  // Insert prescription first
  const { rows } = await pool.query(
    `INSERT INTO prescriptions (id, record_id, medications)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [id, recordId, JSON.stringify(medications)]
  );

  const prescription = rows[0];

  // Generate PDF
  try {
    const pdfUrl = await generatePrescriptionPDF(prescription, record);

    // Update pdf_url
    await pool.query(
      'UPDATE prescriptions SET pdf_url = $1 WHERE id = $2',
      [pdfUrl, id]
    );

    prescription.pdf_url = pdfUrl;
  } catch (err) {
    console.error('PDF generation failed:', err.message);
  }

  // Send prescription ready email
    try {
      const { rows: patientUser } = await pool.query(
        `SELECT pu.email FROM users pu
         JOIN patients p ON p.user_id = pu.id
         JOIN appointments a ON a.patient_id = p.id
         JOIN medical_records mr ON mr.appointment_id = a.id
         WHERE mr.id = $1`,
        [recordId]
      );

      if (patientUser.length > 0) {
        const template = prescriptionReady({
          patientName: record.patient_name,
          doctorName: record.doctor_name,
          diagnosis: record.diagnosis,
        });
        await sendEmail({ to: patientUser[0].email, ...template });
      }
    } catch (err) {
      console.error('Prescription email failed:', err.message);
    }

  return prescription;
};

const getPrescriptionsByRecord = async (recordId) => {
  const { rows } = await pool.query(
    'SELECT * FROM prescriptions WHERE record_id = $1 ORDER BY issued_at DESC',
    [recordId]
  );
  return rows;
};

const getPrescriptionById = async (id) => {
  const { rows } = await pool.query(
    'SELECT * FROM prescriptions WHERE id = $1',
    [id]
  );

  if (rows.length === 0) {
    const error = new Error('Prescription not found');
    error.status = 404;
    throw error;
  }

  return rows[0];
};

module.exports = {
  createPrescription,
  getPrescriptionsByRecord,
  getPrescriptionById,
};