import api from './axios';

export const bookAppointment = (data) => api.post('/appointments', data);
export const getAppointments = (params) => api.get('/appointments', { params });
export const getAppointmentById = (id) => api.get(`/appointments/${id}`);
export const updateAppointmentStatus = (id, status) =>
  api.patch(`/appointments/${id}/status`, { status });