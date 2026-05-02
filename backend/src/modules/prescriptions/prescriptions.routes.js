const router = require('express').Router();
const {
  createPrescription,
  getPrescriptionsByRecord,
  downloadPDF,
} = require('./prescriptions.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const { z } = require('zod');

const prescriptionSchema = z.object({
  recordId: z.string().uuid('Invalid record ID'),
  medications: z.array(
    z.object({
      name: z.string().min(1, 'Medication name required'),
      dosage: z.string().min(1, 'Dosage required'),
      frequency: z.string().min(1, 'Frequency required'),
      duration: z.string().min(1, 'Duration required'),
    })
  ).min(1, 'At least one medication required'),
});

router.post('/', authenticate, authorize('doctor'), validate(prescriptionSchema), createPrescription);
router.get('/record/:recordId', authenticate, authorize('doctor', 'patient', 'admin'), getPrescriptionsByRecord);
router.get('/:id/download', authenticate, downloadPDF);

module.exports = router;