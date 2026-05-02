const pool = require('../../config/db');
const { v4: uuidv4 } = require('uuid');
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const getBillingByAppointment = async (appointmentId) => {
  const { rows } = await pool.query(
    `SELECT b.*, 
            a.scheduled_at, a.reason, a.status AS appointment_status,
            du.name AS doctor_name, d.specialization,
            pu.name AS patient_name
     FROM billing b
     JOIN appointments a ON a.id = b.appointment_id
     JOIN doctors d ON d.id = a.doctor_id
     JOIN users du ON du.id = d.user_id
     JOIN patients p ON p.id = a.patient_id
     JOIN users pu ON pu.id = p.user_id
     WHERE b.appointment_id = $1`,
    [appointmentId]
  );

  if (rows.length === 0) {
    const error = new Error('Billing record not found');
    error.status = 404;
    throw error;
  }

  return rows[0];
};

const getMyBilling = async (patientUserId) => {
  const { rows } = await pool.query(
    `SELECT b.*,
            a.scheduled_at, a.reason,
            du.name AS doctor_name, d.specialization
     FROM billing b
     JOIN appointments a ON a.id = b.appointment_id
     JOIN doctors d ON d.id = a.doctor_id
     JOIN users du ON du.id = d.user_id
     JOIN patients p ON p.id = a.patient_id
     JOIN users pu ON pu.id = p.user_id
     WHERE pu.id = $1
     ORDER BY b.created_at DESC`,
    [patientUserId]
  );

  return rows;
};

const getAllBilling = async ({ status, page = 1, limit = 10 }) => {
  const offset = (page - 1) * limit;
  let query = `
    SELECT b.*,
           a.scheduled_at,
           du.name AS doctor_name,
           pu.name AS patient_name
    FROM billing b
    JOIN appointments a ON a.id = b.appointment_id
    JOIN doctors d ON d.id = a.doctor_id
    JOIN users du ON du.id = d.user_id
    JOIN patients p ON p.id = a.patient_id
    JOIN users pu ON pu.id = p.user_id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    params.push(status);
    query += ` AND b.status = $${params.length}`;
  }

  query += ` ORDER BY b.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const { rows } = await pool.query(query, params);
  return rows;
};

const createPaymentIntent = async (billingId, patientUserId) => {
  const { rows } = await pool.query(
    `SELECT b.*,
            pu.name AS patient_name,
            pu.email AS patient_email
     FROM billing b
     JOIN appointments a ON a.id = b.appointment_id
     JOIN patients p ON p.id = a.patient_id
     JOIN users pu ON pu.id = p.user_id
     WHERE b.id = $1 AND pu.id = $2`,
    [billingId, patientUserId]
  );

  if (rows.length === 0) {
    const error = new Error('Billing record not found or not authorized');
    error.status = 404;
    throw error;
  }

  const billing = rows[0];

  if (billing.status === 'paid') {
    const error = new Error('This bill has already been paid');
    error.status = 400;
    throw error;
  }

  // Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: billing.amount * 100, // Stripe uses cents
    currency: 'php',
    metadata: {
      billing_id: billingId,
      patient_name: billing.patient_name,
    },
  });

  // Save stripe_id to billing
  await pool.query(
    'UPDATE billing SET stripe_id = $1 WHERE id = $2',
    [paymentIntent.id, billingId]
  );

  return { clientSecret: paymentIntent.client_secret, amount: billing.amount };
};

const confirmPayment = async (stripeId) => {
  const { rows } = await pool.query(
    'SELECT * FROM billing WHERE stripe_id = $1',
    [stripeId]
  );

  if (rows.length === 0) return;

  await pool.query(
    `UPDATE billing 
     SET status = 'paid', paid_at = NOW(), updated_at = NOW()
     WHERE stripe_id = $1`,
    [stripeId]
  );
};

module.exports = {
  getBillingByAppointment,
  getMyBilling,
  getAllBilling,
  createPaymentIntent,
  confirmPayment,
};