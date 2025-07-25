"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const CreateTournament = () => {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [tournaments, setTournaments] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTournament, setEditingTournament] = useState(null);
  const [showRegistrations, setShowRegistrations] = useState(null);
  const [newTournament, setNewTournament] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    registration_deadline: "",
    max_participants: 50,
    entry_fee: 500,
    tournament_types: [],
    venue: "",
    rules: "",
    prizes: "",
    status: "upcoming"
  });
  const router = useRouter();

  // Mock existing tournaments with registrations
  const mockTournaments = [
    {
      id: 1,
      name: "ThinQ Chess Championship 2024",
      description: "Annual championship tournament",
      start_date: "2024-08-15",
      end_date: "2024-08-17",
      max_participants: 100,
      current_participants: 45,
      entry_fee: 500,
      status: "active",
      tournament_types: ["Under 8", "Under 10", "Under 12", "Under 16", "Open"],
      venue: "ThinQ Chess Academy",
      registrations: [
        { id: 1, name: "Arjun Sharma", category: "Under 12", phone: "+91 9876543210", email: "arjun@example.com", registered_at: "2024-07-20" },
        { id: 2, name: "Priya Patel", category: "Under 16", phone: "+91 9876543211", email: "priya@example.com", registered_at: "2024-07-21" },
        { id: 3, name: "Rohit Kumar", category: "Open", phone: "+91 9876543212", email: "rohit@example.com", registered_at: "2024-07-22" },
        { id: 4, name: "Sneha Gupta", category: "Under 10", phone: "+91 9876543213", email: "sneha@example.com", registered_at: "2024-07-23" },
        { id: 5, name: "Vikram Singh", category: "Under 16", phone: "+91 9876543214", email: "vikram@example.com", registered_at: "2024-07-24" }
      ]
    },
    {
      id: 2,
      name: "Summer Chess Festival",
      description: "Fun summer tournament for all ages",
      start_date: "2024-09-01",
      end_date: "2024-09-03",
      max_participants: 75,
      current_participants: 23,
      entry_fee: 400,
      status: "upcoming",
      tournament_types: ["Under 12", "Under 16", "Open"],
      venue: "Community Center",
      registrations: [
        { id: 6, name: "Amit Verma", category: "Under 12", phone: "+91 9876543215", email: "amit@example.com", registered_at: "2024-07-25" },
        { id: 7, name: "Kavya Reddy", category: "Open", phone: "+91 9876543216", email: "kavya@example.com", registered_at: "2024-07-26" }
      ]
    }
  ];

  useEffect(() => {
    setTournaments(mockTournaments);
  }, []);

  const handleEditTournament = (tournament) => {
    setEditingTournament(tournament);
    setNewTournament({
      name: tournament.name,
      description: tournament.description,
      start_date: tournament.start_date,
      end_date: tournament.end_date,
      registration_deadline: tournament.registration_deadline || tournament.start_date,
      max_participants: tournament.max_participants,
      entry_fee: tournament.entry_fee,
      tournament_types: tournament.tournament_types,
      venue: tournament.venue || "",
      rules: tournament.rules || "",
      prizes: tournament.prizes || "",
      status: tournament.status
    });
    setShowCreateForm(true);
  };

  const handleDeleteTournament = (id) => {
    if (confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) {
      setTournaments(prev => prev.filter(t => t.id !== id));
      setMessage('Tournament deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleViewRegistrations = (tournament) => {
    setShowRegistrations(tournament);
  };

  const cancelEdit = () => {
    setShowCreateForm(false);
    setEditingTournament(null);
    setNewTournament({
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      registration_deadline: "",
      max_participants: 50,
      entry_fee: 500,
      tournament_types: [],
      venue: "",
      rules: "",
      prizes: "",
      status: "upcoming"
    });
  };

  const handleInputChange = (field, value) => {
    setNewTournament(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTournamentTypeToggle = (type) => {
    setNewTournament(prev => ({
      ...prev,
      tournament_types: prev.tournament_types.includes(type)
        ? prev.tournament_types.filter(t => t !== type)
        : [...prev.tournament_types, type]
    }));
  };

  const handleCreateTournament = async () => {
    if (!newTournament.name || !newTournament.start_date || !newTournament.end_date) {
      setMessage("Please fill in required fields (Name, Start Date, End Date)");
      return;
    }

    setSaving(true);
    try {
      if (editingTournament) {
        // Update existing tournament
        const updatedTournaments = tournaments.map(t =>
          t.id === editingTournament.id
            ? { ...t, ...newTournament, updated_at: new Date().toISOString() }
            : t
        );
        setTournaments(updatedTournaments);
        setMessage("Tournament updated successfully!");
        setEditingTournament(null);
      } else {
        // Create new tournament
        const tournamentToAdd = {
          id: Date.now(),
          ...newTournament,
          current_participants: 0,
          registrations: [],
          created_at: new Date().toISOString()
        };
        setTournaments(prev => [...prev, tournamentToAdd]);
        setMessage("Tournament created successfully!");
      }

      setNewTournament({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        registration_deadline: "",
        max_participants: 50,
        entry_fee: 500,
        tournament_types: [],
        venue: "",
        rules: "",
        prizes: "",
        status: "upcoming"
      });
      setShowCreateForm(false);

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error('Error saving tournament:', error);
      setMessage("Error saving tournament");
    } finally {
      setSaving(false);
    }
  };

  const availableTournamentTypes = ["Under 8", "Under 10", "Under 12", "Under 16", "Open"];

  // Show registrations modal
  if (showRegistrations) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tournament Registrations</h1>
            <p className="text-gray-600">{showRegistrations.name}</p>
          </div>
          <button
            onClick={() => setShowRegistrations(null)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            ← Back to Tournaments
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Registered Participants ({showRegistrations.registrations?.length || 0})
            </h3>
          </div>

          {showRegistrations.registrations?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {showRegistrations.registrations.map((registration) => (
                    <tr key={registration.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {registration.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {registration.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {registration.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {registration.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {registration.registered_at}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No registrations yet</h3>
              <p className="text-gray-500">Participants will appear here once they register</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tournament Management</h1>
          <p className="text-gray-600">Create and manage chess tournaments</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
        >
          {showCreateForm ? '✕ Cancel' : '+ New Tournament'}
        </button>
      </div>
      {/* Success/Error Message */}
      {message && (
        <div className={`rounded-xl p-4 ${
          message.includes('Error') || message.includes('error')
            ? 'bg-red-100 text-red-800 border border-red-200'
            : 'bg-green-100 text-green-800 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      {/* Create/Edit Tournament Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {editingTournament ? '✏️ Edit Tournament' : '🆕 Create New Tournament'}
          </h2>
              
              <div className="space-y-4">
                {/* Tournament Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tournament Name *
                  </label>
                  <input
                    type="text"
                    value={newTournament.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0]"
                    placeholder="e.g., ThinQ Chess Championship 2024"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTournament.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0]"
                    rows="3"
                    placeholder="Tournament description..."
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={newTournament.start_date}
                      onChange={(e) => handleInputChange('start_date', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={newTournament.end_date}
                      onChange={(e) => handleInputChange('end_date', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0]"
                    />
                  </div>
                </div>

                {/* Registration Deadline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Deadline
                  </label>
                  <input
                    type="date"
                    value={newTournament.registration_deadline}
                    onChange={(e) => handleInputChange('registration_deadline', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0]"
                  />
                </div>

                {/* Max Participants & Entry Fee */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Participants
                    </label>
                    <input
                      type="number"
                      value={newTournament.max_participants}
                      onChange={(e) => handleInputChange('max_participants', parseInt(e.target.value) || 0)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0]"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entry Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={newTournament.entry_fee}
                      onChange={(e) => handleInputChange('entry_fee', parseInt(e.target.value) || 0)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0]"
                      min="0"
                    />
                  </div>
                </div>

                {/* Tournament Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tournament Categories
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTournamentTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleTournamentTypeToggle(type)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          newTournament.tournament_types.includes(type)
                            ? 'bg-[#2B3AA0] text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Venue */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={newTournament.venue}
                    onChange={(e) => handleInputChange('venue', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0]"
                    placeholder="Tournament venue"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCreateTournament}
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {saving ? (editingTournament ? 'Updating...' : 'Creating...') : (editingTournament ? 'Update Tournament' : 'Create Tournament')}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Existing Tournaments */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">📋 Existing Tournaments ({tournaments.length})</h2>
              
          <div className="space-y-6">
            {tournaments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-8xl mb-4">🏆</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No tournaments yet</h3>
                <p className="text-gray-500 mb-6">Create your first tournament to get started</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                >
                  Create First Tournament
                </button>
              </div>
            ) : (
              tournaments.map((tournament) => (
                <div key={tournament.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{tournament.name}</h3>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      tournament.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : tournament.status === 'upcoming'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {tournament.status}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4">{tournament.description}</p>
                    
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</span>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</span>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {tournament.current_participants} / {tournament.max_participants}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Entry Fee</span>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        ₹{tournament.entry_fee}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Categories</span>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {tournament.tournament_types.join(', ')}
                      </p>
                    </div>
                  </div>
                    
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleEditTournament(tournament)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-sm font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTournament(tournament.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleViewRegistrations(tournament)}
                        className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-sm font-medium transition-colors"
                      >
                        View Registrations
                      </button>
                    </div>
                  </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
};

export default CreateTournament;
