import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { logout } from '../api/authApi';
import toast from 'react-hot-toast';

const AdminLayout = () => {
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
    { to: '/admin', label: '🏠 Dashboard', end: true },
    { to: '/admin/users', label: '👥 Manage Users' },
    { to: '/admin/doctors', label: '👨‍⚕️ Manage Doctors' },
    { to: '/admin/reports', label: '📊 Reports' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-white border-r border-gray-200
        flex flex-col transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-purple-600">🏥 Clinic</div>
            <div className="text-sm text-gray-500 mt-1">Admin Portal</div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-purple-50 text-purple-600'
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

      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 text-xl"
          >
            ☰
          </button>
          <div className="text-lg font-bold text-purple-600">🏥 Clinic</div>
          <div className="text-sm text-gray-500">{user?.name?.split(' ')[0]}</div>
        </div>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;