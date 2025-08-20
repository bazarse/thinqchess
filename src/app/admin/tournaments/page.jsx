"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const TournamentManagement = () => {
  // Mock user - moved outside to prevent re-creation
  const authLoading = false;
  const router = useRouter();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTournament, setEditingTournament] = useState(null);
  const [showRegistrations, setShowRegistrations] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [newTournament, setNewTournament] = useState({
    name: '',
    tournament_date: '',
    registration_start_date: '',
    registration_end_date: '',
    flyer_image: '',
    default_fee: '500',
    is_active: false,
    categories: []
  });

  const [newCategory, setNewCategory] = useState({
    name: '',
    fee: '',
    min_age: '',
    max_age: '',
    slots: ''
  });

  useEffect(() => {
    fetchTournaments();

    // NOTE: Auto-refresh disabled to prevent scroll jump while editing/creating
    // If you want to re-enable periodic refresh, uncomment below and ensure scroll position is preserved.
    // const interval = setInterval(fetchTournaments, 30000);
    // return () => clearInterval(interval);
  }, []);

  const updateTournamentStatus = async () => {
    try {
      await fetch('/api/admin/update-tournament-status', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error updating tournament status:', error);
    }
  };

  const fetchTournaments = async () => {
    try {
      setLoading(true);

      // First update tournament status to move expired tournaments to past
      await updateTournamentStatus();

      const response = await fetch('/api/admin/tournaments');
      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data); // Debug log
        setTournaments(data.tournaments || []);
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        setMessage(`Error loading tournaments: ${errorData.error || 'Unknown error'}`);
        setTournaments([]);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      setMessage('Error loading tournaments');
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = newTournament.flyer_image;

      // Upload image if a new file is selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.url;
        } else {
          setMessage('Error uploading image');
          return;
        }
      }

      // Add default open category if no categories are added
      let categories = newTournament.categories;
      if (categories.length === 0) {
        categories = [{
          id: 'open',
          name: 'Open Category',
          fee: '500',
          min_age: '',
          max_age: '',
          slots: '50'
        }];
      }

      const tournamentData = {
        ...newTournament,
        flyer_image: imageUrl,
        start_date: newTournament.tournament_date,
        end_date: newTournament.tournament_date,
        fee: newTournament.default_fee,
        categories: JSON.stringify(categories)
      };

      const url = editingTournament ? '/api/admin/tournaments' : '/api/admin/tournaments';
      const method = editingTournament ? 'PUT' : 'POST';
      const payload = editingTournament ? { ...tournamentData, id: editingTournament.id } : tournamentData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        if (editingTournament) {
          setMessage('Tournament updated successfully!');
        } else {
          setMessage('Tournament created successfully!');
        }

        resetForm();
        // Refresh tournaments list to ensure sync
        await fetchTournaments();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Failed to save tournament');
      }
    } catch (error) {
      console.error('Error saving tournament:', error);
      setMessage('Error saving tournament');
    }
  };

  const resetForm = () => {
    setNewTournament({
      name: '',
      tournament_date: '',
      registration_start_date: '',
      registration_end_date: '',
      flyer_image: '',
      default_fee: '500',
      is_active: false,
      categories: []
    });
    setNewCategory({
      name: '',
      fee: '',
      min_age: '',
      max_age: '',
      slots: ''
    });
    setImageFile(null);
    setImagePreview('');
    setShowCreateForm(false);
    setEditingTournament(null);
  };

  const editTournament = (tournament) => {
    setNewTournament({
      name: tournament.name,
      tournament_date: tournament.start_date || '',
      registration_start_date: tournament.registration_start_date || '',
      registration_end_date: tournament.registration_end_date || '',
      flyer_image: tournament.flyer_image || '',
      default_fee: tournament.default_fee || '500',
      is_active: tournament.is_active === 1,
      categories: tournament.categories ? JSON.parse(tournament.categories) : []
    });
    setEditingTournament(tournament);
    setShowCreateForm(true);
  };

  const addCategory = () => {
    if (!newCategory.name.trim()) {
      setMessage('Please enter category name');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    if (!newCategory.fee || newCategory.fee <= 0) {
      setMessage('Please enter valid fee amount');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    if (!newCategory.slots || newCategory.slots <= 0) {
      setMessage('Please enter valid number of slots');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Age validation - only if both min and max age are provided
    if (newCategory.min_age && newCategory.max_age) {
      const minAge = parseInt(newCategory.min_age);
      const maxAge = parseInt(newCategory.max_age);

      if (minAge >= maxAge) {
        setMessage('Maximum age must be greater than minimum age');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
    }

    // Check if category name already exists
    const existingCategory = newTournament.categories.find(cat =>
      cat.name.toLowerCase() === newCategory.name.toLowerCase()
    );
    if (existingCategory) {
      setMessage('Category with this name already exists');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // Create category with proper age handling
    const categoryToAdd = {
      ...newCategory,
      id: Date.now(),
      min_age: newCategory.min_age || '', // Keep empty string if not provided
      max_age: newCategory.max_age || ''  // Keep empty string if not provided
    };

    setNewTournament(prev => ({
      ...prev,
      categories: [...prev.categories, categoryToAdd]
    }));

    setNewCategory({
      name: '',
      fee: '',
      min_age: '',
      max_age: '',
      slots: ''
    });

    setMessage(`Category "${newCategory.name}" added successfully!`);
    setTimeout(() => setMessage(''), 3000);
  };

  const removeCategory = (categoryId) => {
    setNewTournament(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat.id !== categoryId)
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setNewTournament(prev => ({ ...prev, flyer_image: '' }));
  };

  const viewRegistrations = async (tournamentId) => {
    try {
      const response = await fetch(`/api/admin/registrations?tournament_id=${tournamentId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRegistrations(data.registrations);
          setShowRegistrations(tournamentId);
        } else {
          setMessage('Error fetching registrations');
          setRegistrations([]);
        }
      } else {
        setMessage('Error fetching registrations');
        setRegistrations([]);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setMessage('Error fetching registrations');
      setRegistrations([]);
    }
  };

  const downloadRegistrationsCSV = () => {
    if (registrations.length === 0) {
      alert('No registrations to download');
      return;
    }

    const headers = [
      'Name', 'Email', 'Phone', 'DOB', 'Gender', 'Category',
      'Country', 'State', 'City', 'Amount Paid', 'Payment Status', 'Registration Date'
    ];

    const csvContent = [
      headers.join(','),
      ...registrations.map(reg => [
        `"${reg.participant_first_name} ${reg.participant_last_name}"`,
        `"${reg.email}"`,
        `"${reg.phone}"`,
        `"${reg.dob || ''}"`,
        `"${reg.gender || ''}"`,
        `"${reg.category_name || reg.tournament_type || ''}"`,
        `"${reg.country || ''}"`,
        `"${reg.state || ''}"`,
        `"${reg.city || ''}"`,
        `"${reg.amount_paid || 0}"`,
        `"${reg.payment_status || ''}"`,
        `"${reg.registered_at || reg.created_at || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tournament_registrations_${showRegistrations}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleActive = async (id) => {
    const tournament = tournaments.find(t => t.id === id);
    if (!tournament) return;

    // If activating a tournament, check if there are other active tournaments
    if (!tournament.is_active) {
      const activeTournaments = tournaments.filter(t => t.is_active && t.id !== id);
      if (activeTournaments.length > 0) {
        const confirmMessage = `Activating this tournament will deactivate the following active tournament(s):\n\n${activeTournaments.map(t => `• ${t.name}`).join('\n')}\n\nDo you want to continue?`;
        if (!window.confirm(confirmMessage)) {
          return;
        }
      }
    }

    try {
      console.log('🔄 Toggling tournament:', {
        id: tournament.id,
        name: tournament.name,
        current_is_active: tournament.is_active,
        new_is_active: tournament.is_active ? 0 : 1
      });

      const requestBody = {
        status: tournament.status || 'upcoming',
        is_active: tournament.is_active ? 0 : 1  // Fixed: toggle logic was inverted
      };

      console.log('📤 Sending request to:', `/api/admin/tournaments/${tournament.id}`);
      console.log('📤 Request body:', requestBody);

      const response = await fetch(`/api/admin/tournaments/${tournament.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status);
      const data = await response.json();
      console.log('📥 Response data:', data);

      if (data.success) {
        // Refresh tournaments to get updated active states
        fetchTournaments();
        setMessage(`Tournament ${tournament.is_active ? 'deactivated' : 'activated'} successfully!`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Error updating tournament status');
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error toggling tournament status:', error);
      setMessage('Error updating tournament status');
      setTimeout(() => setMessage(''), 5000);
    }
  };



  const deleteTournament = async (id) => {
    if (confirm('Are you sure you want to delete this tournament? This will also delete all related registrations.')) {
      try {
        console.log('Deleting tournament with ID:', id);
        const response = await fetch(`/api/admin/tournaments?id=${id}`, {
          method: 'DELETE',
        });

        console.log('Delete response status:', response.status);
        const data = await response.json();
        console.log('Delete response data:', data);

        if (data.success) {
          // Refresh tournaments list instead of filtering locally
          await fetchTournaments();
          setMessage('Tournament deleted successfully!');
          setTimeout(() => setMessage(''), 3000);
        } else {
          setMessage(data.error || 'Failed to delete tournament');
          setTimeout(() => setMessage(''), 5000);
        }
      } catch (error) {
        console.error('Error deleting tournament:', error);
        setMessage('Error deleting tournament: ' + error.message);
        setTimeout(() => setMessage(''), 5000);
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading tournaments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tournament Management</h1>
          <p className="text-gray-600">Create and manage tournaments</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            New Tournament
          </button>
          <button
            onClick={() => window.location.href = '/admin/past-tournaments'}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Past Tournaments
          </button>
        </div>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('Error') || message.includes('Failed') 
            ? 'bg-red-100 text-red-700 border border-red-200' 
            : 'bg-green-100 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingTournament ? 'Edit Tournament' : 'Tournament'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tournament Name *</label>
                <input
                  type="text"
                  value={newTournament.name}
                  onChange={(e) => setNewTournament({...newTournament, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tournament Date {!editingTournament && '*'}
                </label>
                <input
                  type="date"
                  value={newTournament.tournament_date}
                  onChange={(e) => setNewTournament({...newTournament, tournament_date: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={!editingTournament}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Start Date *</label>
                <input
                  type="date"
                  value={newTournament.registration_start_date}
                  onChange={(e) => setNewTournament({...newTournament, registration_start_date: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration End Date *</label>
                <input
                  type="date"
                  value={newTournament.registration_end_date}
                  onChange={(e) => setNewTournament({...newTournament, registration_end_date: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Tournament Fee (₹) *</label>
                <input
                  type="number"
                  value={newTournament.default_fee}
                  onChange={(e) => setNewTournament({...newTournament, default_fee: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="500"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tournament Flyer Image</label>

              {/* Image Preview */}
              {(imagePreview || newTournament.flyer_image) && (
                <div className="mb-3">
                  <img
                    src={imagePreview || newTournament.flyer_image}
                    alt="Tournament flyer preview"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="mt-2 text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove Image
                  </button>
                </div>
              )}

              {/* File Upload */}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload an image file (JPG, PNG, etc.) - Max 5MB
              </p>
            </div>

            {/* Tournament Categories Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tournament Categories</h3>
              <p className="text-sm text-gray-600 mb-4">
                Add categories for your tournament. If no categories are added, a default "Open Category" will be created.
                <br />
                <strong>Age Guidelines:</strong> Under 8, Under 10, Under 12, Under 16, Open (no age limit)
              </p>

              {/* Add New Category Form */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-gray-900 mb-3">Add New Category</h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Category Name *</label>
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCategory();
                        }
                      }}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="e.g., Under 12"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Fee (₹) *</label>
                    <input
                      type="number"
                      value={newCategory.fee}
                      onChange={(e) => setNewCategory({...newCategory, fee: e.target.value})}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCategory();
                        }
                      }}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Min Age (Optional)</label>
                    <input
                      type="number"
                      value={newCategory.min_age}
                      onChange={(e) => setNewCategory({...newCategory, min_age: e.target.value})}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCategory();
                        }
                      }}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="8 (leave empty for no limit)"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Max Age (Optional)</label>
                    <input
                      type="number"
                      value={newCategory.max_age}
                      onChange={(e) => setNewCategory({...newCategory, max_age: e.target.value})}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCategory();
                        }
                      }}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="12 (leave empty for no limit)"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Slots *</label>
                    <input
                      type="number"
                      value={newCategory.slots}
                      onChange={(e) => setNewCategory({...newCategory, slots: e.target.value})}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCategory();
                        }
                      }}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="50"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addCategory}
                  className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Add Category
                </button>
              </div>

              {/* Existing Categories */}
              {newTournament.categories.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Added Categories:</h4>
                  {newTournament.categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                      <div className="flex-1 grid grid-cols-5 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-blue-900">{category.name}</span>
                        </div>
                        <div>
                          <span className="text-blue-700">₹{category.fee}</span>
                        </div>
                        <div>
                          <span className="text-blue-700">{category.min_age || 'No min'}</span>
                        </div>
                        <div>
                          <span className="text-blue-700">{category.max_age || 'No max'}</span>
                        </div>
                        <div>
                          <span className="text-blue-700">{category.slots} slots</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCategory(category.id)}
                        className="ml-3 text-red-600 hover:text-red-800 font-medium text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={newTournament.is_active}
                onChange={(e) => setNewTournament({...newTournament, is_active: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Set as Active Tournament (This will deactivate all other tournaments)
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {editingTournament ? 'Update Tournament' : 'Save'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tournaments List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Tournaments</h2>
        </div>
        
        {tournaments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-gray-500">No tournaments created yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tournament</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(tournaments) && tournaments.map((tournament) => (
                  <tr key={tournament.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tournament.name}</div>
                        <div className="text-sm text-gray-500">
                          Registration: {tournament.registration_start_date} to {tournament.registration_end_date}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(() => {
                        try {
                          const categories = tournament.categories ? JSON.parse(tournament.categories) : [];
                          if (categories.length === 0) return 'Open Category';
                          if (categories.length === 1) return categories[0].name;
                          return `${categories.length} Categories`;
                        } catch (e) {
                          return 'Open Category';
                        }
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(() => {
                        try {
                          const categories = tournament.categories ? JSON.parse(tournament.categories) : [];
                          if (categories.length === 0) return '₹500';
                          if (categories.length === 1) return `₹${categories[0].fee}`;
                          const fees = categories.map(cat => cat.fee).filter((fee, index, arr) => arr.indexOf(fee) === index);
                          return fees.length === 1 ? `₹${fees[0]}` : `₹${Math.min(...fees.map(f => parseInt(f)))}-${Math.max(...fees.map(f => parseInt(f)))}`;
                        } catch (e) {
                          return '₹500';
                        }
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        tournament.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {tournament.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => editTournament(tournament)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleActive(tournament.id)}
                        className={`${
                          tournament.is_active 
                            ? 'text-yellow-600 hover:text-yellow-900' 
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {tournament.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => router.push(`/admin/tournaments/${tournament.id}/registrations`)}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        View Registrations
                      </button>

                      <button
                        onClick={() => deleteTournament(tournament.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tournament Registrations Modal */}
      {showRegistrations && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Tournament Registrations</h2>
              <div className="flex gap-2">
                <button
                  onClick={downloadRegistrationsCSV}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  Download CSV
                </button>
                <button
                  onClick={() => setShowRegistrations(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>

            {registrations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 border-b text-left">Name</th>
                      <th className="px-4 py-2 border-b text-left">Email</th>
                      <th className="px-4 py-2 border-b text-left">Phone</th>
                      <th className="px-4 py-2 border-b text-left">Category</th>
                      <th className="px-4 py-2 border-b text-left">Amount</th>
                      <th className="px-4 py-2 border-b text-left">Status</th>
                      <th className="px-4 py-2 border-b text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b">
                          {reg.participant_first_name} {reg.participant_last_name}
                        </td>
                        <td className="px-4 py-2 border-b">{reg.email}</td>
                        <td className="px-4 py-2 border-b">{reg.phone}</td>
                        <td className="px-4 py-2 border-b">{reg.category_name || reg.tournament_type}</td>
                        <td className="px-4 py-2 border-b">₹{reg.amount_paid}</td>
                        <td className="px-4 py-2 border-b">
                          <span className={`px-2 py-1 rounded text-xs ${
                            reg.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {reg.payment_status}
                          </span>
                        </td>
                        <td className="px-4 py-2 border-b">
                          {reg.registered_at ? new Date(reg.registered_at).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No registrations found for this tournament.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentManagement;
