"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const RegistrationsView = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  // Mock registration data
  const mockRegistrations = [
    {
      id: 1,
      type: 'tournament',
      participant_name: 'John Doe',
      email: 'john@example.com',
      phone: '+91 9876543210',
      amount_paid: 400,
      discount_code: 'TC10',
      discount_amount: 40,
      payment_status: 'completed',
      registered_at: new Date().toISOString()
    },
    {
      id: 2,
      type: 'course',
      participant_name: 'Sarah Smith',
      email: 'sarah@example.com',
      phone: '+91 9876543211',
      amount_paid: 500,
      discount_code: null,
      discount_amount: 0,
      payment_status: 'completed',
      registered_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 3,
      type: 'tournament',
      participant_name: 'Mike Johnson',
      email: 'mike@example.com',
      phone: '+91 9876543212',
      amount_paid: 320,
      discount_code: 'TC20',
      discount_amount: 80,
      payment_status: 'completed',
      registered_at: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  useEffect(() => {
    checkAuth();
    fetchRegistrations();
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

  const fetchRegistrations = async () => {
    try {
      // In development mode, use mock data
      setRegistrations(mockRegistrations);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    if (filter === 'all') return true;
    return reg.type === filter;
  });

  const handleExport = async () => {
    setExporting(true);
    try {
      // Simulate export process
      setTimeout(() => {
        const csvContent = generateCSV(filteredRegistrations);
        downloadCSV(csvContent, `registrations_${new Date().toISOString().split('T')[0]}.csv`);
        setMessage("Data exported successfully!");
        setTimeout(() => setMessage(""), 3000);
        setExporting(false);
      }, 1000);
    } catch (error) {
      console.error('Error exporting data:', error);
      setMessage("Error exporting data");
      setExporting(false);
    }
  };

  const generateCSV = (data) => {
    const headers = ['ID', 'Type', 'Name', 'Email', 'Phone', 'Amount Paid', 'Discount Code', 'Discount Amount', 'Payment Status', 'Registration Date'];
    const rows = data.map(reg => [
      reg.id,
      reg.type,
      reg.participant_name,
      reg.email,
      reg.phone,
      reg.amount_paid,
      reg.discount_code || '',
      reg.discount_amount,
      reg.payment_status,
      new Date(reg.registered_at).toLocaleDateString()
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <a href="/admin/dashboard" className="text-[#2B3AA0] hover:text-[#FFB31A] mr-4">
                ← Dashboard
              </a>
              <h1 className="text-2xl font-bold text-[#2B3AA0]">Registrations</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Filters and Export */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0]"
              >
                <option value="all">All Registrations</option>
                <option value="tournament">Tournament Only</option>
                <option value="course">Course Only</option>
              </select>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                exporting 
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'bg-[#2B3AA0] hover:bg-[#1e2a70] text-white'
              }`}
            >
              {exporting ? "Exporting..." : "📊 Export to Excel"}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Registrations</h3>
            <p className="text-2xl font-bold text-[#2B3AA0]">{registrations.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Tournament Entries</h3>
            <p className="text-2xl font-bold text-green-600">
              {registrations.filter(r => r.type === 'tournament').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Course Enrollments</h3>
            <p className="text-2xl font-bold text-blue-600">
              {registrations.filter(r => r.type === 'course').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <p className="text-2xl font-bold text-purple-600">
              ₹{registrations.reduce((sum, r) => sum + r.amount_paid, 0)}
            </p>
          </div>
        </div>

        {/* Registrations Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              {filter === 'all' ? 'All Registrations' : 
               filter === 'tournament' ? 'Tournament Registrations' : 'Course Registrations'} 
              ({filteredRegistrations.length})
            </h2>
          </div>
          
          {filteredRegistrations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No registrations found</h3>
              <p className="text-gray-600">Registrations will appear here once users start signing up</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRegistrations.map((registration) => (
                    <tr key={registration.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {registration.participant_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          registration.type === 'tournament' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {registration.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{registration.email}</div>
                        <div className="text-gray-500">{registration.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>₹{registration.amount_paid}</div>
                        {registration.discount_code && (
                          <div className="text-green-600 text-xs">
                            {registration.discount_code} (-₹{registration.discount_amount})
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(registration.registered_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg ${
            message.includes('successfully') 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}
      </main>
    </div>
  );
};

export default RegistrationsView;
