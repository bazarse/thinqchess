"use client";
import React, { useState, useEffect } from "react";

const AdminControl = () => {
  const [settings, setSettings] = useState({
    tournament_registration_active: false,
    course_registration_active: true,
    coming_soon_message: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/page-status');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-[#2B3AA0] mb-8 text-center">
            🎛️ ThinQ Chess Admin Control Panel
          </h1>

          <div className="space-y-8">
            {/* Tournament Registration Control */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                🏆 Tournament Registration
              </h2>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="tournament"
                    checked={settings.tournament_registration_active}
                    onChange={() => handleChange('tournament_registration_active', true)}
                    className="w-4 h-4"
                  />
                  <span className="text-green-600 font-medium">Active (Show Registration Form)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="tournament"
                    checked={!settings.tournament_registration_active}
                    onChange={() => handleChange('tournament_registration_active', false)}
                    className="w-4 h-4"
                  />
                  <span className="text-orange-600 font-medium">Coming Soon (Show Coming Soon Page)</span>
                </label>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Current Status: {settings.tournament_registration_active ? 
                  "✅ Registration form is active" : 
                  "🚧 Coming soon page is showing"
                }
              </p>
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
      </div>
    </div>
  );
};

export default AdminControl;
