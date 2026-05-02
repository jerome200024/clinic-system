import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctors, getDoctorSlots } from '../../api/doctorsApi';
import { bookAppointment } from '../../api/appointmentsApi';
import toast from 'react-hot-toast';

const BookAppointment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDoctors().then((res) => setDoctors(res.data.data.doctors));
  }, []);

  const fetchSlots = async (doctorId, date) => {
    if (!doctorId || !date) return;
    try {
      const res = await getDoctorSlots(doctorId, date);
      setSlots(res.data.data.slots);
    } catch {
      setSlots([]);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedSlot('');
    if (selectedDoctor) fetchSlots(selectedDoctor.id, e.target.value);
  };

  const handleBook = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot || !reason) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const scheduled_at = `${selectedDate}T${selectedSlot}:00.000Z`;
      await bookAppointment({
        doctorId: selectedDoctor.id,
        scheduled_at,
        reason,
      });
      toast.success('Appointment booked successfully!');
      navigate('/patient/appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Book Appointment</h1>
      <p className="text-gray-500 mb-8">Schedule a consultation with a doctor</p>

      {/* Steps indicator */}
      <div className="flex items-center mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {s}
            </div>
            {s < 3 && <div className={`h-1 w-16 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
        <div className="ml-4 text-sm text-gray-500">
          {step === 1 && 'Select Doctor'}
          {step === 2 && 'Choose Date & Time'}
          {step === 3 && 'Confirm'}
        </div>
      </div>

      {/* Step 1 — Select Doctor */}
      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Select a Doctor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                onClick={() => { setSelectedDoctor(doc); setStep(2); }}
                className={`p-4 bg-white border-2 rounded-xl cursor-pointer hover:border-blue-400 transition ${
                  selectedDoctor?.id === doc.id ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                <div className="font-semibold text-gray-800">{doc.name}</div>
                <div className="text-sm text-blue-600">{doc.specialization}</div>
                <div className="text-sm text-gray-500 mt-1">₱{doc.consultation_fee} consultation fee</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 — Date & Time */}
      {step === 2 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Choose Date & Time with {selectedDoctor?.name}
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-md">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Slots
                </label>
                {slots.length === 0 ? (
                  <p className="text-gray-400 text-sm">No slots available on this day</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 text-sm rounded-lg border transition ${
                          selectedSlot === slot
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => selectedSlot && setStep(3)}
                disabled={!selectedSlot}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50 hover:bg-blue-700"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 — Confirm */}
      {step === 3 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Confirm Appointment</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-md">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">Doctor</span>
                <span className="font-medium">{selectedDoctor?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Specialization</span>
                <span className="font-medium">{selectedDoctor?.specialization}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="font-medium">{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time</span>
                <span className="font-medium">{selectedSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Fee</span>
                <span className="font-medium text-blue-600">₱{selectedDoctor?.consultation_fee}</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for visit
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your symptoms or reason..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleBook}
                disabled={loading}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50 hover:bg-blue-700"
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;