const router = require('express').Router();
const {
  getMyProfile,
  getPatientById,
  getAllPatients,
  updatePatient,
} = require('./patients.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

router.get('/me', authenticate, authorize('patient'), getMyProfile);
router.get('/', authenticate, authorize('admin', 'doctor'), getAllPatients);
router.get('/:id', authenticate, authorize('admin', 'doctor', 'patient'), getPatientById);
router.put('/:id', authenticate, authorize('patient'), updatePatient);

module.exports = router;