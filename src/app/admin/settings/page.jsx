"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AdminSettings = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    username: 'admin',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [paymentSettings, setPaymentSettings] = useState({
    payment_mode: 'razorpay', // Only razorpay mode
    razorpay_key_id: 'rzp_live_z71oXRZ0avccLv',
    razorpay_key_secret: 'uNuvlB1ovlLeGTUmyBQi6qPU',
    razorpay_webhook_secret: '',
    test_mode: false // Live mode by default
  });

  const [googleSettings, setGoogleSettings] = useState({
    places_api_key: '',
    place_id_jp_nagar: 'ChXdvpvpgI0jaOm_lM-Zf9XXYjM',
    place_id_akshayanagar: '',
    reviews_enabled: true
  });

  useEffect(() => {
    checkAuth();
    fetchPaymentSettings();
    fetchGoogleSettings();
  }, []);

  const checkAuth = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('admin-token');

      const headers = {
        'credentials': 'include'
      };

      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/admin/verify', {
        credentials: 'include',
        headers: headers
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        console.log('Settings page: Auth failed but staying on page');
        // Don't redirect - let user stay on settings page
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Don't redirect - let user stay on settings page
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentSettings = async () => {
    try {
      const response = await fetch('/api/admin/payment-settings');
      if (response.ok) {
        const data = await response.json();
        setPaymentSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch payment settings:', error);
    }
  };

  const fetchGoogleSettings = async () => {
    try {
      const response = await fetch('/api/admin/google-settings');
      if (response.ok) {
        const data = await response.json();
        setGoogleSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch Google settings:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPaymentSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGoogleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGoogleSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validation
    if (formData.newPassword && formData.newPassword.length > 8) {
      setError('Password must be maximum 8 characters');
      return;
    }

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    if (formData.newPassword && !formData.currentPassword) {
      setError('Current password is required to change password');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Settings updated successfully!');
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        setError(data.error || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Settings update failed:', error);
      setError('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const response = await fetch('/api/admin/payment-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentSettings),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Payment settings updated successfully!');
      } else {
        setError(data.error || 'Failed to update payment settings');
      }
    } catch (error) {
      console.error('Payment settings update failed:', error);
      setError('Failed to update payment settings');
    } finally {
      setSaving(false);
    }
  };

  const handleGoogleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const response = await fetch('/api/admin/google-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleSettings),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Google settings updated successfully!');
      } else {
        setError(data.error || 'Failed to update Google settings');
      }
    } catch (error) {
      console.error('Google settings update failed:', error);
      setError('Failed to update Google settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#2B3AA0]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-gray-600">Manage your admin account settings</p>
      </div>



      {/* Account Settings Form */}
      <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">👤 Account Settings</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3AA0] focus:border-transparent"
              required
            />
          </div>

          {/* Current Password */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3AA0] focus:border-transparent"
              placeholder="Enter current password to make changes"
            />
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
              New Password (Optional)
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              maxLength={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3AA0] focus:border-transparent"
              placeholder="Maximum 8 characters"
            />
            <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              maxLength={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3AA0] focus:border-transparent"
              placeholder="Re-enter new password"
            />
          </div>

          {/* Messages */}
          {message && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">{message}</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#2B3AA0] text-white rounded-lg hover:bg-[#1e2a70] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
