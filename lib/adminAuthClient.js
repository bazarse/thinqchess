// Client-side admin authentication utility
// This ensures all admin pages use localStorage token consistently

export const adminAuthFetch = async (url, options = {}) => {
  // Get token from localStorage
  const token = localStorage.getItem('admin-token');
  
  // Prepare headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Make the request with credentials and token
  return fetch(url, {
    credentials: 'include',
    ...options,
    headers
  });
};

export const checkAdminAuth = async () => {
  try {
    const response = await adminAuthFetch('/api/admin/verify');
    if (response.ok) {
      const data = await response.json();
      return { success: true, user: data.user };
    } else {
      return { success: false, error: 'Authentication failed' };
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    return { success: false, error: error.message };
  }
};
