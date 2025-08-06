// Supabase database operations - replacing Firebase/PostgreSQL functions
import { supabase, isSupabaseAvailable } from './supabase';

// Table names
const tables = {
  blogs: 'blogs',
  gallery: 'gallery_images',
  registrations: 'tournament_registrations',
  adminSettings: 'admin_settings'
};

// ==================== BLOG OPERATIONS ====================

// Get all blogs
export async function getAllBlogs(status = null) {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available in development mode');
  }

  try {
    let query = supabase
      .from(tables.blogs)
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw error;
  }
}

// Create new blog
export async function createBlog(blogData) {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available in development mode');
  }

  try {
    const { data, error } = await supabase
      .from(tables.blogs)
      .insert([{
        ...blogData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating blog:', error);
    throw error;
  }
}

// Update blog
export async function updateBlog(id, blogData) {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available in development mode');
  }

  try {
    const { data, error } = await supabase
      .from(tables.blogs)
      .update({
        ...blogData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating blog:', error);
    throw error;
  }
}

// Delete blog
export async function deleteBlog(id) {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available in development mode');
  }

  try {
    const { error } = await supabase
      .from(tables.blogs)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting blog:', error);
    throw error;
  }
}

// ==================== GALLERY OPERATIONS ====================

// Get all gallery images
export async function getAllGalleryImages() {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available in development mode');
  }

  try {
    const { data, error } = await supabase
      .from(tables.gallery)
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    throw error;
  }
}

// Add gallery image
export async function addGalleryImage(imageData) {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available in development mode');
  }

  try {
    const { data, error } = await supabase
      .from(tables.gallery)
      .insert([{
        ...imageData,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding gallery image:', error);
    throw error;
  }
}

// Delete gallery image
export async function deleteGalleryImage(id) {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available in development mode');
  }

  try {
    const { error } = await supabase
      .from(tables.gallery)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    throw error;
  }
}

// ==================== REGISTRATION OPERATIONS ====================

// Get all registrations
export async function getAllRegistrations() {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available in development mode');
  }

  try {
    const { data, error } = await supabase
      .from(tables.registrations)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching registrations:', error);
    throw error;
  }
}

// Create registration
export async function createRegistration(registrationData) {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available in development mode');
  }

  try {
    const { data, error } = await supabase
      .from(tables.registrations)
      .insert([{
        ...registrationData,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating registration:', error);
    throw error;
  }
}

// Get registration count
export async function getRegistrationCount() {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available in development mode');
  }

  try {
    const { count, error } = await supabase
      .from(tables.registrations)
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error fetching registration count:', error);
    throw error;
  }
}

// ==================== ADMIN SETTINGS OPERATIONS ====================

// Get admin settings
export async function getAdminSettings() {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available in development mode');
  }

  try {
    const { data, error } = await supabase
      .from(tables.adminSettings)
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return data;
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    throw error;
  }
}

// ==================== REAL-TIME SUBSCRIPTIONS ====================

// Real-time registrations listener
export function onRegistrationsChange(callback) {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available in development mode');
  }

  const subscription = supabase
    .channel('registrations_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: tables.registrations },
      async () => {
        // Fetch updated data when changes occur
        const registrations = await getAllRegistrations();
        callback(registrations);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(subscription);
  };
}

// Real-time admin settings listener
export function onAdminSettingsChange(callback) {
  if (!isSupabaseAvailable()) {
    throw new Error('Supabase not available in development mode');
  }

  const subscription = supabase
    .channel('admin_settings_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: tables.adminSettings },
      async () => {
        // Fetch updated data when changes occur
        const settings = await getAdminSettings();
        callback(settings);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(subscription);
  };
}
