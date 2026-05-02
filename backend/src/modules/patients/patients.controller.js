const patientsService = require('./patients.service');

const getMyProfile = async (req, res, next) => {
  try {
    const patient = await patientsService.getPatientByUserId(req.user.id);
    res.json({ success: true, data: { patient } });
  } catch (err) {
    next(err);
  }
};

const getPatientById = async (req, res, next) => {
  try {
    const patient = await patientsService.getPatientById(req.params.id);
    res.json({ success: true, data: { patient } });
  } catch (err) {
    next(err);
  }
};

const getAllPatients = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const patients = await patientsService.getAllPatients({ page, limit, search });
    res.json({ success: true, data: { patients } });
  } catch (err) {
    next(err);
  }
};

const updatePatient = async (req, res, next) => {
  try {
    const patient = await patientsService.updatePatient(
      req.params.id,
      req.user.id,
      req.body
    );
    res.json({ success: true, message: 'Profile updated', data: { patient } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyProfile, getPatientById, getAllPatients, updatePatient };