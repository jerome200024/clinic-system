const router = require('express').Router();
const { book, getAll, getById, updateStatus } = require('./appointments.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const { z } = require('zod');

const bookSchema = z.object({
  doctorId: z.string().uuid('Invalid doctor ID'),
  scheduled_at: z.string().min(1, 'scheduled_at is required'),
  reason: z.string().min(3, 'Reason must be at least 3 characters'),
});

const statusSchema = z.object({
  status: z.enum(['confirmed', 'completed', 'cancelled']),
});

router.post('/', authenticate, authorize('patient'), validate(bookSchema), book);
router.get('/', authenticate, authorize('patient', 'doctor', 'admin'), getAll);
router.get('/:id', authenticate, authorize('patient', 'doctor', 'admin'), getById);
router.patch('/:id/status', authenticate, authorize('patient', 'doctor', 'admin'), validate(statusSchema), updateStatus);

module.exports = router;