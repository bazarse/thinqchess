// Firebase Storage functions for file uploads
import { 
  ref, 
  uploadBytes, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  listAll
} from 'firebase/storage';
import { storage } from './firebase';

// Upload file to Firebase Storage
export async function uploadFile(file, path, onProgress = null) {
  try {
    const storageRef = ref(storage, path);
    
    if (onProgress) {
      // Use resumable upload with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          },
          (error) => {
            console.error('Upload error:', error);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({
                url: downloadURL,
                path: path,
                name: file.name,
                size: file.size,
                type: file.type
              });
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    } else {
      // Simple upload without progress tracking
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        url: downloadURL,
        path: path,
        name: file.name,
        size: file.size,
        type: file.type
      };
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// Upload gallery image
export async function uploadGalleryImage(file, onProgress = null) {
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name}`;
  const path = `gallery/${fileName}`;
  
  return await uploadFile(file, path, onProgress);
}

// Upload blog featured image
export async function uploadBlogImage(file, blogSlug, onProgress = null) {
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name}`;
  const path = `blogs/${blogSlug}/${fileName}`;
  
  return await uploadFile(file, path, onProgress);
}

// Upload user profile picture
export async function uploadProfilePicture(file, userId, onProgress = null) {
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name}`;
  const path = `profiles/${userId}/${fileName}`;
  
  return await uploadFile(file, path, onProgress);
}

// Upload tournament related files
export async function uploadTournamentFile(file, tournamentId, onProgress = null) {
  const timestamp = Date.now();
  const fileName = `${timestamp}_${file.name}`;
  const path = `tournaments/${tournamentId}/${fileName}`;
  
  return await uploadFile(file, path, onProgress);
}

// Delete file from Firebase Storage
export async function deleteFile(filePath) {
  try {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

// Get all files in a directory
export async function listFiles(directoryPath) {
  try {
    const directoryRef = ref(storage, directoryPath);
    const result = await listAll(directoryRef);
    
    const files = await Promise.all(
      result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          path: itemRef.fullPath,
          url: url
        };
      })
    );
    
    return files;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
}

// Get download URL for a file
export async function getFileURL(filePath) {
  try {
    const fileRef = ref(storage, filePath);
    const url = await getDownloadURL(fileRef);
    return url;
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
}

// Validate file type and size
export function validateFile(file, allowedTypes = [], maxSizeMB = 5) {
  const errors = [];
  
  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    errors.push(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${maxSizeMB}MB`);
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// Common file type constants
export const FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  VIDEOS: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv']
};

// Helper function to generate unique file names
export function generateFileName(originalName, prefix = '') {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const nameWithoutExtension = originalName.replace(`.${extension}`, '');
  
  return `${prefix}${timestamp}_${randomString}_${nameWithoutExtension}.${extension}`;
}
