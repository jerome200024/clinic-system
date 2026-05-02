const appointmentConfirmed = ({ patientName, doctorName, scheduledAt, reason }) => ({
  subject: 'Appointment Confirmed — Clinic System',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #2563eb; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0;">🏥 Clinic System</h1>
      </div>
      <div style="padding: 32px; background: #f9fafb;">
        <h2 style="color: #1e293b;">Appointment Confirmed</h2>
        <p>Dear <strong>${patientName}</strong>,</p>
        <p>Your appointment has been confirmed. Here are the details:</p>
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #2563eb;">
          <p><strong>Doctor:</strong> ${doctorName}</p>
          <p><strong>Date & Time:</strong> ${new Date(scheduledAt).toLocaleString()}</p>
          <p><strong>Reason:</strong> ${reason}</p>
        </div>
        <p>Please arrive 10 minutes before your scheduled time.</p>
        <p style="color: #64748b; font-size: 14px;">If you need to cancel, please do so at least 24 hours in advance.</p>
      </div>
      <div style="background: #e2e8f0; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
        © 2026 Clinic System. All rights reserved.
      </div>
    </div>
  `,
});

const appointmentReminder = ({ patientName, doctorName, scheduledAt }) => ({
  subject: 'Appointment Reminder — Tomorrow',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #2563eb; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0;">🏥 Clinic System</h1>
      </div>
      <div style="padding: 32px; background: #f9fafb;">
        <h2 style="color: #1e293b;">⏰ Appointment Reminder</h2>
        <p>Dear <strong>${patientName}</strong>,</p>
        <p>This is a reminder that you have an appointment <strong>tomorrow</strong>.</p>
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p><strong>Doctor:</strong> ${doctorName}</p>
          <p><strong>Date & Time:</strong> ${new Date(scheduledAt).toLocaleString()}</p>
        </div>
        <p>Please make sure to bring any relevant medical documents.</p>
      </div>
      <div style="background: #e2e8f0; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
        © 2026 Clinic System. All rights reserved.
      </div>
    </div>
  `,
});

const appointmentBooked = ({ patientName, doctorName, scheduledAt, reason }) => ({
  subject: 'Appointment Booked — Clinic System',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #2563eb; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0;">🏥 Clinic System</h1>
      </div>
      <div style="padding: 32px; background: #f9fafb;">
        <h2 style="color: #1e293b;">Appointment Booked Successfully</h2>
        <p>Dear <strong>${patientName}</strong>,</p>
        <p>Your appointment has been booked and is currently <strong>pending confirmation</strong>.</p>
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981;">
          <p><strong>Doctor:</strong> ${doctorName}</p>
          <p><strong>Date & Time:</strong> ${new Date(scheduledAt).toLocaleString()}</p>
          <p><strong>Reason:</strong> ${reason}</p>
        </div>
        <p>You will receive another email once your appointment is confirmed.</p>
      </div>
      <div style="background: #e2e8f0; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
        © 2026 Clinic System. All rights reserved.
      </div>
    </div>
  `,
});

const prescriptionReady = ({ patientName, doctorName, diagnosis }) => ({
  subject: 'Your Prescription is Ready — Clinic System',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #2563eb; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0;">🏥 Clinic System</h1>
      </div>
      <div style="padding: 32px; background: #f9fafb;">
        <h2 style="color: #1e293b;">📋 Prescription Ready</h2>
        <p>Dear <strong>${patientName}</strong>,</p>
        <p>Your prescription from <strong>${doctorName}</strong> is now available.</p>
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
          <p><strong>Diagnosis:</strong> ${diagnosis}</p>
        </div>
        <p>Please log in to your patient portal to view and download your prescription PDF.</p>
      </div>
      <div style="background: #e2e8f0; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
        © 2026 Clinic System. All rights reserved.
      </div>
    </div>
  `,
});

const paymentReceived = ({ patientName, amount, doctorName }) => ({
  subject: 'Payment Received — Clinic System',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #2563eb; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0;">🏥 Clinic System</h1>
      </div>
      <div style="padding: 32px; background: #f9fafb;">
        <h2 style="color: #1e293b;">✅ Payment Received</h2>
        <p>Dear <strong>${patientName}</strong>,</p>
        <p>We have received your payment. Thank you!</p>
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981;">
          <p><strong>Amount Paid:</strong> ₱${amount}</p>
          <p><strong>Doctor:</strong> ${doctorName}</p>
        </div>
        <p>Your receipt has been recorded in your billing history.</p>
      </div>
      <div style="background: #e2e8f0; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
        © 2026 Clinic System. All rights reserved.
      </div>
    </div>
  `,
});

module.exports = {
  appointmentConfirmed,
  appointmentReminder,
  appointmentBooked,
  prescriptionReady,
  paymentReceived,
};