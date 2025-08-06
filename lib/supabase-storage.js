// Supabase Storage operations - replacing Firebase Storage
import { supabase, isSupabaseAvailable } from './supabase';

// Storage buckets
const buckets = {
  blogs: 'blog-images',
  gallery: 'gallery-images',
  general: 'general-uploads'
};

// ==================== UPLOAD OPERATIONS ====================

// Upload blog image
export async function uploadBlogImage(file, blogSlug) {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available in development mode');
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${blogSlug}-${Date.now()}.${fileExt}`;
    const filePath = `blogs/${fileName}`;

    const { data, error } = await supabase.storage
      .from(buckets.blogs)
      .upload(filePath, file);

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(buckets.blogs)
      .getPublicUrl(filePath);

    return {
      path: data.path,
      url: urlData.publicUrl,
      name: fileName
    };
  } catch (error) {
    console.error('Error uploading blog image:', error);
    throw error;
  }
}

// Upload gallery image
export async function uploadGalleryImage(file) {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available in development mode');
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `gallery-${Date.now()}.${fileExt}`;
    const filePath = `gallery/${fileName}`;

    const { data, error } = await supabase.storage
      .from(buckets.gallery)
      .upload(filePath, file);

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(buckets.gallery)
      .getPublicUrl(filePath);

    return {
      path: data.path,
      url: urlData.publicUrl,
      name: fileName
    };
  } catch (error) {
    console.error('Error uploading gallery image:', error);
    throw error;
  }
}

// Upload general file
export async function uploadFile(file, folder = 'general') {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available in development mode');
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(buckets.general)
      .upload(filePath, file);

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(buckets.general)
      .getPublicUrl(filePath);

    return {
      path: data.path,
      url: urlData.publicUrl,
      name: fileName
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// ==================== DELETE OPERATIONS ====================

// Delete blog image
export async function deleteBlogImage(filePath) {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available in development mode');
  }

  try {
    const { error } = await supabase.storage
      .from(buckets.blogs)
      .remove([filePath]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting blog image:', error);
    throw error;
  }
}

// Delete gallery image
export async function deleteGalleryImage(filePath) {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available in development mode');
  }

  try {
    const { error } = await supabase.storage
      .from(buckets.gallery)
      .remove([filePath]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    throw error;
  }
}

// Delete general file
export async function deleteFile(filePath, bucket = buckets.general) {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available in development mode');
  }

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

// ==================== LIST OPERATIONS ====================

// List blog images
export async function listBlogImages() {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available in development mode');
  }

  try {
    const { data, error } = await supabase.storage
      .from(buckets.blogs)
      .list('blogs');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error listing blog images:', error);
    throw error;
  }
}

// List gallery images
export async function listGalleryImages() {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available in development mode');
  }

  try {
    const { data, error } = await supabase.storage
      .from(buckets.gallery)
      .list('gallery');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error listing gallery images:', error);
    throw error;
  }
}

// ==================== HELPER FUNCTIONS ====================

// Get public URL for any file
export function getPublicUrl(bucket, filePath) {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available in development mode');
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// Check if file exists
export async function fileExists(bucket, filePath) {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available in development mode');
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list('', {
        search: filePath
      });

    if (error) throw error;
    return data && data.length > 0;
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
}
