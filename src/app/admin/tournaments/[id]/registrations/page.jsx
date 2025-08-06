"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

const TournamentRegistrations = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const [tournament, setTournament] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [stats, setStats] = useState({ total_registrations: 0, completed_payments: 0, pending_payments: 0, total_revenue: 0 });
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const params = useParams();
  const tournamentId = params.id;

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && tournamentId) {
      fetchTournament();
      fetchRegistrations();
    }
  }, [user, tournamentId, searchTerm, currentPage]);

  const checkAuth = async () => {
    try {
      // Bypass authentication for now - set mock user
      setUser({ email: 'admin@test.com', role: 'admin', id: 1 });
      setLoading(false);
    } catch (error) {
      console.error('Auth check failed:', error);
      setLoading(false);
    }
  };

  const fetchTournament = async () => {
    try {
      const response = await fetch(`/api/admin/tournaments/${tournamentId}`);
      if (response.ok) {
        const data = await response.json();
        setTournament(data.tournament);
      }
    } catch (error) {
      console.error('Error fetching tournament:', error);
    }
  };

  const fetchRegistrations = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        tournament_id: tournamentId,
        search: searchTerm,
        page: currentPage.toString(),
        limit: '50'
      });

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

  const downloadRegistrationsCSV = () => {
    if (registrations.length === 0) {
      alert('No registrations to download');
      return;
    }

    const headers = [
      'Name', 'Email', 'Phone', 'DOB', 'Age', 'Gender', 'FIDE ID', 'Category', 'Country', 'State', 'City',
      'Address', 'Registration Date'
    ];

    const csvContent = [
      headers.join(','),
      ...registrations.map(reg => [
        `"${reg.participant_first_name} ${reg.participant_middle_name || ''} ${reg.participant_last_name}".trim()`,
        `"${reg.email}"`,
        `"${reg.phone}"`,
        `"${reg.dob ? new Date(reg.dob).toLocaleDateString('en-GB') : ''}"`,
        `"${reg.age || ''}"`,
        `"${reg.gender || ''}"`,
        `"${reg.fide_id || ''}"`,
        `"${reg.category_name || reg.tournament_type || ''}"`,
        `"${reg.country || ''}"`,
        `"${reg.state || ''}"`,
        `"${reg.city || ''}"`,
        `"${reg.address || ''}"`,
        `"${new Date(reg.registered_at).toLocaleDateString('en-GB')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tournament_${tournamentId}_registrations.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#2B3AA0]"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push('/admin/tournaments')}
                className="text-[#2B3AA0] hover:text-[#1e2a70] mb-4 flex items-center gap-2"
              >
                ← Back to Tournaments
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Tournament Registrations
              </h1>
              {tournament && (
                <p className="text-gray-600 mt-2">
                  {tournament.name} {(tournament.start_date || tournament.tournament_date) && `- ${new Date(tournament.start_date || tournament.tournament_date).toLocaleDateString('en-GB')}`}
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <button
                onClick={downloadRegistrationsCSV}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Download CSV
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-[#2B3AA0]">{stats.total_registrations || 0}</div>
            <div className="text-gray-600">Total Registrations</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">₹{stats.total_revenue || 0}</div>
            <div className="text-gray-600">Total Revenue</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0]"
              />
            </div>
          </div>
        </div>

        {/* Registrations Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              Registrations ({pagination.total})
            </h2>
          </div>

          {message && (
            <div className="px-6 py-4 bg-red-50 border-b border-red-200">
              <p className="text-red-600">{message}</p>
            </div>
          )}

          {registrations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age/DOB</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {registrations.map((reg, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {reg.participant_first_name} {reg.participant_middle_name} {reg.participant_last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {reg.gender} {reg.fide_id && `• FIDE: ${reg.fide_id}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{reg.email}</div>
                        <div className="text-gray-500">{reg.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reg.age && <div>{reg.age} years</div>}
                        {reg.dob && (
                          <div className="text-gray-500 text-xs">
                            DOB: {new Date(reg.dob).toLocaleDateString('en-GB')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reg.category_name || reg.tournament_type || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{reg.city}, {reg.state}</div>
                        <div className="text-gray-500 text-xs">{reg.country}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>₹{reg.amount_paid}</div>
                        {reg.discount_code && (
                          <div className="text-xs text-green-600">
                            -{reg.discount_code} (₹{reg.discount_amount})
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          reg.payment_status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {reg.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(reg.registered_at).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedRegistration(reg);
                              setShowDetailModal(true);
                            }}
                            className="text-[#2B3AA0] hover:text-[#1e2875]"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => deleteRegistration(reg.id)}
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
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No registrations found for this tournament.</p>
            </div>
          )}
        </div>

        {/* Registration Detail Modal */}
        {showDetailModal && selectedRegistration && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white print:shadow-none print:border-none print:max-w-none print:w-full print:top-0 print:relative print:p-0">
              <div className="flex justify-between items-center mb-4 print:block">
                <h3 className="text-lg font-bold text-gray-900 print:text-center print:text-2xl print:mb-6">
                  Tournament Registration Details - {selectedRegistration.participant_first_name} {selectedRegistration.participant_last_name}
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
                {/* Participant Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Participant Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Full Name:</span> {selectedRegistration.participant_first_name} {selectedRegistration.participant_middle_name} {selectedRegistration.participant_last_name}</div>
                    <div><span className="font-medium">Email:</span> {selectedRegistration.email}</div>
                    <div><span className="font-medium">Phone:</span> {selectedRegistration.phone}</div>
                    <div><span className="font-medium">Date of Birth:</span> {selectedRegistration.dob ? new Date(selectedRegistration.dob).toLocaleDateString('en-GB') : 'N/A'}</div>
                    <div><span className="font-medium">Age:</span> {selectedRegistration.age || 'N/A'}</div>
                    <div><span className="font-medium">Gender:</span> {selectedRegistration.gender || 'N/A'}</div>
                    {selectedRegistration.fide_id && <div><span className="font-medium">FIDE ID:</span> {selectedRegistration.fide_id}</div>}
                  </div>
                </div>

                {/* Tournament Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Tournament Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Tournament:</span> {tournament?.name || 'N/A'}</div>
                    <div><span className="font-medium">Category:</span> {selectedRegistration.category_name || selectedRegistration.tournament_type || 'N/A'}</div>
                    <div><span className="font-medium">Tournament Date:</span> {(tournament?.start_date || tournament?.tournament_date) ? new Date(tournament.start_date || tournament.tournament_date).toLocaleDateString('en-GB') : 'N/A'}</div>
                    <div><span className="font-medium">Venue:</span> {tournament?.venue || 'N/A'}</div>
                  </div>
                </div>

                {/* Location Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Location Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Country:</span> {selectedRegistration.country || 'N/A'}</div>
                    <div><span className="font-medium">State:</span> {selectedRegistration.state || 'N/A'}</div>
                    <div><span className="font-medium">City:</span> {selectedRegistration.city || 'N/A'}</div>
                    {selectedRegistration.address && <div><span className="font-medium">Address:</span> {selectedRegistration.address}</div>}
                  </div>
                </div>



                {/* Registration Details */}
                <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                  <h4 className="font-semibold text-gray-900 mb-3">Registration Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Registration Date:</span> {new Date(selectedRegistration.registered_at).toLocaleString('en-GB')}</div>
                    <div><span className="font-medium">Registration ID:</span> {selectedRegistration.id}</div>
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
                      // Generate PDF using browser's print to PDF functionality
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
                            <h1>Tournament Registration Details</h1>
                            <h2>${tournament?.name || 'Tournament'}</h2>
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
                            ${selectedRegistration.fide_id ? `
                            <div class="detail-row">
                              <span class="detail-label">FIDE ID:</span>
                              <span class="detail-value">${selectedRegistration.fide_id}</span>
                            </div>
                            ` : ''}
                          </div>

                          <div class="section">
                            <h3>Tournament Information</h3>
                            <div class="detail-row">
                              <span class="detail-label">Tournament:</span>
                              <span class="detail-value">${tournament?.name || 'N/A'}</span>
                            </div>
                            <div class="detail-row">
                              <span class="detail-label">Category:</span>
                              <span class="detail-value">${selectedRegistration.category_name || selectedRegistration.tournament_type || 'N/A'}</span>
                            </div>
                            <div class="detail-row">
                              <span class="detail-label">Tournament Date:</span>
                              <span class="detail-value">${(tournament?.start_date || tournament?.tournament_date) ? new Date(tournament.start_date || tournament.tournament_date).toLocaleDateString('en-GB') : 'N/A'}</span>
                            </div>
                            <div class="detail-row">
                              <span class="detail-label">Venue:</span>
                              <span class="detail-value">${tournament?.venue || 'N/A'}</span>
                            </div>
                          </div>

                          <div class="section">
                            <h3>Location Information</h3>
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
                            ${selectedRegistration.address ? `
                            <div class="detail-row">
                              <span class="detail-label">Address:</span>
                              <span class="detail-value">${selectedRegistration.address}</span>
                            </div>
                            ` : ''}
                          </div>



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
    </div>
  );
};

export default TournamentRegistrations;
