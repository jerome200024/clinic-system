import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { updateAppointmentStatus } from '../../api/appointmentsApi';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const PatientRecord = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const navigate = useNavigate();

  const [form, setForm] = useState({ diagnosis: '', treatment: '', notes: '' });
  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: '', duration: '' }
  ]);
  const [loading, setLoading] = useState(false);

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const updateMed = (index, field, value) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const handleSubmit = async () => {
    if (!form.diagnosis || !form.treatment) {
      toast.error('Diagnosis and treatment are required');
      return;
    }
    setLoading(true);
    try {
      // Create medical record
      const recordRes = await api.post('/medical-records', {
        appointmentId,
        ...form,
      });

      const recordId = recordRes.data.data.record.id;

      // Create prescription if medications filled
      const validMeds = medications.filter((m) => m.name && m.dosage);
      if (validMeds.length > 0) {
        await api.post('/prescriptions', {
          recordId,
          medications: validMeds,
        });
      }

      toast.success('Record and prescription saved!');
      navigate('/doctor/appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Complete Consultation</h1>
      <p className="text-gray-500 mb-8">Add medical record and prescription</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Medical Record</h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis *</label>
            <textarea
              value={form.diagnosis}
              onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter diagnosis..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Treatment *</label>
            <textarea
              value={form.treatment}
              onChange={(e) => setForm({ ...form, treatment: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter treatment plan..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Additional notes..."
            />
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-700 mb-4">Prescriptions</h2>
        <div className="space-y-3 mb-4">
          {medications.map((med, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg">
              <input
                placeholder="Medication name"
                value={med.name}
                onChange={(e) => updateMed(i, 'name', e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <input
                placeholder="Dosage (e.g. 5mg)"
                value={med.dosage}
                onChange={(e) => updateMed(i, 'dosage', e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <input
                placeholder="Frequency (e.g. Once daily)"
                value={med.frequency}
                onChange={(e) => updateMed(i, 'frequency', e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <input
                placeholder="Duration (e.g. 30 days)"
                value={med.duration}
                onChange={(e) => updateMed(i, 'duration', e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
          ))}
        </div>

        <button
          onClick={addMedication}
          className="text-sm text-green-600 hover:underline mb-6"
        >
          + Add another medication
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/doctor/appointments')}
            className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm disabled:opacity-50 hover:bg-green-700"
          >
            {loading ? 'Saving...' : 'Save Record & Prescription'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientRecord;