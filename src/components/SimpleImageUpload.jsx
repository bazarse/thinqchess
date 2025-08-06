"use client";
import React, { useState } from 'react';

const SimpleImageUpload = ({ 
  onUploadComplete, 
  onUploadError, 
  maxSize = 5, // Max size in MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className = "",
  uploadText = "Upload Image"
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Validate file
  const validateFile = (file) => {
    if (!acceptedTypes.includes(file.type)) {
      throw new Error(`File type not supported. Please use: ${acceptedTypes.join(', ')}`);
    }
    
    if (file.size > maxSize * 1024 * 1024) {
      throw new Error(`File size too large. Maximum size: ${maxSize}MB`);
    }
  };

  // Handle file upload
  const handleUpload = async (file) => {
    try {
      setUploading(true);

      // Validate file
      validateFile(file);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload to our API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      if (onUploadComplete) {
        onUploadComplete(result);
      }

    } catch (error) {
      console.error('Upload error:', error);
      if (onUploadError) {
        onUploadError(error.message);
      }
    } finally {
      setUploading(false);
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleUpload(file);
    }
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${uploading ? 'pointer-events-none opacity-50' : 'hover:border-blue-400 hover:bg-gray-50'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-500 font-medium">
                  {uploadText}
                </span>
                <span className="text-gray-500"> or drag and drop</span>
              </label>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept={acceptedTypes.join(',')}
                onChange={handleFileChange}
                disabled={uploading}
              />
            </div>
            <p className="text-xs text-gray-500">
              {acceptedTypes.map(type => type.split('/')[1]).join(', ').toUpperCase()} up to {maxSize}MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleImageUpload;
