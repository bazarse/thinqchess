"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const PastTournaments = () => {
  const [pastTournaments, setPastTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [exporting, setExporting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchPastTournaments();
  }, []);

  const fetchPastTournaments = async () => {
    try {
      const response = await fetch('/api/admin/past-tournaments');
      if (response.ok) {
        const data = await response.json();
        setPastTournaments(data.tournaments || []);
      } else {
        setMessage('Error loading past tournaments');
      }
    } catch (error) {
      console.error('Error fetching past tournaments:', error);
      setMessage('Error loading past tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRegistrations = (tournament) => {
    setSelectedTournament(tournament);
    setShowRegistrations(true);
  };

  const handleExportRegistrations = async (tournamentId, tournamentName) => {
    setExporting(true);
    try {
      const response = await fetch(`/api/admin/export-tournament-registrations?tournamentId=${tournamentId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tournamentName.replace(/\s+/g, '_')}_registrations.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setMessage('Registrations exported successfully!');
      } else {
        setMessage('Error exporting registrations');
      }
    } catch (error) {
      console.error('Error exporting:', error);
      setMessage('Error exporting registrations');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading past tournaments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Past Tournaments</h1>
        <p className="text-gray-600">View completed tournaments and their registrations</p>
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

      {/* Past Tournaments List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">📋 Completed Tournaments ({pastTournaments.length})</h2>
        
        {pastTournaments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-8xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No past tournaments</h3>
            <p className="text-gray-500">Completed tournaments will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pastTournaments.map((tournament) => (
              <div key={tournament.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{tournament.name}</h3>
                    <p className="text-gray-600 text-sm">{tournament.description}</p>
                  </div>
                  <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Completed
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</span>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {new Date(tournament.start_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</span>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {new Date(tournament.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</span>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {tournament.total_registrations || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</span>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      ₹{tournament.total_revenue || 0}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewRegistrations(tournament)}
                    className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    👥 View Registrations ({tournament.total_registrations || 0})
                  </button>
                  <button
                    onClick={() => handleExportRegistrations(tournament.id, tournament.name)}
                    disabled={exporting}
                    className="px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    📊 {exporting ? 'Exporting...' : 'Export Excel'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Registration Details Modal */}
      {showRegistrations && selectedTournament && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Registrations for {selectedTournament.name}
              </h3>
              <button
                onClick={() => setShowRegistrations(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {selectedTournament.registrations?.map((reg, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-xs font-medium text-gray-500">Name</span>
                      <p className="text-sm font-semibold">{reg.participant_name}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">Email</span>
                      <p className="text-sm">{reg.email}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">Phone</span>
                      <p className="text-sm">{reg.phone}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">Amount</span>
                      <p className="text-sm font-semibold">₹{reg.amount_paid}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PastTournaments;
