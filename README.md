cat > README.md << 'README'
# Clinic and Appointment Management System

A full stack clinic management system built with React, Node.js, and PostgreSQL.

## User Roles
- Patient - Book appointments, view medical records, pay bills
- Doctor - Manage schedule, confirm appointments, create prescriptions
- Admin - Manage users, view analytics and reports

## Features
- JWT authentication with role-based access control
- Appointment booking with real-time slot availability
- Conflict detection to prevent double booking
- Medical records with PDF prescription generation
- Stripe payment integration for consultation fees
- Email notifications via Nodemailer
- Appointment reminders via cron job
- Admin dashboard with analytics and charts
- Fully responsive design for all devices

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- Zustand
- React Router v6
- Axios
- Stripe.js
- Recharts

### Backend
- Node.js + Express
- PostgreSQL + Knex
- JWT Authentication
- bcryptjs
- Nodemailer
- Stripe
- Puppeteer
- Node-cron

## Running Locally

### Backend
cd backend
npm install
npm run dev

### Frontend
cd frontend
npm install
npm run dev

## Test Accounts
| Role    | Email               | Password    |
|---------|---------------------|-------------|
| Patient | juan@email.com      | password123 |
| Doctor  | maria@clinic.com    | password123 |
| Admin   | admin@clinic.com    | password123 |

## API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET  /api/auth/me

### Doctors
- GET /api/doctors
- GET /api/doctors/:id
- GET /api/doctors/:id/slots
- PUT /api/doctors/:id

### Appointments
- POST  /api/appointments
- GET   /api/appointments
- PATCH /api/appointments/:id/status

### Medical Records
- POST /api/medical-records
- GET  /api/medical-records/my-records
- GET  /api/medical-records/:appointmentId

### Prescriptions
- POST /api/prescriptions
- GET  /api/prescriptions/record/:recordId
- GET  /api/prescriptions/:id/download

### Billing
- GET   /api/billing/my-billing
- GET   /api/billing/all
- POST  /api/billing/create-payment-intent
- PATCH /api/billing/:id/mark-paid

## Deployment
- Backend: Render
- Frontend: Vercel
- Database: Render PostgreSQL
README