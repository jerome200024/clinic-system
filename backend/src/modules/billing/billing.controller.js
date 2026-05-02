const billingService = require('./billing.service');

const getBillingByAppointment = async (req, res, next) => {
  try {
    const billing = await billingService.getBillingByAppointment(
      req.params.appointmentId
    );
    res.json({ success: true, data: { billing } });
  } catch (err) {
    next(err);
  }
};

const getMyBilling = async (req, res, next) => {
  try {
    const billing = await billingService.getMyBilling(req.user.id);
    res.json({ success: true, data: { billing } });
  } catch (err) {
    next(err);
  }
};

const getAllBilling = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const billing = await billingService.getAllBilling({ status, page, limit });
    res.json({ success: true, data: { billing } });
  } catch (err) {
    next(err);
  }
};

const createPaymentIntent = async (req, res, next) => {
  try {
    const { billingId } = req.body;
    const result = await billingService.createPaymentIntent(
      billingId,
      req.user.id
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const stripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const Stripe = require('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).json({ message: `Webhook error: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    await billingService.confirmPayment(paymentIntent.id);
  }

  res.json({ received: true });
};

module.exports = {
  getBillingByAppointment,
  getMyBilling,
  getAllBilling,
  createPaymentIntent,
  stripeWebhook,
};