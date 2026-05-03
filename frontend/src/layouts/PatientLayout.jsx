import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { logout } from '../api/authApi';
import toast from 'react-hot-toast';

const PatientLayout = () => {
  const { user, logout: clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200
          flex flex-col transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0
        `}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-blue-600">🏥 Clinic</div>
            <div className="text-sm text-gray-500 mt-1">Patient Portal</div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setSidebarOpen(false)}
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
          <div className="text-sm font-medium text-gray-700 truncate">{user?.name}</div>
          <div className="text-xs text-gray-500 mb-3 truncate">{user?.email}</div>
          <button
            onClick={handleLogout}
            className="w-full text-sm text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Mobile topbar */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 text-2xl font-bold"
          >
            ☰
          </button>
          <div className="text-lg font-bold text-blue-600">🏥 Clinic</div>
          <div className="text-sm text-gray-500">{user?.name?.split(' ')[0]}</div>
        </div>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PatientLayout;