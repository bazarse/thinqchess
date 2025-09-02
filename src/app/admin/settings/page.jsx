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
    payment_mode: 'razorpay',
    razorpay_key_id: '',
    razorpay_key_secret: '',
    razorpay_webhook_secret: '',
    test_mode: false
  });

  const [googleSettings, setGoogleSettings] = useState({
    places_api_key: 'AIzaSyDznXxcO6o_OdXyHYJnu5K9myYAV2aGBoY',
    place_id_jp_nagar: 'ChIJ-_jBcPtrrjsRvd658JobDpM',
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
    if (formData.newPassword && formData.newPassword.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    
    if (formData.newPassword && formData.newPassword.length > 20) {
      setError('Password must be maximum 20 characters');
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



      {/* Payment Settings Form */}
      <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">💳 Payment Settings</h2>
        
        <form onSubmit={handlePaymentSubmit} className="space-y-6">
          {/* Test/Live Mode Toggle */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-blue-900">Payment Mode</h3>
                <p className="text-sm text-blue-700 mt-1">
                  {paymentSettings.test_mode ? 
                    '🧪 Test Mode: Using test Razorpay credentials for safe testing' : 
                    '🔴 Live Mode: Using live Razorpay credentials for real payments'
                  }
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="test_mode"
                  checked={paymentSettings.test_mode}
                  onChange={handlePaymentChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900">
                  {paymentSettings.test_mode ? 'Test Mode' : 'Live Mode'}
                </span>
              </label>
            </div>
          </div>

          {/* Razorpay Credentials */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              {paymentSettings.test_mode ? 'Test' : 'Live'} Razorpay Credentials
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Razorpay Key ID
              </label>
              <input
                type="text"
                name="razorpay_key_id"
                value={paymentSettings.razorpay_key_id}
                onChange={handlePaymentChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3AA0] focus:border-transparent"
                placeholder={paymentSettings.test_mode ? 'rzp_test_...' : 'rzp_live_...'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Razorpay Key Secret
              </label>
              <input
                type="password"
                name="razorpay_key_secret"
                value={paymentSettings.razorpay_key_secret}
                onChange={handlePaymentChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3AA0] focus:border-transparent"
                placeholder="Enter Razorpay secret key"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook Secret (Optional)
              </label>
              <input
                type="password"
                name="razorpay_webhook_secret"
                value={paymentSettings.razorpay_webhook_secret}
                onChange={handlePaymentChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3AA0] focus:border-transparent"
                placeholder="Enter webhook secret"
              />
            </div>
          </div>

          {/* Test Mode Instructions */}
          {paymentSettings.test_mode && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">🧪 Test Mode Instructions:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Use test card: 4111 1111 1111 1111</li>
                <li>• Any future expiry date (e.g., 12/25)</li>
                <li>• Any CVV (e.g., 123)</li>
                <li>• No real money will be charged</li>
                <li>• Perfect for testing tournament registrations</li>
              </ul>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#2B3AA0] text-white rounded-lg hover:bg-[#1e2a70] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save Payment Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Google API Settings Form */}
      <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">🌍 Google API Settings</h2>
        
        <form onSubmit={handleGoogleSubmit} className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Google Places API</h3>
            <p className="text-sm text-blue-700">
              Required for displaying Google Reviews on the website
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Places API Key
            </label>
            <input
              type="password"
              name="places_api_key"
              value={googleSettings.places_api_key}
              onChange={handleGoogleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3AA0] focus:border-transparent"
              placeholder="Enter Google Places API key"
            />
            <p className="text-xs text-gray-500 mt-1">
              Get your API key from Google Cloud Console
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              JP Nagar Place ID
            </label>
            <input
              type="text"
              name="place_id_jp_nagar"
              value={googleSettings.place_id_jp_nagar}
              onChange={handleGoogleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3AA0] focus:border-transparent"
              placeholder="ChIJ..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Akshaya Nagar Place ID
            </label>
            <input
              type="text"
              name="place_id_akshayanagar"
              value={googleSettings.place_id_akshayanagar}
              onChange={handleGoogleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3AA0] focus:border-transparent"
              placeholder="ChIJ..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="reviews_enabled"
              checked={googleSettings.reviews_enabled}
              onChange={handleGoogleChange}
              className="h-4 w-4 text-[#2B3AA0] focus:ring-[#2B3AA0] border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Enable Google Reviews on website
            </label>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">📝 Setup Instructions:</h4>
            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
              <li>Go to Google Cloud Console</li>
              <li>Enable Places API</li>
              <li>Create API key with Places API access</li>
              <li>Add API key above</li>
              <li>Reviews will appear automatically</li>
            </ol>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#2B3AA0] text-white rounded-lg hover:bg-[#1e2a70] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save Google Settings'}
            </button>
          </div>
        </form>
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
