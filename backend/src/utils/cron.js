const cron = require('node-cron');
const pool = require('../config/db');
const { sendEmail } = require('./mailer');
const { appointmentReminder } = require('./emailTemplates');

const startReminderCron = () => {
  // Runs every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Running appointment reminder cron job...');

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDate = tomorrow.toISOString().split('T')[0];

      const { rows } = await pool.query(
        `SELECT a.scheduled_at, a.reason,
                pu.name AS patient_name, pu.email AS patient_email,
                du.name AS doctor_name
         FROM appointments a
         JOIN patients p ON p.id = a.patient_id
         JOIN users pu ON pu.id = p.user_id
         JOIN doctors d ON d.id = a.doctor_id
         JOIN users du ON du.id = d.user_id
         WHERE DATE(a.scheduled_at) = $1
         AND a.status = 'confirmed'`,
        [tomorrowDate]
      );

      console.log(`📧 Sending reminders for ${rows.length} appointments`);

      for (const appointment of rows) {
        const template = appointmentReminder({
          patientName: appointment.patient_name,
          doctorName: appointment.doctor_name,
          scheduledAt: appointment.scheduled_at,
        });

        await sendEmail({
          to: appointment.patient_email,
          ...template,
        });
      }

      console.log('✅ Reminder emails sent successfully');
    } catch (err) {
      console.error('❌ Cron job failed:', err.message);
    }
  });

  console.log('✅ Appointment reminder cron job started');
};

module.exports = { startReminderCron };