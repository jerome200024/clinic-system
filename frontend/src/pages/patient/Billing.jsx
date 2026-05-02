import { useEffect, useState } from 'react';
import { getMyBilling, createPaymentIntent } from '../../api/billingApi';
import { loadStripe } from '@stripe/stripe-js';
import api from '../../api/axios';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Payment form component
const CheckoutForm = ({ clientSecret, amount, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (error) {
        toast.error(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!');
        onSuccess();
      }
    } catch (err) {
      toast.error('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Complete Payment</h2>
        <p className="text-gray-500 mb-6">Amount: <span className="font-bold text-blue-600">₱{amount}</span></p>

        <form onSubmit={handleSubmit}>
          <div className="border border-gray-300 rounded-lg p-4 mb-6 bg-gray-50">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#374151',
                    '::placeholder': { color: '#9CA3AF' },
                  },
                },
                hidePostalCode: true,
              }}
            />
          </div>

          <p className="text-xs text-gray-400 mb-4">
            Test card: 4242 4242 4242 4242 — any future date — any CVV
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!stripe || loading}
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Pay ₱${amount}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Billing = () => {
  const [billing, setBilling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(0);

  const fetchBilling = () => {
    getMyBilling()
      .then((res) => setBilling(res.data.data.billing))
      .catch(() => toast.error('Failed to load billing'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBilling(); }, []);

  const handlePay = async (billingId, amount) => {
    setPaying(billingId);
    try {
      const res = await createPaymentIntent(billingId);
      setClientSecret(res.data.data.clientSecret);
      setSelectedAmount(amount);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
      setPaying(null);
    }
  };

const handlePaymentSuccess = async () => {
  try {
    await api.patch(`/billing/${paying}/mark-paid`);
    toast.success('Payment confirmed!');
  } catch (err) {
    console.error('Mark paid failed:', err);
  }
  setClientSecret(null);
  setPaying(null);
  fetchBilling();
};

  const handleCancel = () => {
    setClientSecret(null);
    setPaying(null);
  };

  if (loading) return (
    <div className="text-center py-20 text-gray-400">Loading...</div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Billing</h1>
      <p className="text-gray-500 mb-8">Manage your payments</p>

      {/* Stripe payment modal */}
      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm
            clientSecret={clientSecret}
            amount={selectedAmount}
            onSuccess={handlePaymentSuccess}
            onCancel={handleCancel}
          />
        </Elements>
      )}

      {billing.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          No billing records found
        </div>
      ) : (
        <div className="space-y-4">
          {billing.map((bill) => (
            <div key={bill.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-gray-800">{bill.doctor_name}</div>
                  <div className="text-blue-600 text-sm">{bill.specialization}</div>
                  <div className="text-gray-400 text-sm mt-1">
                    {new Date(bill.scheduled_at).toLocaleDateString()}
                  </div>
                  <div className="text-gray-500 text-sm">{bill.reason}</div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">
                    ₱{bill.amount}
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    bill.status === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {bill.status}
                  </span>

                  {bill.status === 'unpaid' && (
                    <div className="mt-2">
                      <button
                        onClick={() => handlePay(bill.id, bill.amount)}
                        disabled={paying === bill.id}
                        className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {paying === bill.id ? 'Loading...' : 'Pay Now'}
                      </button>
                    </div>
                  )}

                  {bill.status === 'paid' && bill.paid_at && (
                    <div className="text-xs text-gray-400 mt-1">
                      Paid {new Date(bill.paid_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Billing;