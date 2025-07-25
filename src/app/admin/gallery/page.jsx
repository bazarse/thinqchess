"use client";
import React, { useState, useEffect } from "react";

const GalleryManagement = () => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Sample gallery images
  const sampleImages = [
    {
      id: 1,
      name: "Chess Tournament 2024",
      url: "/images/gallery/tournament1.jpg",
      category: "tournaments",
      uploaded_at: "2024-01-15",
      size: "2.5 MB",
      dimensions: "1920x1080"
    },
    {
      id: 2,
      name: "Student Practice Session",
      url: "/images/gallery/practice1.jpg",
      category: "classes",
      uploaded_at: "2024-01-12",
      size: "1.8 MB",
      dimensions: "1600x900"
    },
    {
      id: 3,
      name: "Chess Academy Building",
      url: "/images/gallery/building1.jpg",
      category: "academy",
      uploaded_at: "2024-01-10",
      size: "3.2 MB",
      dimensions: "2048x1536"
    },
    {
      id: 4,
      name: "Award Ceremony",
      url: "/images/gallery/awards1.jpg",
      category: "events",
      uploaded_at: "2024-01-08",
      size: "2.1 MB",
      dimensions: "1920x1280"
    },
    {
      id: 5,
      name: "Chess Board Setup",
      url: "/images/gallery/board1.jpg",
      category: "equipment",
      uploaded_at: "2024-01-05",
      size: "1.5 MB",
      dimensions: "1200x800"
    },
    {
      id: 6,
      name: "Group Photo",
      url: "/images/gallery/group1.jpg",
      category: "events",
      uploaded_at: "2024-01-03",
      size: "2.8 MB",
      dimensions: "2000x1333"
    }
  ];

  useEffect(() => {
    setImages(sampleImages);
  }, []);

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setMessage("");

    try {
      // Simulate file upload
      for (const file of files) {
        const newImage = {
          id: Date.now() + Math.random(),
          name: file.name.split('.')[0],
          url: URL.createObjectURL(file), // In real app, this would be the uploaded URL
          category: "uncategorized",
          uploaded_at: new Date().toISOString().split('T')[0],
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          dimensions: "Unknown" // In real app, you'd get this from the image
        };

        setImages(prev => [newImage, ...prev]);
      }

      setMessage(`Successfully uploaded ${files.length} image(s)`);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Error uploading images");
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = (id) => {
    if (confirm('Are you sure you want to delete this image?')) {
      setImages(prev => prev.filter(img => img.id !== id));
      setSelectedImages(prev => prev.filter(imgId => imgId !== id));
      setMessage("Image deleted successfully");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleBulkDelete = () => {
    if (selectedImages.length === 0) return;

    if (confirm(`Are you sure you want to delete ${selectedImages.length} selected image(s)?`)) {
      setImages(prev => prev.filter(img => !selectedImages.includes(img.id)));
      setSelectedImages([]);
      setMessage(`${selectedImages.length} image(s) deleted successfully`);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const toggleImageSelection = (id) => {
    setSelectedImages(prev =>
      prev.includes(id)
        ? prev.filter(imgId => imgId !== id)
        : [...prev, id]
    );
  };

  const selectAllImages = () => {
    if (selectedImages.length === filteredImages.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(filteredImages.map(img => img.id));
    }
  };

  const updateImageCategory = (id, category) => {
    setImages(prev => prev.map(img =>
      img.id === id ? { ...img, category } : img
    ));
  };

  // Filter images based on search and category
  const filteredImages = images.filter(image => {
    const matchesSearch = image.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || image.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery Management</h1>
          <p className="text-gray-600">Upload and manage your gallery images</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {viewMode === 'grid' ? '📋 List View' : '🔲 Grid View'}
          </button>
          <label className="bg-gradient-to-r from-[#2B3AA0] to-[#1e2a70] hover:from-[#1e2a70] hover:to-[#2B3AA0] text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl cursor-pointer">
            📤 Upload Images
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-6">
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
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0] focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="tournaments">Tournaments</option>
            <option value="classes">Classes</option>
            <option value="events">Events</option>
            <option value="academy">Academy</option>
            <option value="equipment">Equipment</option>
            <option value="uncategorized">Uncategorized</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedImages.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedImages.length} image(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedImages([])}
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
              Gallery Images ({filteredImages.length})
            </h2>
            {filteredImages.length > 0 && (
              <button
                onClick={selectAllImages}
                className="text-sm text-[#2B3AA0] hover:text-[#1e2a70] font-medium"
              >
                {selectedImages.length === filteredImages.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
        </div>

        {filteredImages.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-gray-400 text-8xl mb-4">🖼️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filterCategory !== 'all' ? 'No images found' : 'No images yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterCategory !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Upload your first image to get started'
              }
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {filteredImages.map((image) => (
              <div key={image.id} className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <div className="aspect-video bg-gray-200 flex items-center justify-center">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/images/placeholder.jpg';
                      }}
                    />
                  </div>
                  <div className="absolute top-2 left-2">
                    <input
                      type="checkbox"
                      checked={selectedImages.includes(image.id)}
                      onChange={() => toggleImageSelection(image.id)}
                      className="w-4 h-4 text-[#2B3AA0] bg-white border-gray-300 rounded focus:ring-[#2B3AA0]"
                    />
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      image.category === 'tournaments' ? 'bg-yellow-100 text-yellow-800' :
                      image.category === 'classes' ? 'bg-blue-100 text-blue-800' :
                      image.category === 'events' ? 'bg-green-100 text-green-800' :
                      image.category === 'academy' ? 'bg-purple-100 text-purple-800' :
                      image.category === 'equipment' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {image.category}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 truncate">{image.name}</h3>
                  <div className="text-xs text-gray-500 mb-3 space-y-1">
                    <p>Size: {image.size}</p>
                    <p>Uploaded: {image.uploaded_at}</p>
                    <p>Dimensions: {image.dimensions}</p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={image.category}
                      onChange={(e) => updateImageCategory(image.id, e.target.value)}
                      className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#2B3AA0]"
                    >
                      <option value="tournaments">Tournaments</option>
                      <option value="classes">Classes</option>
                      <option value="events">Events</option>
                      <option value="academy">Academy</option>
                      <option value="equipment">Equipment</option>
                      <option value="uncategorized">Uncategorized</option>
                    </select>
                    <button
                      onClick={() => handleDeleteImage(image.id)}
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
            {filteredImages.map((image) => (
              <div key={image.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedImages.includes(image.id)}
                    onChange={() => toggleImageSelection(image.id)}
                    className="w-4 h-4 text-[#2B3AA0] bg-white border-gray-300 rounded focus:ring-[#2B3AA0]"
                  />
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/images/placeholder.jpg';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{image.name}</h3>
                    <div className="text-sm text-gray-500 mt-1">
                      <span className="mr-4">Size: {image.size}</span>
                      <span className="mr-4">Uploaded: {image.uploaded_at}</span>
                      <span>Dimensions: {image.dimensions}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={image.category}
                      onChange={(e) => updateImageCategory(image.id, e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2B3AA0]"
                    >
                      <option value="tournaments">Tournaments</option>
                      <option value="classes">Classes</option>
                      <option value="events">Events</option>
                      <option value="academy">Academy</option>
                      <option value="equipment">Equipment</option>
                      <option value="uncategorized">Uncategorized</option>
                    </select>
                    <button
                      onClick={() => handleDeleteImage(image.id)}
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
    </div>

  );
};

export default GalleryManagement;
