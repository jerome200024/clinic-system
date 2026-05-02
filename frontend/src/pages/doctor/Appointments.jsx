import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAppointments, updateAppointmentStatus } from '../../api/appointmentsApi';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
};

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchAppointments = async () => {
    try {
      const res = await getAppointments(filter ? { status: filter } : {});
      setAppointments(res.data.data.appointments);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, [filter]);

  const handleStatus = async (id, status) => {
    try {
      await updateAppointmentStatus(id, status);
      toast.success(`Appointment ${status}`);
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Appointments</h1>
      <p className="text-gray-500 mb-6">Manage your patient appointments</p>

      <div className="flex gap-2 mb-6">
        {['', 'pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === s
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {appointments.map((appt) => (
          <div key={appt.id} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold text-gray-800 text-lg">{appt.patient_name}</div>
                <div className="text-gray-500 text-sm">
                  {new Date(appt.scheduled_at).toLocaleString()}
                </div>
                <div className="text-gray-600 text-sm mt-1">Reason: {appt.reason}</div>
                {appt.blood_type && (
                  <div className="text-gray-500 text-sm">Blood Type: {appt.blood_type}</div>
                )}
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[appt.status]}`}>
                {appt.status}
              </span>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              {appt.status === 'pending' && (
                <button
                  onClick={() => handleStatus(appt.id, 'confirmed')}
                  className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Confirm
                </button>
              )}
              {appt.status === 'confirmed' && (
                <button
                  onClick={() => navigate(`/doctor/patients/${appt.patient_id}?appointmentId=${appt.id}`)}
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Complete & Add Record
                </button>
              )}
              {['pending', 'confirmed'].includes(appt.status) && (
                <button
                  onClick={() => handleStatus(appt.id, 'cancelled')}
                  className="text-sm border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorAppointments;