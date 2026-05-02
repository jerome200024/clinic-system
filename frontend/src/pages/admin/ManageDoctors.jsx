import { useEffect, useState } from 'react';
import { getDoctors } from '../../api/doctorsApi';
import toast from 'react-hot-toast';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoctors()
      .then((res) => setDoctors(res.data.data.doctors))
      .catch(() => toast.error('Failed to load doctors'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Manage Doctors</h1>
      <p className="text-gray-500 mb-6">View all registered doctors</p>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Name</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Specialization</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">License No</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Fee</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Availability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {doctors.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">{doc.name}</td>
                <td className="px-6 py-4 text-blue-600">{doc.specialization}</td>
                <td className="px-6 py-4 text-gray-500">{doc.license_no}</td>
                <td className="px-6 py-4 text-gray-500">₱{doc.consultation_fee}</td>
                <td className="px-6 py-4 text-gray-500">
                  {Object.keys(doc.available_days || {}).length > 0
                    ? Object.keys(doc.available_days).join(', ').toUpperCase()
                    : 'Not set'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {doctors.length === 0 && (
          <div className="text-center py-10 text-gray-400">No doctors found</div>
        )}
      </div>
    </div>
  );
};

export default ManageDoctors;