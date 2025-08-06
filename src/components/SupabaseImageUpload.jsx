"use client";
import React, { useState } from 'react';
import { uploadBlogImage, uploadGalleryImage, uploadFile } from '../../lib/supabase-storage';

const SupabaseImageUpload = ({ 
  onUploadComplete, 
  onUploadError, 
  uploadType = 'gallery', // 'gallery', 'blog', 'general'
  blogSlug = null, // Required for blog uploads
  folder = 'general', // For general uploads
  maxSize = 5, // Max size in MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className = ""
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // Validate file
  const validateFile = (file) => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`);
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      throw new Error(`File size too large. Maximum size: ${maxSize}MB`);
    }

    return true;
  };

  // Handle file upload
  const handleUpload = async (file) => {
    try {
      setUploading(true);
      setUploadProgress(0);

      // Validate file
      validateFile(file);

      let uploadResult;

      // Choose upload function based on type
      switch (uploadType) {
        case 'blog':
          if (!blogSlug) {
            throw new Error('Blog slug is required for blog uploads');
          }
          uploadResult = await uploadBlogImage(file, blogSlug);
          break;
        
        case 'gallery':
          uploadResult = await uploadGalleryImage(file);
          break;
        
        case 'general':
        default:
          uploadResult = await uploadFile(file, folder);
          break;
      }

      setUploadProgress(100);
      
      if (onUploadComplete) {
        onUploadComplete(uploadResult);
      }

    } catch (error) {
      console.error('Upload error:', error);
      if (onUploadError) {
        onUploadError(error.message);
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
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
            {uploadProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
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
                  Click to upload
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

      {/* Upload Type Info */}
      <div className="mt-2 text-xs text-gray-500">
        Upload type: {uploadType}
        {uploadType === 'blog' && blogSlug && ` (${blogSlug})`}
        {uploadType === 'general' && folder && ` (${folder})`}
      </div>
    </div>
  );
};

export default SupabaseImageUpload;
