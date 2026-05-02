const router = require('express').Router();
const {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  getAvailableSlots,
} = require('./doctors.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

// Public routes
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/slots', getAvailableSlots);

// Protected routes
router.put('/:id', authenticate, authorize('doctor', 'admin'), updateDoctor);

module.exports = router;