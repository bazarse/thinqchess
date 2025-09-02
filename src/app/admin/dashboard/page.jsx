"use client";
import React, { useState, useEffect } from "react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    totalBlogs: 0,
    publishedBlogs: 0,
    totalGalleryImages: 0,
    totalDiscountCodes: 0,
    activeDiscountCodes: 0,
    totalRevenue: 0,
    pendingDemos: 0,
    registrationsByType: []
  });
  const [pendingDemoRequests, setPendingDemoRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardStats();

    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchDashboardStats, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardStats = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    }

    try {
      const response = await fetch('/api/admin/dashboard-stats');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats || {});
          setPendingDemoRequests(data.pendingDemos || []);
          setLastUpdated(new Date());
        } else {
          console.error('Dashboard API error:', data.error);
          // Set default stats on error
          setStats({
            totalRegistrations: 0,
            totalBlogs: 0,
            publishedBlogs: 0,
            totalGalleryImages: 0,
            totalDiscountCodes: 0,
            activeDiscountCodes: 0,
            totalRevenue: 0,
            pendingDemos: 0,
            registrationsByType: []
          });
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Set default stats on error
      setStats({
        totalRegistrations: 0,
        totalBlogs: 0,
        publishedBlogs: 0,
        totalGalleryImages: 0,
        totalDiscountCodes: 0,
        activeDiscountCodes: 0,
        totalRevenue: 0,
        pendingDemos: 0,
        registrationsByType: []
      });
    } finally {
      setLoading(false);
      if (isManualRefresh) {
        setRefreshing(false);
      }
    }
  };

  const handleManualRefresh = () => {
    fetchDashboardStats(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-md p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to Admin Dashboard</h1>
            <p className="text-blue-100">Manage your ThinQ Chess platform efficiently</p>
            {lastUpdated && (
              <p className="text-blue-200 text-sm mt-2">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              refreshing
                ? 'bg-blue-500 cursor-not-allowed'
                : 'bg-white text-blue-600 hover:bg-blue-50'
            }`}
          >
            {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Registrations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRegistrations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue?.toLocaleString() || 0}</p>
              {stats.completedRevenue !== undefined && (
                <p className="text-xs text-gray-500">Completed: ₹{stats.completedRevenue?.toLocaleString() || 0}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Demos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingDemos}</p>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default AdminDashboard;
