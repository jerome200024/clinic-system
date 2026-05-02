import { useEffect, useState } from 'react';
import { getAppointments, updateAppointmentStatus } from '../../api/appointmentsApi';
import toast from 'react-hot-toast';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
};

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchAppointments = async () => {
    try {
      const res = await getAppointments(filter ? { status: filter } : {});
      setAppointments(res.data.data.appointments);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, [filter]);

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await updateAppointmentStatus(id, 'cancelled');
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">My Appointments</h1>
      <p className="text-gray-500 mb-6">View and manage your appointments</p>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {['', 'pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === s
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No appointments found</div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div key={appt.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-gray-800 text-lg">{appt.doctor_name}</div>
                  <div className="text-blue-600 text-sm">{appt.specialization}</div>
                  <div className="text-gray-500 text-sm mt-1">
                    {new Date(appt.scheduled_at).toLocaleString()}
                  </div>
                  <div className="text-gray-600 text-sm mt-1">
                    Reason: {appt.reason}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[appt.status]}`}>
                    {appt.status}
                  </span>
                  <div className="text-sm font-medium text-gray-700 mt-2">
                    ₱{appt.amount}
                  </div>
                  <div className={`text-xs mt-1 ${
                    appt.billing_status === 'paid' ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {appt.billing_status}
                  </div>
                </div>
              </div>

              {['pending', 'confirmed'].includes(appt.status) && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleCancel(appt.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Cancel appointment
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;