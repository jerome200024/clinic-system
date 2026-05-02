const router = require('express').Router();
const {
  getBillingByAppointment,
  getMyBilling,
  getAllBilling,
  createPaymentIntent,
  stripeWebhook,
} = require('./billing.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const pool = require('../../config/db');

// Stripe webhook
router.post('/webhook', stripeWebhook);

// Billing routes
router.get('/my-billing', authenticate, authorize('patient'), getMyBilling);
router.get('/all', authenticate, authorize('admin'), getAllBilling);
router.get('/appointment/:appointmentId', authenticate, authorize('patient', 'doctor', 'admin'), getBillingByAppointment);
router.post('/create-payment-intent', authenticate, authorize('patient'), createPaymentIntent);

// Manual mark paid for local testing
router.patch('/:id/mark-paid', authenticate, authorize('patient'), async (req, res, next) => {
  try {
    await pool.query(
      `UPDATE billing SET status = 'paid', paid_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [req.params.id]
    );
    res.json({ success: true, message: 'Payment confirmed' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;