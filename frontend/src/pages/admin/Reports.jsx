import { useEffect, useState } from 'react';
import { getAllBilling } from '../../api/billingApi';
import { getAppointments } from '../../api/appointmentsApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'];

const Reports = () => {
  const [billing, setBilling] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllBilling(), getAppointments()])
      .then(([billRes, apptRes]) => {
        setBilling(billRes.data.data.billing);
        setAppointments(apptRes.data.data.appointments);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusData = ['pending', 'confirmed', 'completed', 'cancelled'].map((s) => ({
    name: s,
    value: appointments.filter((a) => a.status === s).length,
  }));

  const revenueByMonth = {};
  billing.filter((b) => b.status === 'paid').forEach((b) => {
    const month = new Date(b.scheduled_at).toLocaleString('default', { month: 'short' });
    revenueByMonth[month] = (revenueByMonth[month] || 0) + b.amount;
  });
  const revenueData = Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue }));

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Reports</h1>
      <p className="text-gray-500 mb-8">Analytics and insights</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Revenue Over Time</h2>
          {revenueData.length === 0 ? (
            <p className="text-gray-400 text-sm">No revenue data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v) => `₱${v}`} />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Appointment Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {statusData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;