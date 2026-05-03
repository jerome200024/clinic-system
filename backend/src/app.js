const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    if (origin === 'http://localhost:5173') return callback(null, true);
    if (origin === process.env.CLIENT_URL) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Serve prescription PDFs
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Clinic API is running' });
});

// Routes
const authRoutes = require('./modules/auth/auth.routes');
const doctorRoutes = require('./modules/doctors/doctors.routes');
const patientRoutes = require('./modules/patients/patients.routes');
const appointmentRoutes = require('./modules/appointments/appointments.routes');
const medicalRecordRoutes = require('./modules/medical-records/medical-records.routes');
const prescriptionRoutes = require('./modules/prescriptions/prescriptions.routes');
const billingRoutes = require('./modules/billing/billing.routes');

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);

app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/billing', billingRoutes);

// Error handler
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);


module.exports = app;