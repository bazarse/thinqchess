"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SimpleImageUpload from "../../../components/SimpleImageUpload";
import RichTextEditor from "../../../components/RichTextEditor";

const BlogManagement = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [blogForm, setBlogForm] = useState({
    title: '',
    content: '',
    featured_image: '',
    status: 'draft'
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchBlogs();
  }, []);

  const checkAuth = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('admin-token');

      const headers = {
        'credentials': 'include'
      };

      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/admin/verify', {
        credentials: 'include',
        headers: headers
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        console.log('Blogs page: Auth failed but staying on page');
        // Don't redirect - let user stay on blogs page
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Don't redirect - let user stay on blogs page
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogs = async () => {
    try {
      const response = await fetch('/api/admin/blogs');
      if (response.ok) {
        const data = await response.json();
        setBlogs(data);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  };

  const handleNewBlog = () => {
    setBlogForm({
      title: '',
      content: '',
      featured_image: '',
      status: 'draft'
    });
    setEditingBlog(null);
    setShowEditor(true);
  };

  const handleEditBlog = (blog) => {
    setBlogForm({
      title: blog.title,
      content: blog.content,
      featured_image: blog.featured_image || '',
      status: blog.status
    });
    setEditingBlog(blog);
    setShowEditor(true);
  };

  const handleSaveBlog = async () => {
    if (!blogForm.title || !blogForm.content) {
      setMessage("Title and content are required");
      return;
    }

    setSaving(true);
    try {
      const url = '/api/admin/blogs';
      const method = editingBlog ? 'PUT' : 'POST';
      const body = editingBlog 
        ? { ...blogForm, id: editingBlog.id }
        : blogForm;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setMessage(`Blog ${editingBlog ? 'updated' : 'created'} successfully!`);
        setShowEditor(false);
        setEditingBlog(null);
        setBlogForm({
          title: '',
          content: '',
          featured_image: '',
          status: 'draft'
        });
        fetchBlogs();
        setTimeout(() => setMessage(""), 3000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "Error saving blog");
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      setMessage(`Error saving blog: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBlog = async (id) => {
    if (!confirm("Are you sure you want to delete this blog?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/blogs?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessage("Blog deleted successfully!");
        fetchBlogs();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Error deleting blog");
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      setMessage("Error deleting blog");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/login', { method: 'DELETE' });
      router.push('/admin');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/admin');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B3AA0] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (showEditor) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <button 
                  onClick={() => setShowEditor(false)}
                  className="text-[#2B3AA0] hover:text-[#FFB31A] mr-4"
                >
                  ← Back to Blogs
                </button>
                <h1 className="text-2xl font-bold text-[#2B3AA0]">
                  {editingBlog ? 'Edit Blog' : 'Create New Blog'}
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Blog Editor */}
        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blog Title</label>
                <input
                  type="text"
                  value={blogForm.title}
                  onChange={(e) => setBlogForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0]"
                  placeholder="Enter blog title..."
                />
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
                {blogForm.featured_image && (
                  <div className="mb-4">
                    <img
                      src={blogForm.featured_image}
                      alt="Featured"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => setBlogForm(prev => ({ ...prev, featured_image: '' }))}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Remove Image
                    </button>
                  </div>
                )}
                <SimpleImageUpload
                  onUploadComplete={(result) => setBlogForm(prev => ({ ...prev, featured_image: result.url }))}
                  onUploadError={(error) => setMessage(`Image upload error: ${error}`)}
                  maxSize={5}
                  uploadText="Upload featured image"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blog Content</label>
                <RichTextEditor
                  value={blogForm.content}
                  onChange={(content) => setBlogForm(prev => ({ ...prev, content }))}
                  placeholder="Write your blog content here... Use the toolbar to add formatting, images, and videos."
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={blogForm.status}
                  onChange={(e) => setBlogForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0]"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={handleSaveBlog}
                  disabled={saving}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                    saving 
                      ? 'bg-gray-400 cursor-not-allowed text-white' 
                      : 'bg-[#2B3AA0] hover:bg-[#1e2a70] text-white'
                  }`}
                >
                  {saving ? "Saving..." : (editingBlog ? "Update Blog" : "Create Blog")}
                </button>
                <button
                  onClick={() => setShowEditor(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog Management</h1>
            <p className="text-gray-600">Create and manage blog posts</p>
          </div>
          <button
            onClick={handleNewBlog}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            + New Blog
          </button>
        </div>
      </div>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">All Blogs ({blogs.length})</h2>
          </div>
          
          {blogs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs yet</h3>
              <p className="text-gray-600 mb-4">Create your first blog post to get started</p>
              <button
                onClick={handleNewBlog}
                className="bg-[#2B3AA0] hover:bg-[#1e2a70] text-white px-6 py-3 rounded-lg transition-colors"
              >
                Create First Blog
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {blogs.map((blog) => (
                <div key={blog.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{blog.title}</h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {blog.content.substring(0, 150)}...
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          blog.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {blog.status}
                        </span>
                        <span>Created: {blog.created_at ? new Date(blog.created_at).toLocaleDateString() : 'Unknown'}</span>
                        {blog.updated_at && blog.updated_at !== blog.created_at && (
                          <span>Updated: {(() => {
                            try {
                              return new Date(blog.updated_at).toLocaleDateString();
                            } catch (e) {
                              return 'Recently';
                            }
                          })()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditBlog(blog)}
                        className="bg-blue-100 text-blue-800 px-3 py-2 rounded text-sm hover:bg-blue-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(blog.id)}
                        className="bg-red-100 text-red-800 px-3 py-2 rounded text-sm hover:bg-red-200 transition-colors"
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

        {/* Success/Error Message */}
        {message && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
            message.includes('successfully') 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <span>{message}</span>
              <button 
                onClick={() => setMessage('')}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          </div>
        )}
    </div>
  );
};

export default BlogManagement;
