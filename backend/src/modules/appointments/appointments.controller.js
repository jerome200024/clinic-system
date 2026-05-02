const appointmentsService = require('./appointments.service');

const book = async (req, res, next) => {
  try {
    const { doctorId, scheduled_at, reason } = req.body;
    const appointment = await appointmentsService.bookAppointment({
      patientUserId: req.user.id,
      doctorId,
      scheduled_at,
      reason,
    });
    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: { appointment },
    });
  } catch (err) {
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const appointments = await appointmentsService.getAppointments({
      userId: req.user.id,
      role: req.user.role,
      status,
      page,
      limit,
    });
    res.json({ success: true, data: { appointments } });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const appointment = await appointmentsService.getAppointmentById(
      req.params.id,
      req.user.id,
      req.user.role
    );
    res.json({ success: true, data: { appointment } });
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const appointment = await appointmentsService.updateStatus(
      req.params.id,
      status,
      req.user.id,
      req.user.role
    );
    res.json({
      success: true,
      message: `Appointment ${status} successfully`,
      data: { appointment },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { book, getAll, getById, updateStatus };