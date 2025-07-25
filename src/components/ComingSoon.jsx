"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const ComingSoon = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Countdown timer (set target date here)
  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30); // 30 days from now

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail("");
      // Here you can add API call to save email
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9ff] via-[#e8ecff] to-[#d4d9f7] relative overflow-hidden">
      {/* Background Chess Pieces */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 text-8xl">♔</div>
        <div className="absolute top-20 right-20 text-6xl">♕</div>
        <div className="absolute bottom-20 left-20 text-7xl">♖</div>
        <div className="absolute bottom-10 right-10 text-5xl">♘</div>
        <div className="absolute top-1/2 left-1/4 text-4xl">♗</div>
        <div className="absolute top-1/3 right-1/3 text-6xl">♙</div>
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 mt-8"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-[#2B3AA0] mb-6">
            🏆 Coming Soon
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Get ready for the <span className="text-[#FFB31A] font-bold">biggest chess tournament</span> of the year!
            We're preparing something extraordinary for our chess community.
          </p>
        </motion.div>

        {/* Countdown Timer */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-[#2B3AA0] mb-8">
            ⏰ Tournament Registration Opens In:
          </h2>
          
          <div className="flex justify-center gap-4 md:gap-8">
            {Object.entries(timeLeft).map(([unit, value]) => (
              <div key={unit} className="bg-white rounded-xl shadow-lg p-4 md:p-6 border-2 border-[#FFB31A]">
                <div className="text-3xl md:text-5xl font-bold text-[#2B3AA0]">
                  {value.toString().padStart(2, '0')}
                </div>
                <div className="text-sm md:text-base text-gray-600 capitalize font-medium">
                  {unit}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tournament Highlights */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid md:grid-cols-2 gap-8 mb-16"
        >
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-[#2B3AA0]">
            <h3 className="text-2xl font-bold text-[#2B3AA0] mb-6 flex items-center">
              🎯 Tournament Highlights
            </h3>
            <ul className="space-y-3">
              {[
                "Age-wise categories (Under 8, 10, 12, 16, Open)",
                "FIDE-rated tournament games",
                "Cash prizes and trophies for winners",
                "Professional arbiters and equipment",
                "Live streaming and commentary",
                "Certificates for all participants"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-[#FFB31A] mt-1">✓</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-[#FFB31A]">
            <h3 className="text-2xl font-bold text-[#2B3AA0] mb-6 flex items-center">
              📚 Prepare While You Wait
            </h3>
            <ul className="space-y-3">
              {[
                "Practice tactical combinations daily",
                "Study endgame patterns",
                "Analyze grandmaster games",
                "Join our regular coaching sessions",
                "Solve chess puzzles",
                "Book a demo class with our experts"
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-[#2B3AA0] mt-1">🎯</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Email Subscription */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-gradient-to-r from-[#2B3AA0] to-[#4b57a3] rounded-xl shadow-lg p-8 text-center text-white mb-12"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            🔔 Be the First to Know!
          </h3>
          <p className="text-lg mb-6 opacity-90">
            Get notified the moment tournament registration opens
          </p>
          
          {!isSubscribed ? (
            <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 px-4 py-3 rounded-lg text-white white-placeholder focus:outline-none focus:ring-2 focus:ring-[#FFB31A] bg-transparent border border-white/30"
              />
              <button
                type="submit"
                className="bg-[#FFB31A] hover:bg-[#e6a117] px-6 py-3 rounded-lg font-bold text-white transition-colors duration-300"
              >
                Notify Me
              </button>
            </form>
          ) : (
            <div className="text-[#FFB31A] text-lg font-bold">
              ✅ Thank you! We'll notify you when registration opens.
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col md:flex-row gap-4 justify-center items-center mb-12"
        >
          <a
            href="/book-a-demo"
            className="bg-[#FFB31A] hover:bg-[#e6a117] text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Book a Demo Class
          </a>
          <a
            href="/curriculam"
            className="bg-[#2B3AA0] hover:bg-[#1e2a70] text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
          >
            View Curriculum
          </a>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center"
        >
          <h4 className="text-xl font-bold text-[#2B3AA0] mb-4">
            Questions? We're Here to Help!
          </h4>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center text-gray-700">
            <a href="tel:+917975820187" className="flex items-center gap-2 hover:text-[#2B3AA0] transition-colors">
              Phone: +91 7975820187
            </a>
            <a href="mailto:admin@thinqchess.com" className="flex items-center gap-2 hover:text-[#2B3AA0] transition-colors">
              Email: admin@thinqchess.com
            </a>
          </div>

          <div className="flex justify-center gap-6 mt-6">
            <a href="#" className="text-[#2B3AA0] hover:text-[#FFB31A] transition-colors font-medium">Facebook</a>
            <a href="#" className="text-[#2B3AA0] hover:text-[#FFB31A] transition-colors font-medium">Instagram</a>
            <a href="#" className="text-[#2B3AA0] hover:text-[#FFB31A] transition-colors font-medium">WhatsApp</a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ComingSoon;
