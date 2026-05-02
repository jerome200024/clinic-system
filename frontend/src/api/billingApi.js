import api from './axios';

export const getMyBilling = () => api.get('/billing/my-billing');
export const getAllBilling = (params) => api.get('/billing/all', { params });
export const getBillingByAppointment = (appointmentId) =>
  api.get(`/billing/appointment/${appointmentId}`);
export const createPaymentIntent = (billingId) =>
  api.post('/billing/create-payment-intent', { billingId });