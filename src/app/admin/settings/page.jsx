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
    payment_mode: 'demo', // 'demo' or 'razorpay'
    razorpay_key_id: '',
    razorpay_key_secret: '',
    razorpay_webhook_secret: '',
    demo_payment_enabled: true,
    test_mode: true
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
      const response = await fetch('/api/admin/verify');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        router.push('/admin');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/admin');
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

      {/* Google Integration Settings */}
      <div className="bg-white rounded-xl shadow-md p-6 max-w-4xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">🌐 Google Integration Settings</h2>

        <form onSubmit={handleGoogleSubmit} className="space-y-6">
          {/* Google Reviews Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">Google Reviews Configuration</label>

            {/* Enable Reviews Toggle */}
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="reviews_enabled"
                name="reviews_enabled"
                checked={googleSettings.reviews_enabled}
                onChange={handleGoogleChange}
                className="w-4 h-4 text-[#2B3AA0] border-gray-300 rounded focus:ring-[#2B3AA0]"
              />
              <label htmlFor="reviews_enabled" className="ml-3 text-sm">
                <span className="font-medium">Enable Google Reviews</span>
                <span className="block text-gray-600">Show real Google reviews on homepage</span>
              </label>
            </div>

            {/* Google Places API Key */}
            <div className="mb-4">
              <label htmlFor="places_api_key" className="block text-sm font-medium text-gray-700 mb-2">
                Google Places API Key
              </label>
              <input
                type="password"
                id="places_api_key"
                name="places_api_key"
                value={googleSettings.places_api_key}
                onChange={handleGoogleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3AA0] focus:border-transparent"
                placeholder="Enter your Google Places API key"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get from Google Cloud Console → APIs & Services → Credentials
              </p>
            </div>

            {/* Place IDs */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="place_id_jp_nagar" className="block text-sm font-medium text-gray-700 mb-2">
                  JP Nagar Place ID
                </label>
                <input
                  type="text"
                  id="place_id_jp_nagar"
                  name="place_id_jp_nagar"
                  value={googleSettings.place_id_jp_nagar}
                  onChange={handleGoogleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3AA0] focus:border-transparent"
                  placeholder="ChXdvpvpgI0jaOm_lM-Zf9XXYjM"
                />
              </div>
              <div>
                <label htmlFor="place_id_akshayanagar" className="block text-sm font-medium text-gray-700 mb-2">
                  Akshayanagar Place ID (Optional)
                </label>
                <input
                  type="text"
                  id="place_id_akshayanagar"
                  name="place_id_akshayanagar"
                  value={googleSettings.place_id_akshayanagar}
                  onChange={handleGoogleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3AA0] focus:border-transparent"
                  placeholder="Enter Akshayanagar place ID"
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h4 className="font-medium text-blue-800 mb-2">📋 Setup Instructions:</h4>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Go to <a href="https://console.cloud.google.com" target="_blank" className="underline">Google Cloud Console</a></li>
                <li>Create a new project or select existing one</li>
                <li>Enable "Places API" in APIs & Services</li>
                <li>Create credentials → API Key</li>
                <li>Restrict the API key to Places API for security</li>
                <li>Find your business Place ID using <a href="https://developers.google.com/maps/documentation/places/web-service/place-id" target="_blank" className="underline">Place ID Finder</a></li>
              </ol>
            </div>
          </div>

          {/* Submit Button */}
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

      {/* Payment Integration Settings */}
      <div className="bg-white rounded-xl shadow-md p-6 max-w-4xl">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">💳 Payment Integration Settings</h2>

        <form onSubmit={handlePaymentSubmit} className="space-y-6">
          {/* Payment Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">Payment Mode</label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="payment_mode"
                  value="demo"
                  checked={paymentSettings.payment_mode === 'demo'}
                  onChange={handlePaymentChange}
                  className="w-4 h-4 text-[#2B3AA0] border-gray-300 focus:ring-[#2B3AA0]"
                />
                <span className="ml-3 text-sm">
                  <span className="font-medium text-green-600">🎯 Demo Payment</span>
                  <span className="block text-gray-500">For testing - no real payments processed</span>
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="payment_mode"
                  value="razorpay"
                  checked={paymentSettings.payment_mode === 'razorpay'}
                  onChange={handlePaymentChange}
                  className="w-4 h-4 text-[#2B3AA0] border-gray-300 focus:ring-[#2B3AA0]"
                />
                <span className="ml-3 text-sm">
                  <span className="font-medium text-blue-600">💰 Razorpay Integration</span>
                  <span className="block text-gray-500">Live payment processing with Razorpay</span>
                </span>
              </label>
            </div>
          </div>

          {/* Razorpay Settings - Only show when Razorpay is selected */}
          {paymentSettings.payment_mode === 'razorpay' && (
            <div className="bg-blue-50 p-6 rounded-lg space-y-4">
              <h3 className="text-lg font-medium text-blue-900">Razorpay Configuration</h3>

              {/* Test Mode Toggle */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="test_mode"
                  name="test_mode"
                  checked={paymentSettings.test_mode}
                  onChange={handlePaymentChange}
                  className="w-4 h-4 text-[#2B3AA0] border-gray-300 rounded focus:ring-[#2B3AA0]"
                />
                <label htmlFor="test_mode" className="ml-3 text-sm">
                  <span className="font-medium">Test Mode</span>
                  <span className="block text-gray-600">Use Razorpay test keys (recommended for development)</span>
                </label>
              </div>

              {/* Razorpay Key ID */}
              <div>
                <label htmlFor="razorpay_key_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Razorpay Key ID {paymentSettings.test_mode ? '(Test)' : '(Live)'}
                </label>
                <input
                  type="text"
                  id="razorpay_key_id"
                  name="razorpay_key_id"
                  value={paymentSettings.razorpay_key_id}
                  onChange={handlePaymentChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3AA0] focus:border-transparent"
                  placeholder={paymentSettings.test_mode ? "rzp_test_xxxxxxxxxx" : "rzp_live_xxxxxxxxxx"}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {paymentSettings.test_mode ? 'Get from Razorpay Dashboard → Settings → API Keys (Test Mode)' : 'Get from Razorpay Dashboard → Settings → API Keys (Live Mode)'}
                </p>
              </div>

              {/* Razorpay Key Secret */}
              <div>
                <label htmlFor="razorpay_key_secret" className="block text-sm font-medium text-gray-700 mb-2">
                  Razorpay Key Secret {paymentSettings.test_mode ? '(Test)' : '(Live)'}
                </label>
                <input
                  type="password"
                  id="razorpay_key_secret"
                  name="razorpay_key_secret"
                  value={paymentSettings.razorpay_key_secret}
                  onChange={handlePaymentChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3AA0] focus:border-transparent"
                  placeholder="Enter your Razorpay secret key"
                />
                <p className="text-xs text-gray-500 mt-1">Keep this secret and secure</p>
              </div>

              {/* Webhook Secret */}
              <div>
                <label htmlFor="razorpay_webhook_secret" className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook Secret (Optional)
                </label>
                <input
                  type="password"
                  id="razorpay_webhook_secret"
                  name="razorpay_webhook_secret"
                  value={paymentSettings.razorpay_webhook_secret}
                  onChange={handlePaymentChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B3AA0] focus:border-transparent"
                  placeholder="Enter webhook secret for payment verification"
                />
                <p className="text-xs text-gray-500 mt-1">For enhanced security and payment verification</p>
              </div>

              {/* Instructions */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">📋 Setup Instructions:</h4>
                <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                  <li>Create a Razorpay account at <a href="https://razorpay.com" target="_blank" className="underline">razorpay.com</a></li>
                  <li>Go to Dashboard → Settings → API Keys</li>
                  <li>Generate {paymentSettings.test_mode ? 'Test' : 'Live'} API Keys</li>
                  <li>Copy the Key ID and Key Secret here</li>
                  <li>Configure webhooks for payment verification (optional)</li>
                </ol>
              </div>
            </div>
          )}

          {/* Demo Payment Settings */}
          {paymentSettings.payment_mode === 'demo' && (
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-green-900 mb-3">Demo Payment Configuration</h3>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="demo_payment_enabled"
                  name="demo_payment_enabled"
                  checked={paymentSettings.demo_payment_enabled}
                  onChange={handlePaymentChange}
                  className="w-4 h-4 text-[#2B3AA0] border-gray-300 rounded focus:ring-[#2B3AA0]"
                />
                <label htmlFor="demo_payment_enabled" className="ml-3 text-sm">
                  <span className="font-medium">Enable Demo Payments</span>
                  <span className="block text-gray-600">Allow users to complete registrations without real payment</span>
                </label>
              </div>
              <div className="mt-4 p-3 bg-green-100 rounded border border-green-200">
                <p className="text-sm text-green-800">
                  <strong>Demo Mode:</strong> All payments will be simulated. Users can complete registrations
                  without entering real payment details. Perfect for testing and development.
                </p>
              </div>
            </div>
          )}

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
              {saving ? 'Saving...' : 'Save Payment Settings'}
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
