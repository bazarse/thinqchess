"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const TournamentSettings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    tournament_fee: 400,
    registration_fee: 500,
    max_participants: 52,
    countdown_end_date: "",
    tournament_types: [
      {id: "under_8", name: "Under 8", fee: 300, age_min: 5, age_max: 8, active: true},
      {id: "under_10", name: "Under 10", fee: 350, age_min: 8, age_max: 10, active: true},
      {id: "under_12", name: "Under 12", fee: 400, age_min: 10, age_max: 12, active: true},
      {id: "under_16", name: "Under 16", fee: 450, age_min: 12, age_max: 16, active: true},
      {id: "open", name: "Open (Any Age)", fee: 500, age_min: null, age_max: null, active: true}
    ]
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
      const response = await fetch('/api/admin/verify');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
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

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings({
          tournament_fee: data.tournament_fee || 400,
          registration_fee: data.registration_fee || 500,
          max_participants: data.max_participants || 52,
          countdown_end_date: data.countdown_end_date ?
            new Date(data.countdown_end_date).toISOString().slice(0, 16) : "",
          tournament_types: data.tournament_types || [
            {id: "under_8", name: "Under 8", fee: 300, age_min: 5, age_max: 8, active: true},
            {id: "under_10", name: "Under 10", fee: 350, age_min: 8, age_max: 10, active: true},
            {id: "under_12", name: "Under 12", fee: 400, age_min: 10, age_max: 12, active: true},
            {id: "under_16", name: "Under 16", fee: 450, age_min: 12, age_max: 16, active: true},
            {id: "open", name: "Open (Any Age)", fee: 500, age_min: null, age_max: null, active: true}
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...settings,
          countdown_end_date: settings.countdown_end_date || null
        })
      });

      if (response.ok) {
        setMessage("Tournament settings saved successfully!");
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

  const handleTournamentTypeChange = (index, field, value) => {
    setSettings(prev => ({
      ...prev,
      tournament_types: prev.tournament_types.map((type, i) =>
        i === index ? { ...type, [field]: value } : type
      )
    }));
  };

  const addTournamentType = () => {
    const newType = {
      id: `custom_${Date.now()}`,
      name: "New Tournament Type",
      fee: 400,
      age_min: null,
      age_max: null,
      active: true
    };
    setSettings(prev => ({
      ...prev,
      tournament_types: [...prev.tournament_types, newType]
    }));
  };

  const removeTournamentType = (index) => {
    setSettings(prev => ({
      ...prev,
      tournament_types: prev.tournament_types.filter((_, i) => i !== index)
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
    <div className="space-y-6">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">

          <div className="space-y-8">




            {/* Tournament Types */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  🏆 Tournament Types & Categories
                </h2>
                <button
                  type="button"
                  onClick={addTournamentType}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  + Add Type
                </button>
              </div>

              <div className="space-y-4">
                {settings.tournament_types.map((type, index) => (
                  <div key={type.id} className="bg-gray-50 p-4 rounded-lg border">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type Name
                        </label>
                        <input
                          type="text"
                          value={type.name}
                          onChange={(e) => handleTournamentTypeChange(index, 'name', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#2B3AA0]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fee (₹)
                        </label>
                        <input
                          type="number"
                          value={type.fee}
                          onChange={(e) => handleTournamentTypeChange(index, 'fee', parseFloat(e.target.value) || 0)}
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#2B3AA0]"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Min Age
                        </label>
                        <input
                          type="number"
                          value={type.age_min || ''}
                          onChange={(e) => handleTournamentTypeChange(index, 'age_min', e.target.value ? parseInt(e.target.value) : null)}
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#2B3AA0]"
                          placeholder="Any"
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Age
                        </label>
                        <input
                          type="number"
                          value={type.age_max || ''}
                          onChange={(e) => handleTournamentTypeChange(index, 'age_max', e.target.value ? parseInt(e.target.value) : null)}
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#2B3AA0]"
                          placeholder="Any"
                          min="1"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={type.active}
                            onChange={(e) => handleTournamentTypeChange(index, 'active', e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">Active</span>
                        </label>
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={() => removeTournamentType(index)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm transition-colors"
                          disabled={settings.tournament_types.length <= 1}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                {saving ? "Saving..." : "💾 Save Tournament Settings"}
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default TournamentSettings;
