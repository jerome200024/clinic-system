import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { getAppointments } from '../../api/appointmentsApi';
import { getMyBilling } from '../../api/billingApi';

const PatientDashboard = () => {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState([]);
  const [billing, setBilling] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptRes, billRes] = await Promise.all([
          getAppointments(),
          getMyBilling(),
        ]);
        setAppointments(apptRes.data.data.appointments);
        setBilling(billRes.data.data.billing);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const upcoming = appointments.filter((a) =>
    ['pending', 'confirmed'].includes(a.status)
  );
  const unpaidBills = billing.filter((b) => b.status === 'unpaid');

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Welcome, {user?.name} 👋
      </h1>
      <p className="text-gray-500 mb-8">Here's your health summary</p>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-3xl mb-2">🗓</div>
          <div className="text-2xl font-bold text-gray-800">{upcoming.length}</div>
          <div className="text-sm text-gray-500">Upcoming Appointments</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-3xl mb-2">💳</div>
          <div className="text-2xl font-bold text-gray-800">{unpaidBills.length}</div>
          <div className="text-sm text-gray-500">Unpaid Bills</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-3xl mb-2">📋</div>
          <div className="text-2xl font-bold text-gray-800">{appointments.length}</div>
          <div className="text-sm text-gray-500">Total Appointments</div>
        </div>
      </div>

      {/* Upcoming appointments */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Upcoming Appointments</h2>
          <Link to="/patient/book" className="text-sm text-blue-600 hover:underline">
            + Book new
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-gray-400 text-sm">No upcoming appointments</p>
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 3).map((appt) => (
              <div key={appt.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-800">{appt.doctor_name}</div>
                  <div className="text-sm text-gray-500">{appt.specialization}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    {new Date(appt.scheduled_at).toLocaleDateString()}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    appt.status === 'confirmed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {appt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unpaid bills */}
      {unpaidBills.length > 0 && (
        <div className="bg-red-50 rounded-xl border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-700 mb-4">⚠️ Unpaid Bills</h2>
          <div className="space-y-3">
            {unpaidBills.map((bill) => (
              <div key={bill.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-red-100">
                <div>
                  <div className="font-medium text-gray-800">{bill.doctor_name}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(bill.scheduled_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-red-600">₱{bill.amount}</div>
                  <Link to="/patient/billing" className="text-xs text-blue-600 hover:underline">
                    Pay now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;