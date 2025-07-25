"use client";
import React, { useState, useEffect } from 'react';

const TournamentCountdown = ({ targetDate, message = "Registration opens in:" }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!targetDate) return;

    const calculateTimeLeft = () => {
      const target = new Date(targetDate);
      const now = new Date();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!targetDate) {
    return null;
  }

  if (isExpired) {
    return (
      <div className="text-center py-8">
        <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg">
          <h3 className="text-xl font-bold mb-2">🎉 Registration is Now Open!</h3>
          <p>You can now register for the tournament.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <div className="bg-gradient-to-r from-[#2B3AA0] to-[#FFB31A] p-8 rounded-lg text-white">
        <h3 className="text-2xl font-bold mb-4">⏰ {message}</h3>
        
        <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-3xl font-bold">{timeLeft.days}</div>
            <div className="text-sm opacity-90">Days</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-3xl font-bold">{timeLeft.hours}</div>
            <div className="text-sm opacity-90">Hours</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-3xl font-bold">{timeLeft.minutes}</div>
            <div className="text-sm opacity-90">Minutes</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-3xl font-bold">{timeLeft.seconds}</div>
            <div className="text-sm opacity-90">Seconds</div>
          </div>
        </div>

        <div className="mt-6 text-lg opacity-90">
          Registration opens on {new Date(targetDate).toLocaleDateString()} at {new Date(targetDate).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default TournamentCountdown;
