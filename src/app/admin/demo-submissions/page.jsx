"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const DemoSubmissionsPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchDemoRequests();
    }
  }, [user, filter, searchTerm, dateFilter, customDateFrom, customDateTo, currentPage]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/verify');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
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

  const fetchDemoRequests = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        status: filter,
        search: searchTerm,
        date_filter: dateFilter,
        date_from: customDateFrom,
        date_to: customDateTo,
        page: currentPage.toString(),
        limit: '50'
      });

      const response = await fetch(`/api/demo-request?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch demo requests');
      }

      const data = await response.json();

      if (data.success) {
        setRequests(data.requests);
        setPagination(data.pagination);
        setMessage('');
      } else {
        throw new Error(data.error || 'Failed to fetch demo requests');
      }
    } catch (error) {
      console.error('Error fetching demo requests:', error);
      setMessage('Error loading demo requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (requestId, currentStatus) => {
    try {
      setUpdating(true);
      const newStatus = currentStatus ? 0 : 1;

      const response = await fetch('/api/demo-request', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: requestId,
          demo_completed: newStatus,
          status: newStatus ? 'completed' : 'pending'
        }),
      });

      if (response.ok) {
        setMessage('Demo status updated successfully');
        fetchDemoRequests(); // Refresh the list
        
        // Update selected request if it's open in modal
        if (selectedRequest && selectedRequest.id === requestId) {
          setSelectedRequest({
            ...selectedRequest,
            demo_completed: newStatus,
            status: newStatus ? 'completed' : 'pending'
          });
        }
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setMessage('Error updating demo status');
    } finally {
      setUpdating(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDateFilterChange = (newDateFilter) => {
    setDateFilter(newDateFilter);
    setCurrentPage(1);

    // Reset custom dates when switching to preset filters
    if (newDateFilter !== 'custom') {
      setCustomDateFrom('');
      setCustomDateTo('');
    }
  };

  const handleCustomDateChange = () => {
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilter('all');
    setSearchTerm('');
    setDateFilter('all');
    setCustomDateFrom('');
    setCustomDateTo('');
    setCurrentPage(1);
  };

  const getDateFilterDisplay = () => {
    switch (dateFilter) {
      case 'today':
        return 'Today';
      case 'yesterday':
        return 'Yesterday';
      case 'last_7_days':
        return 'Last 7 Days';
      case 'last_30_days':
        return 'Last 30 Days';
      case 'this_month':
        return 'This Month';
      case 'last_month':
        return 'Last Month';
      case 'custom':
        if (customDateFrom && customDateTo) {
          return `${new Date(customDateFrom).toLocaleDateString('en-GB')} - ${new Date(customDateTo).toLocaleDateString('en-GB')}`;
        } else if (customDateFrom) {
          return `From ${new Date(customDateFrom).toLocaleDateString('en-GB')}`;
        } else if (customDateTo) {
          return `Until ${new Date(customDateTo).toLocaleDateString('en-GB')}`;
        }
        return 'Custom Range';
      default:
        return 'All Time';
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);

      const params = new URLSearchParams({
        status: filter,
        search: searchTerm,
        date_filter: dateFilter,
        date_from: customDateFrom,
        date_to: customDateTo,
        format: 'csv'
      });

      const response = await fetch(`/api/admin/demo-requests/export?${params}`);

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      // Get the CSV content
      const csvContent = await response.text();

      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Generate filename with current filters
      const timestamp = new Date().toISOString().split('T')[0];
      let filename = `demo-requests-${timestamp}`;
      if (filter !== 'all') filename += `-${filter}`;
      if (dateFilter !== 'all') filename += `-${dateFilter}`;
      filename += '.csv';

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setMessage('Demo requests exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      setMessage('Error exporting demo requests');
    } finally {
      setExporting(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDeleteRequest = async () => {
    if (!requestToDelete) return;

    try {
      setDeleting(true);

      const response = await fetch(`/api/demo-request/${requestToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete demo request');
      }

      const data = await response.json();

      if (data.success) {
        setMessage('Demo request deleted successfully');
        setShowDeleteModal(false);
        setRequestToDelete(null);
        // Refresh the list
        fetchDemoRequests();
      } else {
        throw new Error(data.error || 'Failed to delete demo request');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage('Error deleting demo request');
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = (request) => {
    setRequestToDelete(request);
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setRequestToDelete(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B3AA0]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Demo Submissions</h1>
          <p className="text-gray-600 mt-2">Manage all book-a-demo requests</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* First Row - Status and Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-4 flex-wrap">
                <select
                  value={filter}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0]"
                >
                  <option value="all">All Requests</option>
                  <option value="pending">Pending Demos</option>
                  <option value="completed">Completed Demos</option>
                </select>

                <input
                  type="text"
                  placeholder="Search by parent name, email, or child name..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="flex-1 min-w-[300px] p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0]"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Total: {pagination.total} requests
                  {(filter !== 'all' || searchTerm || dateFilter !== 'all') && (
                    <span className="ml-2 text-blue-600">
                      (Filtered: {getDateFilterDisplay()})
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  {(filter !== 'all' || searchTerm || dateFilter !== 'all') && (
                    <button
                      onClick={clearAllFilters}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      Clear Filters
                    </button>
                  )}

                  <button
                    onClick={handleExport}
                    disabled={exporting || requests.length === 0}
                    className="bg-[#2B3AA0] hover:bg-[#1e2875] text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {exporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        Export CSV
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Second Row - Date Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex gap-4 flex-wrap items-center">
                <label className="text-sm font-medium text-gray-700">Filter by Date:</label>

                <select
                  value={dateFilter}
                  onChange={(e) => handleDateFilterChange(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0]"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last_7_days">Last 7 Days</option>
                  <option value="last_30_days">Last 30 Days</option>
                  <option value="this_month">This Month</option>
                  <option value="last_month">Last Month</option>
                  <option value="custom">Custom Range</option>
                </select>

                {dateFilter === 'custom' && (
                  <div className="flex gap-2 items-center">
                    <input
                      type="date"
                      value={customDateFrom}
                      onChange={(e) => {
                        setCustomDateFrom(e.target.value);
                        handleCustomDateChange();
                      }}
                      className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0]"
                      placeholder="From"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="date"
                      value={customDateTo}
                      onChange={(e) => {
                        setCustomDateTo(e.target.value);
                        handleCustomDateChange();
                      }}
                      className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0]"
                      placeholder="To"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Demo Requests Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              {filter === 'all' ? 'All Demo Requests' :
               filter === 'completed' ? 'Completed Demos' : 'Pending Demos'}
              ({pagination.total})
            </h2>

            {loading && (
              <div className="flex items-center text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2B3AA0] mr-2"></div>
                Loading...
              </div>
            )}
          </div>
          
          {requests.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No demo requests found</h3>
              <p className="text-gray-600">Demo requests will appear here once users submit the book-a-demo form</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parent & Child
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
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
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Parent: {request.parent_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Child: {request.child_name} ({request.age} years)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{request.email}</div>
                        <div className="text-gray-500">{request.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{request.state}, {request.country}</div>
                        <div className="text-gray-500">
                          Past Training: {request.past_training || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleStatusToggle(request.id, request.demo_completed)}
                            disabled={updating}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#2B3AA0] focus:ring-offset-2 ${
                              request.demo_completed 
                                ? 'bg-green-600' 
                                : 'bg-gray-200'
                            } ${updating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                request.demo_completed ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <span className={`ml-2 text-xs font-semibold ${
                            request.demo_completed 
                              ? 'text-green-800' 
                              : 'text-gray-600'
                          }`}>
                            {request.demo_completed ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.created_at).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowDetailModal(true);
                            }}
                            className="text-[#2B3AA0] hover:text-[#1e2875] px-3 py-1 rounded border border-[#2B3AA0] hover:bg-[#2B3AA0] hover:text-white transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => confirmDelete(request)}
                            className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-600 hover:bg-red-600 hover:text-white transition-colors"
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
                  disabled={pagination.page === 1}
                  className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed border-gray-300 hover:bg-gray-50"
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
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed border-gray-300 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mt-4 p-4 rounded-lg ${
            message.includes('Error') || message.includes('error')
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
          }`}>
            {message}
          </div>
        )}

        {/* Demo Request Detail Modal */}
        {showDetailModal && selectedRequest && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-3xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Demo Request Details - {selectedRequest.parent_name}
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Parent Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Parent Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedRequest.parent_name}</div>
                    <div><span className="font-medium">Email:</span> {selectedRequest.email}</div>
                    <div><span className="font-medium">Phone:</span> {selectedRequest.phone}</div>
                    <div><span className="font-medium">State:</span> {selectedRequest.state || 'N/A'}</div>
                    <div><span className="font-medium">Country:</span> {selectedRequest.country || 'N/A'}</div>
                  </div>
                </div>

                {/* Child Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Child Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedRequest.child_name}</div>
                    <div><span className="font-medium">Age:</span> {selectedRequest.age || 'N/A'} years</div>
                    <div><span className="font-medium">Past Training:</span> {selectedRequest.past_training || 'N/A'}</div>
                  </div>
                </div>

                {/* Message */}
                {selectedRequest.message && (
                  <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                    <h4 className="font-semibold text-gray-900 mb-3">Message</h4>
                    <p className="text-sm text-gray-700">{selectedRequest.message}</p>
                  </div>
                )}

                {/* Status & Dates */}
                <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                  <h4 className="font-semibold text-gray-900 mb-3">Request Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Status:</span>
                      <div className="flex items-center mt-1">
                        <button
                          onClick={() => handleStatusToggle(selectedRequest.id, selectedRequest.demo_completed)}
                          disabled={updating}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#2B3AA0] focus:ring-offset-2 ${
                            selectedRequest.demo_completed
                              ? 'bg-green-600'
                              : 'bg-gray-200'
                          } ${updating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              selectedRequest.demo_completed ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className={`ml-2 text-xs font-semibold ${
                          selectedRequest.demo_completed
                            ? 'text-green-800'
                            : 'text-gray-600'
                        }`}>
                          {selectedRequest.demo_completed ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Submitted:</span>
                      <div>{new Date(selectedRequest.created_at).toLocaleString('en-GB')}</div>
                    </div>
                    <div>
                      <span className="font-medium">Last Updated:</span>
                      <div>{new Date(selectedRequest.updated_at).toLocaleString('en-GB')}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && requestToDelete && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Delete Demo Request</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete the demo request from <strong>{requestToDelete.parent_name}</strong> for <strong>{requestToDelete.child_name}</strong>?
                  </p>
                  <p className="text-sm text-red-600 mt-2">
                    This action cannot be undone.
                  </p>
                </div>
                <div className="items-center px-4 py-3">
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={cancelDelete}
                      disabled={deleting}
                      className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteRequest}
                      disabled={deleting}
                      className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50 flex items-center gap-2"
                    >
                      {deleting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Deleting...
                        </>
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoSubmissionsPage;
