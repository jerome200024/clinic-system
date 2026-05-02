import { useEffect, useState } from 'react';
import { getAppointments } from '../../api/appointmentsApi';
import useAuthStore from '../../store/authStore';

const DoctorDashboard = () => {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAppointments()
      .then((res) => setAppointments(res.data.data.appointments))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toDateString();
  const todayAppts = appointments.filter(
    (a) => new Date(a.scheduled_at).toDateString() === today
  );
  const pending = appointments.filter((a) => a.status === 'pending');
  const confirmed = appointments.filter((a) => a.status === 'confirmed');

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Good day, {user?.name} 👨‍⚕️
      </h1>
      <p className="text-gray-500 mb-8">Here's your schedule overview</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-3xl mb-2">📅</div>
          <div className="text-2xl font-bold text-gray-800">{todayAppts.length}</div>
          <div className="text-sm text-gray-500">Today's Appointments</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-3xl mb-2">⏳</div>
          <div className="text-2xl font-bold text-gray-800">{pending.length}</div>
          <div className="text-sm text-gray-500">Pending Confirmation</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-3xl mb-2">✅</div>
          <div className="text-2xl font-bold text-gray-800">{confirmed.length}</div>
          <div className="text-sm text-gray-500">Confirmed</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Today's Queue</h2>
        {todayAppts.length === 0 ? (
          <p className="text-gray-400 text-sm">No appointments today</p>
        ) : (
          <div className="space-y-3">
            {todayAppts.map((appt) => (
              <div key={appt.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">{appt.patient_name}</div>
                  <div className="text-sm text-gray-500">{appt.reason}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    {new Date(appt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    appt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {appt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;