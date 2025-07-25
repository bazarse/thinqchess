"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalRegistrations: 247,
    activeTournaments: 3,
    totalRevenue: 125000,
    pendingApprovals: 12,
    monthlyGrowth: 15.5,
    blogPosts: 8,
    galleryImages: 45,
    discountCodes: 5
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: "registration", message: "New tournament registration from John Doe", time: "2 minutes ago", icon: "👥" },
    { id: 2, type: "blog", message: "New blog post published: Chess Strategies", time: "1 hour ago", icon: "📝" },
    { id: 3, type: "tournament", message: "Tournament 'Spring Championship' created", time: "3 hours ago", icon: "🏆" },
    { id: 4, type: "gallery", message: "5 new images added to gallery", time: "5 hours ago", icon: "🖼️" },
  ]);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#2B3AA0] to-[#1e2a70] rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to Admin Dashboard</h1>
            <p className="text-blue-100">Manage your ThinQ Chess academy efficiently</p>
          </div>
          <div className="text-6xl opacity-20">👑</div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Card 1 */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-blue-600 text-xl">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Registrations</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-gray-900">{stats.totalRegistrations}</p>
                <span className="ml-2 text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">+12%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <span className="text-yellow-600 text-xl">🏆</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Tournaments</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-gray-900">{stats.activeTournaments}</p>
                <span className="ml-2 text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">Ongoing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-green-600 text-xl">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
                <span className="ml-2 text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">+8%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-red-600 text-xl">⏰</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
                <span className="ml-2 text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">Urgent</span>
              </div>
            </div>
          </div>
        </div>
          </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
            <button className="text-sm text-[#2B3AA0] hover:text-[#1e2a70]">View All</button>
          </div>

          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start p-3 rounded-lg hover:bg-gray-50">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                  activity.type === 'registration' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'blog' ? 'bg-yellow-100 text-yellow-600' :
                  activity.type === 'tournament' ? 'bg-green-100 text-green-600' :
                  'bg-indigo-100 text-indigo-600'
                }`}>
                  <span className="text-lg">{activity.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/admin/create-tournament"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-[#2B3AA0] transition-all hover:shadow-md"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                <span className="text-green-600 text-xl">🏆</span>
              </div>
              <h3 className="font-medium text-gray-900 text-center">Create Tournament</h3>
            </Link>

            <Link
              href="/admin/registrations"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-[#2B3AA0] transition-all hover:shadow-md"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                <span className="text-blue-600 text-xl">👥</span>
              </div>
              <h3 className="font-medium text-gray-900 text-center">View Registrations</h3>
            </Link>

            <Link
              href="/admin/discount-codes"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-[#2B3AA0] transition-all hover:shadow-md"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                <span className="text-purple-600 text-xl">🎫</span>
              </div>
              <h3 className="font-medium text-gray-900 text-center">Discount Codes</h3>
            </Link>

            <Link
              href="/admin/gallery"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-[#2B3AA0] transition-all hover:shadow-md"
            >
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-3">
                <span className="text-indigo-600 text-xl">🖼️</span>
              </div>
              <h3 className="font-medium text-gray-900 text-center">Gallery Management</h3>
            </Link>

            <Link
              href="/admin/blog"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-[#2B3AA0] transition-all hover:shadow-md"
            >
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-3">
                <span className="text-yellow-600 text-xl">📝</span>
              </div>
              <h3 className="font-medium text-gray-900 text-center">Blog Management</h3>
            </Link>

            <Link
              href="/admin/analytics"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-[#2B3AA0] transition-all hover:shadow-md"
            >
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-3">
                <span className="text-red-600 text-xl">📈</span>
              </div>
              <h3 className="font-medium text-gray-900 text-center">Analytics</h3>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
