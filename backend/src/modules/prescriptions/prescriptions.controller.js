const prescriptionsService = require('./prescriptions.service');
const path = require('path');
const fs = require('fs');

const createPrescription = async (req, res, next) => {
  try {
    const { recordId, medications } = req.body;
    const prescription = await prescriptionsService.createPrescription({
      recordId,
      medications,
      doctorUserId: req.user.id,
    });
    res.status(201).json({
      success: true,
      message: 'Prescription created',
      data: { prescription },
    });
  } catch (err) {
    next(err);
  }
};

const getPrescriptionsByRecord = async (req, res, next) => {
  try {
    const prescriptions = await prescriptionsService.getPrescriptionsByRecord(
      req.params.recordId
    );
    res.json({ success: true, data: { prescriptions } });
  } catch (err) {
    next(err);
  }
};

const downloadPDF = async (req, res, next) => {
  try {
    const prescription = await prescriptionsService.getPrescriptionById(
      req.params.id
    );

    if (!prescription.pdf_url) {
      return res.status(404).json({ success: false, message: 'PDF not found' });
    }

    const filePath = path.join(__dirname, '../../../', prescription.pdf_url);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'PDF file not found' });
    }

    res.download(filePath);
  } catch (err) {
    next(err);
  }
};

module.exports = { createPrescription, getPrescriptionsByRecord, downloadPDF };