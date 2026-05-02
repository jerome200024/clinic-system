import { useEffect, useState } from 'react';
import { getDoctors, updateDoctor } from '../../api/doctorsApi';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const DoctorSchedule = () => {
  const { user } = useAuthStore();
  const [doctor, setDoctor] = useState(null);
  const [availableDays, setAvailableDays] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/doctors').then((res) => {
      const doc = res.data.data.doctors.find((d) => d.email === user?.email);
      if (doc) {
        setDoctor(doc);
        setAvailableDays(doc.available_days || {});
      }
    }).finally(() => setLoading(false));
  }, []);

  const toggleDay = (day) => {
    if (availableDays[day]) {
      const updated = { ...availableDays };
      delete updated[day];
      setAvailableDays(updated);
    } else {
      setAvailableDays({ ...availableDays, [day]: ['09:00', '17:00'] });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoctor(doctor.id, { available_days: availableDays });
      toast.success('Schedule updated');
    } catch {
      toast.error('Failed to update schedule');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">My Schedule</h1>
      <p className="text-gray-500 mb-8">Set your available days and hours</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
        <div className="space-y-4">
          {DAYS.map((day) => (
            <div key={day} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={!!availableDays[day]}
                  onChange={() => toggleDay(day)}
                  className="w-4 h-4 accent-green-600"
                />
                <span className="capitalize font-medium text-gray-700">{day}</span>
              </div>
              {availableDays[day] && (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={availableDays[day][0]}
                    onChange={(e) => setAvailableDays({
                      ...availableDays,
                      [day]: [e.target.value, availableDays[day][1]]
                    })}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="time"
                    value={availableDays[day][1]}
                    onChange={(e) => setAvailableDays({
                      ...availableDays,
                      [day]: [availableDays[day][0], e.target.value]
                    })}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 w-full bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>
    </div>
  );
};

export default DoctorSchedule;