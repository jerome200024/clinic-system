import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { logout } from '../api/authApi';
import toast from 'react-hot-toast';

const PatientLayout = () => {
  const { user, logout: clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    clearAuth();
    navigate('/login');
    toast.success('Logged out');
  };

  const links = [
    { to: '/patient', label: '🏠 Dashboard', end: true },
    { to: '/patient/book', label: '📅 Book Appointment' },
    { to: '/patient/appointments', label: '🗓 My Appointments' },
    { to: '/patient/records', label: '📋 Medical Records' },
    { to: '/patient/billing', label: '💳 Billing' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="text-2xl font-bold text-blue-600">🏥 Clinic</div>
          <div className="text-sm text-gray-500 mt-1">Patient Portal</div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-700">{user?.name}</div>
          <div className="text-xs text-gray-500 mb-3">{user?.email}</div>
          <button
            onClick={handleLogout}
            className="w-full text-sm text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default PatientLayout;