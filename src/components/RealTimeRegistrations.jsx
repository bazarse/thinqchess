"use client";
import React, { useState, useEffect } from 'react';

const RealTimeRegistrations = ({ onCountUpdate }) => {
  const [registrations, setRegistrations] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if development mode
    if (process.env.NEXT_PUBLIC_DEVELOPMENT_MODE === 'true') {
      // Mock data for development
      const mockCount = 25;
      setCount(mockCount);
      setLoading(false);

      if (onCountUpdate) {
        onCountUpdate(mockCount);
      }

      // Mock registrations
      const mockRegistrations = [
        {
          id: '1',
          participant_first_name: 'John',
          participant_last_name: 'Doe',
          email: 'john@example.com',
          amount_paid: 500,
          registered_at: { toDate: () => new Date() }
        },
        {
          id: '2',
          participant_first_name: 'Jane',
          participant_last_name: 'Smith',
          email: 'jane@example.com',
          amount_paid: 450,
          registered_at: { toDate: () => new Date() }
        }
      ];
      setRegistrations(mockRegistrations);
      return;
    }

    // Firebase real-time listener (production mode)
    const initializeFirebaseListener = async () => {
      try {
        // Dynamic import to avoid loading Firebase in development
        const { onRegistrationsChange, getRegistrationCount } = await import('../../lib/firestore');

        const unsubscribe = onRegistrationsChange((newRegistrations) => {
          setRegistrations(newRegistrations);
          setCount(newRegistrations.length);
          setLoading(false);

          // Notify parent component of count update
          if (onCountUpdate) {
            onCountUpdate(newRegistrations.length);
          }
        });

        // Initial count fetch
        getRegistrationCount()
          .then(initialCount => {
            setCount(initialCount);
            if (onCountUpdate) {
              onCountUpdate(initialCount);
            }
          })
          .catch(error => {
            console.error('Error fetching initial count:', error);
            // Fallback to mock data
            setCount(0);
            setLoading(false);
          });

        return unsubscribe;
      } catch (error) {
        console.error('Firebase connection error:', error);
        // Fallback to mock data
        setCount(0);
        setLoading(false);
        return null;
      }
    };

    let unsubscribe = null;
    initializeFirebaseListener().then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [onCountUpdate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading registrations...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Live Registrations
        </h3>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
          <span className="text-sm text-gray-600">Live</span>
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-3xl font-bold text-blue-600 mb-2">
          {count}
        </div>
        <p className="text-gray-600">Total Registrations</p>
      </div>

      {registrations.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-700 mb-3">
            Recent Registrations
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {registrations.slice(0, 5).map((registration) => (
              <div 
                key={registration.id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {registration.participant_first_name} {registration.participant_last_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {registration.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">
                    ₹{registration.amount_paid}
                  </p>
                  <p className="text-xs text-gray-500">
                    {registration.registered_at?.toDate?.()?.toLocaleDateString() || 'Just now'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeRegistrations;
