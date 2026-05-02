import { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/medical-records/my-records')
      .then((res) => setRecords(res.data.data.records))
      .catch(() => toast.error('Failed to load records'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="text-center py-20 text-gray-400">Loading...</div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Medical Records</h1>
      <p className="text-gray-500 mb-8">Your complete medical history</p>

      {records.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          No medical records found
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <div key={record.id} className="bg-white rounded-xl border border-gray-200 p-6">

              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="font-semibold text-gray-800">
                    {record.doctor_name}
                  </div>
                  <div className="text-blue-600 text-sm">
                    {record.specialization}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {new Date(record.scheduled_at).toLocaleDateString()}
                  </div>
                </div>

                {record.pdf_url && (
                  <a href={`${import.meta.env.VITE_API_URL.replace('/api', '')}${record.pdf_url}`} target="_blank" rel="noreferrer" className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100">
                    📄 Download PDF
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1">Diagnosis</div>
                  <div className="text-gray-800">{record.diagnosis}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1">Treatment</div>
                  <div className="text-gray-800">{record.treatment}</div>
                </div>
              </div>

              {record.notes && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1">Notes</div>
                  <div className="text-gray-800">{record.notes}</div>
                </div>
              )}

              {record.medications && (
                <div className="mt-4">
                  <div className="text-xs text-gray-500 mb-2">Medications</div>
                  <div className="flex flex-wrap gap-2">
                    {record.medications.map((med, i) => (
                      <span key={i} className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full">
                        {med.name} — {med.dosage}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;