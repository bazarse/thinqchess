"use client";
import React, { useState, useEffect } from 'react';
import TournamentCountdown from './TournamentCountdown';

const TournamentRegistrationHandler = ({ children }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTournamentStatus();
    
    // Refresh status every 30 seconds for real-time updates
    const interval = setInterval(fetchTournamentStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchTournamentStatus = async () => {
    try {
      const response = await fetch('/api/admin/tournament-status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
        setError(null);
      } else {
        setError('Failed to fetch tournament status');
      }
    } catch (err) {
      console.error('Error fetching tournament status:', err);
      setError('Unable to check registration status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B3AA0] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tournament information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
            <h3 className="text-lg font-bold mb-2">⚠️ Error</h3>
            <p>{error}</p>
            <button 
              onClick={fetchTournamentStatus}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pass registration status to children
  try {
    return React.cloneElement(children, {
      registrationClosed: !status?.isRegistrationOpen,
      statusMessage: status?.statusMessage || "Registration is currently closed.",
      countdownTarget: status?.countdownTarget || null,
      mode: status?.mode || "manual"
    });
  } catch (error) {
    console.error("Error cloning element:", error);
    return children; // Fallback to original children
  }
};

export default TournamentRegistrationHandler;
