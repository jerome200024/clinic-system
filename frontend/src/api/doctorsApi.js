import api from './axios';

export const getDoctors = (params) => api.get('/doctors', { params });
export const getDoctorById = (id) => api.get(`/doctors/${id}`);
export const getDoctorSlots = (id, date) =>
  api.get(`/doctors/${id}/slots`, { params: { date } });
export const updateDoctor = (id, data) => api.put(`/doctors/${id}`, data);