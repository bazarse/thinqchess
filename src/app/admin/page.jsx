"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // Check if already logged in
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('Checking auth status...');
      console.log('Document cookies:', document.cookie);

      // Get token from localStorage as backup
      const token = localStorage.getItem('admin-token');
      console.log('localStorage token:', token ? 'present' : 'missing');

      const headers = {
        'credentials': 'include'
      };

      // Add Authorization header if token exists in localStorage
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/admin/verify', {
        credentials: 'include',
        headers: headers
      });
      console.log('Verify response status:', response.status);
      if (response.ok) {
        console.log('Already authenticated, redirecting to dashboard');
        setIsLoggedIn(true);
        router.push('/admin/dashboard');
      } else {
        console.log('Not authenticated, staying on login page');
      }
    } catch (error) {
      console.log('Authentication check failed:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful, response:', data);
        console.log('Document cookies after login:', document.cookie);

        // Store token in localStorage as backup
        if (data.token) {
          localStorage.setItem('admin-token', data.token);
          console.log('✅ Token stored in localStorage');
        }

        setIsLoggedIn(true);

        // Force immediate redirect without waiting
        window.location.href = '/admin/dashboard';
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B3AA0] mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9ff] via-[#e8ecff] to-[#d4d9f7] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-20 w-20 bg-[#2B3AA0] rounded-full flex items-center justify-center mb-6">
            <span className="text-3xl text-white">👑</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-[#2B3AA0]">
            ThinQ Chess Admin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access the admin dashboard
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="email"
                name="email"
                type="text"
                required
                value={credentials.email}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0] focus:border-[#2B3AA0] focus:z-10 sm:text-sm"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={credentials.password}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0] focus:border-[#2B3AA0] focus:z-10 sm:text-sm"
                placeholder="Enter password"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#2B3AA0] hover:bg-[#1e2a70] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2B3AA0]'
              } transition-colors duration-200`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                'Sign in to Dashboard'
              )}
            </button>
          </div>


        </form>

        <div className="text-center">
          <a
            href="/"
            className="text-sm text-[#2B3AA0] hover:text-[#FFB31A] transition-colors"
          >
            ← Back to Website
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
