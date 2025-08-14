"use client";
import React, { useState, useEffect } from "react";
import SimpleImageUpload from "../../../components/SimpleImageUpload";


const GalleryManagement = () => {
  const [items, setItems] = useState([]); // Changed from images to items (images + videos)
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'images', 'videos'
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoData, setVideoData] = useState({
    title: '',
    youtube_url: '',
    category: 'uncategorized'
  });




  useEffect(() => {
    loadGalleryItems();
  }, []);

  const loadGalleryItems = async () => {
    try {
      // Load from SQLite database via API
      const response = await fetch('/api/gallery');
      if (response.ok) {
        const galleryItems = await response.json();
        setItems(galleryItems);
      } else {
        throw new Error('Failed to fetch gallery items');
      }
    } catch (error) {
      console.error('Error loading gallery items:', error);
      // Fallback to empty array
      setItems([]);
    }
  };

  const handleImageUpload = async (uploadResult) => {
    try {
      setUploading(true);
      setMessage("");

      // Save to database via API
      const response = await fetch('/api/admin/gallery/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_name: uploadResult.filename || uploadResult.name,
          image_url: uploadResult.url
        }),
      });

      const data = await response.json();

      if (data.success) {
        setItems(prev => [data.image, ...prev]);
        setMessage("Image uploaded successfully!");
      } else {
        setMessage(data.error || "Error saving image data");
      }

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Error saving image data");
      console.error('Save error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleUploadError = (error) => {
    setMessage(`Upload error: ${error}`);
    setTimeout(() => setMessage(""), 5000);
  };

  const handleVideoAdd = async () => {
    if (!videoData.title || !videoData.youtube_url) {
      setMessage("Please fill in all video fields");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      setUploading(true);
      setMessage("");

      // Extract YouTube video ID
      const youtubeId = extractYouTubeId(videoData.youtube_url);
      if (!youtubeId) {
        throw new Error('Invalid YouTube URL');
      }

      // Save to database via API
      const response = await fetch('/api/admin/gallery/video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: videoData.title,
          youtube_url: videoData.youtube_url,
          youtube_id: youtubeId,
          category: videoData.category,
          type: 'video'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add video');
      }

      const data = await response.json();

      if (data.success) {
        setItems(prev => [data.video, ...prev]);
        setMessage("Video added successfully!");
        setShowVideoModal(false);
        setVideoData({ title: '', youtube_url: '', category: 'uncategorized' });
      } else {
        setMessage(data.error || "Error adding video");
      }

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error('Error adding video:', error);
      setMessage("Error adding video. Please check the YouTube URL and try again.");
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setUploading(false);
    }
  };

  const extractYouTubeId = (url) => {
    // Enhanced regex to support YouTube Shorts
    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
      /youtube\.com\/shorts\/([^"&?\/\s]{11})/,
      /youtu\.be\/([^"&?\/\s]{11})/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1] && match[1].length === 11) {
        return match[1];
      }
    }

    return null;
  };

  const handleDeleteItem = async (id, type) => {
    const itemType = type === 'video' ? 'video' : 'image';
    if (confirm(`Are you sure you want to delete this ${itemType}?`)) {
      try {
        // Delete from database via API
        const response = await fetch(`/api/admin/gallery/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setItems(prev => prev.filter(item => item.id !== id));
          setSelectedItems(prev => prev.filter(itemId => itemId !== id));
          setMessage(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted successfully!`);
        } else {
          throw new Error(`Failed to delete ${itemType}`);
        }

        setTimeout(() => setMessage(""), 3000);
      } catch (error) {
        setMessage(`Error deleting ${itemType}`);
        console.error('Delete error:', error);
      }
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;

    if (confirm(`Are you sure you want to delete ${selectedItems.length} selected item(s)?`)) {
      setItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
      setSelectedItems([]);
      setMessage(`${selectedItems.length} item(s) deleted successfully`);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const toggleItemSelection = (id) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const selectAllItems = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  const updateItemCategory = (id, category) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, category } : item
    ));
  };

  // Filter items based on search and tab
  const filteredItems = items.filter(item => {
    const matchesSearch = (item.image_name || item.title || item.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' ||
                      (activeTab === 'images' && item.type !== 'video') ||
                      (activeTab === 'videos' && item.type === 'video');
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery Management</h1>
          <p className="text-gray-600">Upload and manage your gallery images & videos</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowVideoModal(true)}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            📹 Add YouTube Video/Short
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {viewMode === 'grid' ? '📋 List View' : '🔲 Grid View'}
          </button>
        </div>
      </div>

      {/* Supabase Image Upload */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload New Images</h2>
        <SimpleImageUpload
          onUploadComplete={handleImageUpload}
          onUploadError={handleUploadError}
          maxSize={10}
          className="mb-4"
          uploadText="Click to upload gallery image"
        />
      </div>

      {/* Tabs and Search */}
      <div className="bg-white rounded-xl shadow-md p-6">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'images'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Images ({items.filter(item => item.type !== 'video').length})
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'videos'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Videos ({items.filter(item => item.type === 'video').length})
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedItems.length} item(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedItems([])}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#2B3AA0] border-t-transparent"></div>
            <span className="text-gray-700">Uploading images...</span>
          </div>
        </div>
      )}

      {/* Success/Error Message */}
      {message && (
        <div className={`rounded-xl p-4 ${
          message.includes('successfully') || message.includes('uploaded')
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Gallery Images */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Gallery Items ({filteredItems.length})
            </h2>
            {filteredItems.length > 0 && (
              <button
                onClick={selectAllItems}
                className="text-sm text-[#2B3AA0] hover:text-[#1e2a70] font-medium"
              >
                {selectedItems.length === filteredItems.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-gray-400 text-8xl mb-4">🖼️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No items found' : 'No items yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? 'Try adjusting your search criteria'
                : 'Upload your first image or add a video to get started'
              }
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <div className="aspect-video bg-gray-200 flex items-center justify-center">
                    {item.type === 'video' ? (
                      <div className="relative w-full h-full">
                        <img
                          src={item.image_url || `https://img.youtube.com/vi/${item.youtube_id}/maxresdefault.jpg`}
                          alt={item.image_name || item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/images/placeholder.jpg';
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-red-600 text-white rounded-full p-3">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={item.image_url || item.url}
                        alt={item.image_name || item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/images/placeholder.jpg';
                        }}
                      />
                    )}
                  </div>
                  <div className="absolute top-2 left-2">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      className="w-4 h-4 text-[#2B3AA0] bg-white border-gray-300 rounded focus:ring-[#2B3AA0]"
                    />
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    {item.type === 'video' && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        Video
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.category === 'tournaments' ? 'bg-yellow-100 text-yellow-800' :
                      item.category === 'classes' ? 'bg-blue-100 text-blue-800' :
                      item.category === 'events' ? 'bg-green-100 text-green-800' :
                      item.category === 'academy' ? 'bg-purple-100 text-purple-800' :
                      item.category === 'equipment' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 truncate">
                    {item.image_name || item.title || item.name}
                  </h3>
                  <div className="text-xs text-gray-500 mb-3 space-y-1">
                    {item.type === 'video' ? (
                      <>
                        <p>Type: YouTube Video</p>
                        <p>Added: {new Date(item.uploaded_at || item.created_at).toLocaleDateString()}</p>
                        {item.youtube_url && (
                          <p className="truncate">
                            <a href={item.youtube_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              View on YouTube
                            </a>
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p>Size: {item.size || 'N/A'}</p>
                        <p>Uploaded: {new Date(item.uploaded_at || item.created_at).toLocaleDateString()}</p>
                        <p>Dimensions: {item.dimensions || 'N/A'}</p>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={item.category}
                      onChange={(e) => updateItemCategory(item.id, e.target.value)}
                      className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#2B3AA0]"
                    >
                      <option value="tournaments">Tournaments</option>
                      <option value="classes">Classes</option>
                      <option value="events">Events</option>
                      <option value="academy">Academy</option>
                      <option value="equipment">Equipment</option>
                      <option value="uncategorized">Uncategorized</option>
                      {item.type === 'video' && <option value="shorts">YouTube Shorts</option>}
                    </select>
                    <button
                      onClick={() => handleDeleteItem(item.id, item.type)}
                      className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleItemSelection(item.id)}
                    className="w-4 h-4 text-[#2B3AA0] bg-white border-gray-300 rounded focus:ring-[#2B3AA0]"
                  />
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                    {item.type === 'video' ? (
                      <>
                        <img
                          src={item.image_url || `https://img.youtube.com/vi/${item.youtube_id}/maxresdefault.jpg`}
                          alt={item.image_name || item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/images/placeholder.jpg';
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-red-600 text-white rounded-full p-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
                      </>
                    ) : (
                      <img
                        src={item.image_url || item.url}
                        alt={item.image_name || item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/images/placeholder.jpg';
                        }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {item.image_name || item.title || item.name}
                    </h3>
                    <div className="text-sm text-gray-500 mt-1">
                      {item.type === 'video' ? (
                        <>
                          <span className="mr-4">Type: Video</span>
                          <span className="mr-4">Added: {new Date(item.uploaded_at || item.created_at).toLocaleDateString()}</span>
                          <span>Category: {item.category}</span>
                        </>
                      ) : (
                        <>
                          <span className="mr-4">Size: {item.size || 'N/A'}</span>
                          <span className="mr-4">Uploaded: {new Date(item.uploaded_at || item.created_at).toLocaleDateString()}</span>
                          <span>Dimensions: {item.dimensions || 'N/A'}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={item.category}
                      onChange={(e) => updateItemCategory(item.id, e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B3AA0]"
                    >
                      <option value="tournaments">Tournaments</option>
                      <option value="classes">Classes</option>
                      <option value="events">Events</option>
                      <option value="academy">Academy</option>
                      <option value="equipment">Equipment</option>
                      <option value="uncategorized">Uncategorized</option>
                      {item.type === 'video' && <option value="shorts">YouTube Shorts</option>}
                    </select>
                    <button
                      onClick={() => handleDeleteItem(item.id, item.type)}
                      className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* YouTube Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add YouTube Video/Short</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Title
                </label>
                <input
                  type="text"
                  value={videoData.title}
                  onChange={(e) => setVideoData({...videoData, title: e.target.value})}
                  placeholder="Enter video title"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube URL
                </label>
                <input
                  type="url"
                  value={videoData.youtube_url}
                  onChange={(e) => setVideoData({...videoData, youtube_url: e.target.value})}
                  placeholder="https://youtube.com/watch?v=... or https://youtube.com/shorts/..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supports regular YouTube videos and YouTube Shorts
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={videoData.category}
                  onChange={(e) => setVideoData({...videoData, category: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="uncategorized">Uncategorized</option>
                  <option value="tournaments">Tournaments</option>
                  <option value="classes">Classes</option>
                  <option value="events">Events</option>
                  <option value="academy">Academy</option>
                  <option value="shorts">YouTube Shorts</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowVideoModal(false);
                    setVideoData({ title: '', youtube_url: '', category: 'uncategorized' });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVideoAdd}
                  disabled={uploading || !videoData.title || !videoData.youtube_url}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Adding...' : 'Add Video'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

  );
};

export default GalleryManagement;
