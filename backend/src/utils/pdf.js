const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const generatePrescriptionPDF = async (prescription, record) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  const medications = prescription.medications
    .map(
      (med) => `
      <tr>
        <td>${med.name}</td>
        <td>${med.dosage}</td>
        <td>${med.frequency}</td>
        <td>${med.duration}</td>
      </tr>`
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #2563eb; margin: 0; font-size: 28px; }
        .header p { margin: 5px 0; color: #666; }
        .section { margin-bottom: 24px; }
        .section h3 { color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .info-item label { font-weight: bold; color: #555; font-size: 12px; display: block; }
        .info-item span { font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th { background: #2563eb; color: white; padding: 10px; text-align: left; font-size: 13px; }
        td { padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
        tr:nth-child(even) { background: #f9fafb; }
        .footer { margin-top: 60px; text-align: right; }
        .signature-line { border-top: 1px solid #333; width: 200px; margin-left: auto; padding-top: 8px; font-size: 12px; }
        .badge { background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🏥 Clinic Management System</h1>
        <p>Medical Prescription</p>
        <span class="badge">Official Document</span>
      </div>

      <div class="section">
        <h3>Patient Information</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>Patient Name</label>
            <span>${record.patient_name}</span>
          </div>
          <div class="info-item">
            <label>Doctor</label>
            <span>${record.doctor_name}</span>
          </div>
          <div class="info-item">
            <label>Specialization</label>
            <span>${record.specialization}</span>
          </div>
          <div class="info-item">
            <label>Date</label>
            <span>${new Date(record.scheduled_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h3>Diagnosis & Treatment</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>Diagnosis</label>
            <span>${record.diagnosis}</span>
          </div>
          <div class="info-item">
            <label>Treatment</label>
            <span>${record.treatment}</span>
          </div>
        </div>
        ${record.notes ? `<div class="info-item" style="margin-top:12px">
          <label>Notes</label>
          <span>${record.notes}</span>
        </div>` : ''}
      </div>

      <div class="section">
        <h3>Prescribed Medications</h3>
        <table>
          <thead>
            <tr>
              <th>Medication</th>
              <th>Dosage</th>
              <th>Frequency</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            ${medications}
          </tbody>
        </table>
      </div>

      <div class="footer">
        <div class="signature-line">
          ${record.doctor_name}<br>
          ${record.specialization}
        </div>
      </div>
    </body>
    </html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle0' });

  // Save PDF to local folder
  const outputDir = path.join(__dirname, '../../uploads/prescriptions');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filename = `prescription-${prescription.id}.pdf`;
  const outputPath = path.join(outputDir, filename);

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
  });

  await browser.close();

  return `/uploads/prescriptions/${filename}`;
};

module.exports = { generatePrescriptionPDF };