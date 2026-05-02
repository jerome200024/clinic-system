const router = require('express').Router();
const {
  createRecord,
  getRecordByAppointment,
  getMyRecords,
} = require('./medical-records.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const { z } = require('zod');

const recordSchema = z.object({
  appointmentId: z.string().uuid('Invalid appointment ID'),
  diagnosis: z.string().min(3, 'Diagnosis is required'),
  treatment: z.string().min(3, 'Treatment is required'),
  notes: z.string().optional(),
});

router.post('/', authenticate, authorize('doctor'), validate(recordSchema), createRecord);
router.get('/my-records', authenticate, authorize('patient'), getMyRecords);
router.get('/:appointmentId', authenticate, authorize('doctor', 'admin', 'patient'), getRecordByAppointment);

module.exports = router;