const medicalRecordsService = require('./medical-records.service');

const createRecord = async (req, res, next) => {
  try {
    const { appointmentId, diagnosis, treatment, notes } = req.body;
    const record = await medicalRecordsService.createRecord({
      appointmentId,
      diagnosis,
      treatment,
      notes,
      doctorUserId: req.user.id,
    });
    res.status(201).json({
      success: true,
      message: 'Medical record created',
      data: { record },
    });
  } catch (err) {
    next(err);
  }
};

const getRecordByAppointment = async (req, res, next) => {
  try {
    const record = await medicalRecordsService.getRecordByAppointment(
      req.params.appointmentId
    );
    res.json({ success: true, data: { record } });
  } catch (err) {
    next(err);
  }
};

const getMyRecords = async (req, res, next) => {
  try {
    const records = await medicalRecordsService.getPatientRecords(req.user.id);
    res.json({ success: true, data: { records } });
  } catch (err) {
    next(err);
  }
};

module.exports = { createRecord, getRecordByAppointment, getMyRecords };