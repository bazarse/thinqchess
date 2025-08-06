"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


const RegistrationsView = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const [filter, setFilter] = useState('course');
  const [ageFilter, setAgeFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [stats, setStats] = useState({ total_registrations: 0 });
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const router = useRouter();

  // Registrations will be loaded from Supabase

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchRegistrations();
    }
  }, [user, filter, ageFilter, searchTerm, currentPage]);

  // Auto-refresh every 30 seconds for realtime updates
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        fetchRegistrations();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user, filter, searchTerm, currentPage]);

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
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        filter: filter,
        age_filter: ageFilter,
        search: searchTerm,
        page: currentPage.toString(),
        limit: '50'
      });

      // Fetch registrations from SQLite API
      const response = await fetch(`/api/admin/registrations?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch registrations');
      }

      const data = await response.json();

      if (data.success) {
        setRegistrations(data.registrations);
        setPagination(data.pagination);
        setStats(data.stats);
        setMessage('');
      } else {
        throw new Error(data.error || 'Failed to fetch registrations');
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setMessage('Error loading registrations');
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format = 'csv') => {
    try {
      setExporting(true);

      const params = new URLSearchParams({
        format: format,
        filter: filter,
        age_filter: ageFilter,
        search: searchTerm
      });

      const response = await fetch(`/api/admin/registrations/export?${params}`);

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get filename from response headers
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `registrations_${new Date().toISOString().split('T')[0]}.${format}`;

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage(`Export completed successfully! Downloaded ${filename}`);
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Export error:', error);
      setMessage('Export failed. Please try again.');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setExporting(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const deleteRegistration = async (registrationId) => {
    if (window.confirm('Are you sure you want to delete this registration? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/admin/registrations/${registrationId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Refresh registrations list
          fetchRegistrations();
          setShowDetailModal(false);
          alert('Registration deleted successfully');
        } else {
          alert('Error deleting registration');
        }
      } catch (error) {
        console.error('Error deleting registration:', error);
        alert('Error deleting registration');
      }
    }
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Registrations</h1>
        <p className="text-gray-600">Manage tournament and course registrations</p>
      </div>
        {/* Filters and Export */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 flex-1">
              <select
                value={filter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0]"
              >
                <option value="all">All Registrations</option>
                <option value="tournament">Tournament Only</option>
                <option value="course">Course Only</option>
              </select>

              <select
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0]"
              >
                <option value="all">All Ages</option>
                <option value="child">Child (≤ 18 yrs)</option>
                <option value="adult">Adult (19-65 yrs)</option>
                <option value="senior">Sr Citizen (&gt; 65 yrs)</option>
              </select>

              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={handleSearch}
                className="flex-1 max-w-md p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0]"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleExport('csv')}
                disabled={exporting}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  exporting
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-[#2B3AA0] hover:bg-[#1e2a70] text-white'
                }`}
              >
                {exporting ? "Exporting..." : "📊 CSV"}
              </button>

              <button
                onClick={() => handleExport('json')}
                disabled={exporting}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  exporting
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {exporting ? "Exporting..." : "📄 JSON"}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Registrations</h3>
            <p className="text-2xl font-bold text-[#2B3AA0]">{stats.total_registrations}</p>
          </div>
        </div>

        {/* Registrations Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              {filter === 'all' ? 'All Registrations' :
               filter === 'tournament' ? 'Tournament Registrations' : 'Course Registrations'}
              ({pagination.total})
            </h2>

            {loading && (
              <div className="flex items-center text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2B3AA0] mr-2"></div>
                Loading...
              </div>
            )}
          </div>
          
          {registrations.length === 0 ? (
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
                      Age/DOB
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {registrations.map((registration) => (
                    <tr key={registration.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {registration.participant_name || `${registration.participant_first_name} ${registration.participant_last_name}`}
                        </div>
                        {registration.participant_middle_name && (
                          <div className="text-xs text-gray-500">
                            Middle: {registration.participant_middle_name}
                          </div>
                        )}
                        {registration.gender && (
                          <div className="text-xs text-gray-500">
                            {registration.gender}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          registration.type === 'tournament'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {registration.type}
                        </span>
                        {registration.course_type && (
                          <div className="text-xs text-gray-500 mt-1">
                            {registration.course_type}
                          </div>
                        )}
                        {registration.tournament_type && (
                          <div className="text-xs text-gray-500 mt-1">
                            {registration.tournament_type}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{registration.email}</div>
                        <div className="text-gray-500">{registration.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {registration.age && (
                          <div>{registration.age} years</div>
                        )}
                        {registration.dob && (
                          <div className="text-gray-500 text-xs">
                            DOB: {new Date(registration.dob).toLocaleDateString('en-GB')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{registration.city}, {registration.state}</div>
                        <div className="text-gray-500 text-xs">{registration.country}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(registration.registered_at).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedRegistration(registration);
                              setShowDetailModal(true);
                            }}
                            className="text-[#2B3AA0] hover:text-[#1e2875]"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => deleteRegistration(registration.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 text-sm border rounded-md ${
                        page === pagination.page
                          ? 'bg-[#2B3AA0] text-white border-[#2B3AA0]'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
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

        {/* Registration Detail Modal */}
        {showDetailModal && selectedRegistration && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white print:shadow-none print:border-none print:max-w-none print:w-full print:top-0 print:relative print:p-0">
              <div className="flex justify-between items-center mb-4 print:block">
                <h3 className="text-lg font-bold text-gray-900 print:text-center print:text-2xl print:mb-6">
                  Registration Details - {selectedRegistration.participant_first_name} {selectedRegistration.participant_last_name}
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 print:hidden"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-1 print:gap-4">
                {/* Basic Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Full Name:</span> {selectedRegistration.participant_first_name} {selectedRegistration.participant_middle_name} {selectedRegistration.participant_last_name}</div>
                    <div><span className="font-medium">Email:</span> {selectedRegistration.email}</div>
                    <div><span className="font-medium">Phone:</span> {selectedRegistration.phone}</div>
                    <div><span className="font-medium">Date of Birth:</span> {selectedRegistration.dob ? new Date(selectedRegistration.dob).toLocaleDateString('en-GB') : 'N/A'}</div>
                    <div><span className="font-medium">Age:</span> {selectedRegistration.age || 'N/A'}</div>
                    <div><span className="font-medium">Gender:</span> {selectedRegistration.gender || 'N/A'}</div>
                    <div><span className="font-medium">Type:</span> {selectedRegistration.type}</div>
                    {selectedRegistration.course_type && <div><span className="font-medium">Course Type:</span> {selectedRegistration.course_type}</div>}
                    {selectedRegistration.tournament_type && <div><span className="font-medium">Tournament Type:</span> {selectedRegistration.tournament_type}</div>}
                    {selectedRegistration.fide_id && <div><span className="font-medium">FIDE ID:</span> {selectedRegistration.fide_id}</div>}
                  </div>
                </div>

                {/* Parent Information (for Course registrations) */}
                {selectedRegistration.type === 'course' && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Parent Information</h4>
                    <div className="space-y-3 text-sm">
                      {(selectedRegistration.father_first_name || selectedRegistration.father_email) && (
                        <div>
                          <div className="font-medium text-blue-600">Father Details:</div>
                          <div>Name: {selectedRegistration.father_first_name} {selectedRegistration.father_middle_name} {selectedRegistration.father_last_name}</div>
                          <div>Email: {selectedRegistration.father_email || 'N/A'}</div>
                          <div>Phone: {selectedRegistration.father_phone || 'N/A'}</div>
                        </div>
                      )}
                      {(selectedRegistration.mother_first_name || selectedRegistration.mother_email) && (
                        <div>
                          <div className="font-medium text-pink-600">Mother Details:</div>
                          <div>Name: {selectedRegistration.mother_first_name} {selectedRegistration.mother_middle_name} {selectedRegistration.mother_last_name}</div>
                          <div>Email: {selectedRegistration.mother_email || 'N/A'}</div>
                          <div>Phone: {selectedRegistration.mother_phone || 'N/A'}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Address Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Address Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Country:</span> {selectedRegistration.country || 'N/A'}</div>
                    <div><span className="font-medium">State:</span> {selectedRegistration.state || 'N/A'}</div>
                    <div><span className="font-medium">City:</span> {selectedRegistration.city || 'N/A'}</div>
                    {selectedRegistration.address_line1 && <div><span className="font-medium">Address Line 1:</span> {selectedRegistration.address_line1}</div>}
                    {selectedRegistration.address_line2 && <div><span className="font-medium">Address Line 2:</span> {selectedRegistration.address_line2}</div>}
                    {selectedRegistration.address && <div><span className="font-medium">Address:</span> {selectedRegistration.address}</div>}
                    {selectedRegistration.pincode && <div><span className="font-medium">Pincode:</span> {selectedRegistration.pincode}</div>}
                  </div>
                </div>

                {/* Coaching Preferences (for Course registrations) */}
                {selectedRegistration.type === 'course' && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Coaching Preferences</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Mode:</span> {selectedRegistration.coaching_mode || 'N/A'}</div>
                      {selectedRegistration.coaching_city && <div><span className="font-medium">Coaching City:</span> {selectedRegistration.coaching_city}</div>}
                      {selectedRegistration.preferred_centre && <div><span className="font-medium">Preferred Centre:</span> {selectedRegistration.preferred_centre}</div>}
                    </div>
                  </div>
                )}

                {/* Reference Information */}
                {selectedRegistration.heard_from && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Reference Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Heard From:</span> {selectedRegistration.heard_from}</div>
                      {selectedRegistration.referral_first_name && (
                        <div><span className="font-medium">Referral Name:</span> {selectedRegistration.referral_first_name} {selectedRegistration.referral_last_name}</div>
                      )}
                      {selectedRegistration.other_source && <div><span className="font-medium">Other Source:</span> {selectedRegistration.other_source}</div>}
                    </div>
                  </div>
                )}

                {/* Registration Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Registration Details</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Registration Date:</span> {new Date(selectedRegistration.registered_at).toLocaleString('en-GB')}</div>
                    <div><span className="font-medium">Payment Status:</span> {selectedRegistration.payment_status}</div>
                    <div><span className="font-medium">Amount Paid:</span> ₹{selectedRegistration.amount_paid || 0}</div>
                    {selectedRegistration.payment_id && <div><span className="font-medium">Payment ID:</span> {selectedRegistration.payment_id}</div>}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between print:hidden">
                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                    </svg>
                    Print
                  </button>
                  <button
                    onClick={() => {
                      // Create a new window with only the registration details for PDF
                      const printWindow = window.open('', '_blank');
                      const registrationHTML = `
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <title>Registration Details - ${selectedRegistration.participant_first_name} ${selectedRegistration.participant_last_name}</title>
                          <style>
                            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }
                            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2B3AA0; padding-bottom: 20px; }
                            .section { margin-bottom: 20px; page-break-inside: avoid; }
                            .section h3 { background-color: #f3f4f6; padding: 10px; margin: 0 0 10px 0; border-left: 4px solid #2B3AA0; font-size: 16px; }
                            .detail-row { display: flex; margin-bottom: 8px; align-items: flex-start; }
                            .detail-label { font-weight: bold; min-width: 150px; margin-right: 10px; }
                            .detail-value { flex: 1; word-wrap: break-word; }
                            .status-completed { background-color: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; display: inline-block; }
                            .status-pending { background-color: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; display: inline-block; }
                            @media print {
                              body { margin: 0; font-size: 12px; }
                              .section { page-break-inside: avoid; }
                              .header { page-break-after: avoid; }
                            }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <h1>${selectedRegistration.type === 'tournament' ? 'Tournament' : 'Course'} Registration Details</h1>
                            <p>Registration ID: ${selectedRegistration.id}</p>
                          </div>

                          <div class="section">
                            <h3>Participant Information</h3>
                            <div class="detail-row">
                              <span class="detail-label">Full Name:</span>
                              <span class="detail-value">${selectedRegistration.participant_first_name} ${selectedRegistration.participant_middle_name || ''} ${selectedRegistration.participant_last_name}</span>
                            </div>
                            <div class="detail-row">
                              <span class="detail-label">Email:</span>
                              <span class="detail-value">${selectedRegistration.email}</span>
                            </div>
                            <div class="detail-row">
                              <span class="detail-label">Phone:</span>
                              <span class="detail-value">${selectedRegistration.phone}</span>
                            </div>
                            <div class="detail-row">
                              <span class="detail-label">Date of Birth:</span>
                              <span class="detail-value">${selectedRegistration.dob ? new Date(selectedRegistration.dob).toLocaleDateString('en-GB') : 'N/A'}</span>
                            </div>
                            <div class="detail-row">
                              <span class="detail-label">Age:</span>
                              <span class="detail-value">${selectedRegistration.age || 'N/A'}</span>
                            </div>
                            <div class="detail-row">
                              <span class="detail-label">Gender:</span>
                              <span class="detail-value">${selectedRegistration.gender || 'N/A'}</span>
                            </div>
                            <div class="detail-row">
                              <span class="detail-label">Type:</span>
                              <span class="detail-value">${selectedRegistration.type}</span>
                            </div>
                            ${selectedRegistration.course_type ? `
                            <div class="detail-row">
                              <span class="detail-label">Course Type:</span>
                              <span class="detail-value">${selectedRegistration.course_type}</span>
                            </div>
                            ` : ''}
                            ${selectedRegistration.tournament_type ? `
                            <div class="detail-row">
                              <span class="detail-label">Tournament Type:</span>
                              <span class="detail-value">${selectedRegistration.tournament_type}</span>
                            </div>
                            ` : ''}
                            ${selectedRegistration.fide_id ? `
                            <div class="detail-row">
                              <span class="detail-label">FIDE ID:</span>
                              <span class="detail-value">${selectedRegistration.fide_id}</span>
                            </div>
                            ` : ''}
                          </div>

                          ${selectedRegistration.type === 'course' ? `
                          <div class="section">
                            <h3>Parent Information</h3>
                            ${(selectedRegistration.father_first_name || selectedRegistration.father_email) ? `
                            <h4 style="color: #2563eb; margin: 10px 0;">Father Details:</h4>
                            <div class="detail-row">
                              <span class="detail-label">Name:</span>
                              <span class="detail-value">${selectedRegistration.father_first_name || ''} ${selectedRegistration.father_middle_name || ''} ${selectedRegistration.father_last_name || ''}</span>
                            </div>
                            <div class="detail-row">
                              <span class="detail-label">Email:</span>
                              <span class="detail-value">${selectedRegistration.father_email || 'N/A'}</span>
                            </div>
                            <div class="detail-row">
                              <span class="detail-label">Phone:</span>
                              <span class="detail-value">${selectedRegistration.father_phone || 'N/A'}</span>
                            </div>
                            ` : ''}
                            ${(selectedRegistration.mother_first_name || selectedRegistration.mother_email) ? `
                            <h4 style="color: #ec4899; margin: 10px 0;">Mother Details:</h4>
                            <div class="detail-row">
                              <span class="detail-label">Name:</span>
                              <span class="detail-value">${selectedRegistration.mother_first_name || ''} ${selectedRegistration.mother_middle_name || ''} ${selectedRegistration.mother_last_name || ''}</span>
                            </div>
                            <div class="detail-row">
                              <span class="detail-label">Email:</span>
                              <span class="detail-value">${selectedRegistration.mother_email || 'N/A'}</span>
                            </div>
                            <div class="detail-row">
                              <span class="detail-label">Phone:</span>
                              <span class="detail-value">${selectedRegistration.mother_phone || 'N/A'}</span>
                            </div>
                            ` : ''}
                          </div>
                          ` : ''}

                          <div class="section">
                            <h3>Address Information</h3>
                            <div class="detail-row">
                              <span class="detail-label">Country:</span>
                              <span class="detail-value">${selectedRegistration.country || 'N/A'}</span>
                            </div>
                            <div class="detail-row">
                              <span class="detail-label">State:</span>
                              <span class="detail-value">${selectedRegistration.state || 'N/A'}</span>
                            </div>
                            <div class="detail-row">
                              <span class="detail-label">City:</span>
                              <span class="detail-value">${selectedRegistration.city || 'N/A'}</span>
                            </div>
                            ${selectedRegistration.address_line1 ? `
                            <div class="detail-row">
                              <span class="detail-label">Address Line 1:</span>
                              <span class="detail-value">${selectedRegistration.address_line1}</span>
                            </div>
                            ` : ''}
                            ${selectedRegistration.address_line2 ? `
                            <div class="detail-row">
                              <span class="detail-label">Address Line 2:</span>
                              <span class="detail-value">${selectedRegistration.address_line2}</span>
                            </div>
                            ` : ''}
                            ${selectedRegistration.address ? `
                            <div class="detail-row">
                              <span class="detail-label">Address:</span>
                              <span class="detail-value">${selectedRegistration.address}</span>
                            </div>
                            ` : ''}
                            ${selectedRegistration.pincode ? `
                            <div class="detail-row">
                              <span class="detail-label">Pincode:</span>
                              <span class="detail-value">${selectedRegistration.pincode}</span>
                            </div>
                            ` : ''}
                          </div>

                          ${selectedRegistration.type === 'course' ? `
                          <div class="section">
                            <h3>Coaching Preferences</h3>
                            ${selectedRegistration.coaching_mode ? `
                            <div class="detail-row">
                              <span class="detail-label">Coaching Mode:</span>
                              <span class="detail-value">${selectedRegistration.coaching_mode}</span>
                            </div>
                            ` : ''}
                            ${selectedRegistration.coaching_city ? `
                            <div class="detail-row">
                              <span class="detail-label">Coaching City:</span>
                              <span class="detail-value">${selectedRegistration.coaching_city}</span>
                            </div>
                            ` : ''}
                            ${selectedRegistration.preferred_centre ? `
                            <div class="detail-row">
                              <span class="detail-label">Preferred Centre:</span>
                              <span class="detail-value">${selectedRegistration.preferred_centre}</span>
                            </div>
                            ` : ''}
                            ${selectedRegistration.classes_for ? `
                            <div class="detail-row">
                              <span class="detail-label">Classes For:</span>
                              <span class="detail-value">${selectedRegistration.classes_for}</span>
                            </div>
                            ` : ''}
                          </div>
                          ` : ''}

                          <div class="section">
                            <h3>Registration Details</h3>
                            <div class="detail-row">
                              <span class="detail-label">Registration Date:</span>
                              <span class="detail-value">${new Date(selectedRegistration.registered_at).toLocaleString('en-GB')}</span>
                            </div>
                            <div class="detail-row">
                              <span class="detail-label">Registration ID:</span>
                              <span class="detail-value">${selectedRegistration.id}</span>
                            </div>
                          </div>
                        </body>
                        </html>
                      `;

                      // Create blob and download as PDF
                      const blob = new Blob([registrationHTML], { type: 'text/html' });
                      const url = URL.createObjectURL(blob);

                      // Open in new window for PDF generation
                      const pdfWindow = window.open(url, '_blank');
                      pdfWindow.onload = function() {
                        // Auto-trigger print dialog for PDF save
                        setTimeout(() => {
                          pdfWindow.print();
                        }, 500);
                      };
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Save as PDF
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => deleteRegistration(selectedRegistration.id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Delete Registration
                  </button>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default RegistrationsView;
