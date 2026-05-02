import { useEffect, useState } from 'react';
import { getAllBilling } from '../../api/billingApi';
import { getAllPatients } from '../../api/patientsApi';
import { getAppointments } from '../../api/appointmentsApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    pendingAppointments: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, appointmentsRes, billingRes] = await Promise.all([
          getAllPatients(),
          getAppointments(),
          getAllBilling(),
        ]);

        const patients = patientsRes.data.data.patients;
        const appointments = appointmentsRes.data.data.appointments;
        const billing = billingRes.data.data.billing;

        const totalRevenue = billing
          .filter((b) => b.status === 'paid')
          .reduce((sum, b) => sum + b.amount, 0);

        const pending = appointments.filter((a) => a.status === 'pending').length;

        setStats({
          totalPatients: patients.length,
          totalAppointments: appointments.length,
          totalRevenue,
          pendingAppointments: pending,
        });

        // Group revenue by month
        const monthlyRevenue = {};
        billing
          .filter((b) => b.status === 'paid')
          .forEach((b) => {
            const month = new Date(b.scheduled_at).toLocaleString('default', { month: 'short' });
            monthlyRevenue[month] = (monthlyRevenue[month] || 0) + b.amount;
          });

        setRevenueData(
          Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
      <p className="text-gray-500 mb-8">System overview and analytics</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {[
          { label: 'Total Patients', value: stats.totalPatients, icon: '👥', color: 'text-blue-600' },
          { label: 'Total Appointments', value: stats.totalAppointments, icon: '🗓', color: 'text-green-600' },
          { label: 'Total Revenue', value: `₱${stats.totalRevenue}`, icon: '💰', color: 'text-yellow-600' },
          { label: 'Pending', value: stats.pendingAppointments, icon: '⏳', color: 'text-red-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Monthly Revenue</h2>
        {revenueData.length === 0 ? (
          <p className="text-gray-400 text-sm">No revenue data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₱${value}`} />
              <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;