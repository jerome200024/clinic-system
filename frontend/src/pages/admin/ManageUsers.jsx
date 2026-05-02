import { useEffect, useState } from 'react';
import { getAllPatients } from '../../api/patientsApi';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/patients', { params: { search } });
      setUsers(res.data.data.patients);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [search]);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Manage Users</h1>
      <p className="text-gray-500 mb-6">View and manage all patients</p>

      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2.5 mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Name</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Email</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Phone</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Blood Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">{user.name}</td>
                <td className="px-6 py-4 text-gray-500">{user.email}</td>
                <td className="px-6 py-4 text-gray-500">{user.phone || '—'}</td>
                <td className="px-6 py-4 text-gray-500">{user.blood_type || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {users.length === 0 && (
          <div className="text-center py-10 text-gray-400">No patients found</div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;