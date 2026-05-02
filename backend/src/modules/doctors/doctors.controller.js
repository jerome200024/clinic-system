const doctorsService = require('./doctors.service');

const getAllDoctors = async (req, res, next) => {
  try {
    const { specialization, page, limit } = req.query;
    const doctors = await doctorsService.getAllDoctors({ specialization, page, limit });
    res.json({ success: true, data: { doctors } });
  } catch (err) {
    next(err);
  }
};

const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await doctorsService.getDoctorById(req.params.id);
    res.json({ success: true, data: { doctor } });
  } catch (err) {
    next(err);
  }
};

const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await doctorsService.updateDoctor(
      req.params.id,
      req.user.id,
      req.body
    );
    res.json({ success: true, message: 'Profile updated', data: { doctor } });
  } catch (err) {
    next(err);
  }
};

const getAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }
    const slots = await doctorsService.getAvailableSlots(req.params.id, date);
    res.json({ success: true, data: { slots } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllDoctors, getDoctorById, updateDoctor, getAvailableSlots };