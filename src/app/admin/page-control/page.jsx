"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const PageControl = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    tournament_registration_active: false,
    tournament_registration_mode: 'manual', // 'manual', 'scheduled', 'countdown'
    tournament_open_date: '',
    tournament_close_date: '',
    tournament_closed_message: 'Registration is currently closed. Please check back later.',
    course_registration_active: true,
    coming_soon_message: ""
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchSettings();
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
        const data = await response.json();
        setUser(data.user);
      } else {
        console.log('Page control: Auth failed but staying on page');
        // Don't redirect - let user stay on page control page
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Don't redirect - let user stay on page control page
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/page-status');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/page-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setMessage("Settings saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Error saving settings");
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/login', { method: 'DELETE' });
      router.push('/admin');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/admin');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B3AA0] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <a href="/admin/dashboard" className="text-[#2B3AA0] hover:text-[#FFB31A] mr-4">
                ← Dashboard
              </a>
              <h1 className="text-2xl font-bold text-[#2B3AA0]">Page Control</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-[#2B3AA0] mb-8 text-center">
            🎛️ Website Page Control
          </h1>

          <div className="space-y-8">
            {/* Tournament Registration Control */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                🏆 Tournament Registration Control
              </h2>

              {/* Registration Mode Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Registration Mode</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="tournament_mode"
                      value="manual"
                      checked={settings.tournament_registration_mode === 'manual'}
                      onChange={(e) => handleChange('tournament_registration_mode', e.target.value)}
                      className="w-4 h-4"
                    />
                    <div>
                      <span className="text-blue-600 font-medium">🔧 Manual Control</span>
                      <p className="text-sm text-gray-600">Manually enable/disable registration</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="tournament_mode"
                      value="scheduled"
                      checked={settings.tournament_registration_mode === 'scheduled'}
                      onChange={(e) => handleChange('tournament_registration_mode', e.target.value)}
                      className="w-4 h-4"
                    />
                    <div>
                      <span className="text-green-600 font-medium">📅 Scheduled</span>
                      <p className="text-sm text-gray-600">Auto open/close based on dates</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="radio"
                      name="tournament_mode"
                      value="countdown"
                      checked={settings.tournament_registration_mode === 'countdown'}
                      onChange={(e) => handleChange('tournament_registration_mode', e.target.value)}
                      className="w-4 h-4"
                    />
                    <div>
                      <span className="text-purple-600 font-medium">⏰ Countdown</span>
                      <p className="text-sm text-gray-600">Show countdown until registration opens</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Manual Control */}
              {settings.tournament_registration_mode === 'manual' && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-3">Manual Control Settings</h4>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="manual_tournament"
                        checked={settings.tournament_registration_active}
                        onChange={() => handleChange('tournament_registration_active', true)}
                        className="w-4 h-4"
                      />
                      <span className="text-green-600 font-medium">✅ Open Registration</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="manual_tournament"
                        checked={!settings.tournament_registration_active}
                        onChange={() => handleChange('tournament_registration_active', false)}
                        className="w-4 h-4"
                      />
                      <span className="text-red-600 font-medium">❌ Close Registration</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Scheduled Control */}
              {settings.tournament_registration_mode === 'scheduled' && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-3">Scheduled Registration Settings</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Registration Opens On:
                      </label>
                      <input
                        type="datetime-local"
                        value={settings.tournament_open_date}
                        onChange={(e) => handleChange('tournament_open_date', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Registration Closes On:
                      </label>
                      <input
                        type="datetime-local"
                        value={settings.tournament_close_date}
                        onChange={(e) => handleChange('tournament_close_date', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Countdown Control */}
              {settings.tournament_registration_mode === 'countdown' && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-3">Countdown Settings</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Opens On:
                    </label>
                    <input
                      type="datetime-local"
                      value={settings.tournament_open_date}
                      onChange={(e) => handleChange('tournament_open_date', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-sm text-purple-600 mt-2">
                      Users will see a countdown timer until this date/time
                    </p>
                  </div>
                </div>
              )}

              {/* Closed Message */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Closed Message:
                </label>
                <textarea
                  value={settings.tournament_closed_message}
                  onChange={(e) => handleChange('tournament_closed_message', e.target.value)}
                  placeholder="Message to show when registration is closed..."
                  className="w-full p-3 border border-gray-300 rounded-lg h-20 resize-none focus:outline-none focus:ring-2 focus:ring-[#2B3AA0]"
                />
              </div>

              {/* Current Status */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">
                  Current Status: {settings.tournament_registration_active ?
                    "✅ Registration is OPEN" :
                    "❌ Registration is CLOSED"
                  }
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Mode: {settings.tournament_registration_mode.charAt(0).toUpperCase() + settings.tournament_registration_mode.slice(1)}
                </p>
              </div>
            </div>

            {/* Course Registration Control */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                📚 Course Registration
              </h2>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="course"
                    checked={settings.course_registration_active}
                    onChange={() => handleChange('course_registration_active', true)}
                    className="w-4 h-4"
                  />
                  <span className="text-green-600 font-medium">Active (Show Registration Form)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="course"
                    checked={!settings.course_registration_active}
                    onChange={() => handleChange('course_registration_active', false)}
                    className="w-4 h-4"
                  />
                  <span className="text-orange-600 font-medium">Coming Soon (Show Coming Soon Page)</span>
                </label>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Current Status: {settings.course_registration_active ? 
                  "✅ Registration form is active" : 
                  "🚧 Coming soon page is showing"
                }
              </p>
            </div>

            {/* Coming Soon Message */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                💬 Coming Soon Message
              </h2>
              <textarea
                value={settings.coming_soon_message}
                onChange={(e) => handleChange('coming_soon_message', e.target.value)}
                placeholder="Enter the message to show on coming soon pages..."
                className="w-full p-3 border border-gray-300 rounded-lg h-24 resize-none focus:outline-none focus:ring-2 focus:ring-[#2B3AA0]"
              />
              <p className="text-sm text-gray-600 mt-2">
                This message will appear on coming soon pages when registrations are disabled.
              </p>
            </div>

            {/* Save Button */}
            <div className="text-center">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`px-8 py-3 rounded-lg font-bold text-white transition-colors duration-300 ${
                  saving 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-[#2B3AA0] hover:bg-[#1e2a70]'
                }`}
              >
                {saving ? "Saving..." : "💾 Save Settings"}
              </button>
            </div>

            {/* Success/Error Message */}
            {message && (
              <div className={`text-center p-3 rounded-lg ${
                message.includes('successfully') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {message}
              </div>
            )}

            {/* Quick Links */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">🔗 Quick Links</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <a
                  href="/tournaments"
                  target="_blank"
                  className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <span className="font-medium text-blue-800">🏆 View Tournament Page</span>
                  <p className="text-sm text-blue-600">See how the tournament page looks to users</p>
                </a>
                <a
                  href="/registration"
                  target="_blank"
                  className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <span className="font-medium text-green-800">📚 View Registration Page</span>
                  <p className="text-sm text-green-600">See how the course registration looks to users</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PageControl;
