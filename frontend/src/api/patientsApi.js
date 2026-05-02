import api from './axios';

export const getMyProfile = () => api.get('/patients/me');
export const updatePatient = (id, data) => api.put(`/patients/${id}`, data);
export const getAllPatients = (params) => api.get('/patients', { params });