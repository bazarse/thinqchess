"use client";
import React, { useState, useEffect } from "react";

const BlogManagement = () => {
  const [posts, setPosts] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    excerpt: '',
    status: 'draft',
    tags: ''
  });

  // Sample blog posts
  const samplePosts = [
    {
      id: 1,
      title: "Chess Strategies for Beginners",
      excerpt: "Learn the fundamental strategies that every chess player should know...",
      content: "Chess is a game of strategy and tactics. Here are some fundamental strategies every beginner should master...",
      status: "published",
      created_at: "2024-01-15",
      author: "Admin",
      tags: "beginner, strategy, chess"
    },
    {
      id: 2,
      title: "Tournament Preparation Tips",
      excerpt: "How to prepare mentally and physically for chess tournaments...",
      content: "Preparing for a chess tournament requires both mental and physical preparation. Here's a comprehensive guide...",
      status: "published",
      created_at: "2024-01-10",
      author: "Admin",
      tags: "tournament, preparation, tips"
    },
    {
      id: 3,
      title: "Famous Chess Openings Explained",
      excerpt: "A comprehensive guide to the most popular chess openings...",
      content: "Chess openings are crucial for setting up a strong position. Let's explore the most famous openings...",
      status: "draft",
      created_at: "2024-01-08",
      author: "Admin",
      tags: "openings, theory, advanced"
    }
  ];

  useEffect(() => {
    setPosts(samplePosts);
  }, []);

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) {
      alert('Please fill in all required fields');
      return;
    }

    const post = {
      id: Date.now(),
      ...newPost,
      created_at: new Date().toISOString().split('T')[0],
      author: 'Admin'
    };

    setPosts([post, ...posts]);
    setNewPost({ title: '', content: '', excerpt: '', status: 'draft', tags: '' });
    setShowCreateForm(false);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setNewPost({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      status: post.status,
      tags: post.tags || ''
    });
    setShowCreateForm(true);
  };

  const handleUpdatePost = (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) {
      alert('Please fill in all required fields');
      return;
    }

    const updatedPosts = posts.map(post =>
      post.id === editingPost.id
        ? { ...post, ...newPost, updated_at: new Date().toISOString().split('T')[0] }
        : post
    );

    setPosts(updatedPosts);
    setNewPost({ title: '', content: '', excerpt: '', status: 'draft', tags: '' });
    setShowCreateForm(false);
    setEditingPost(null);
  };

  const deletePost = (id) => {
    if (confirm('Are you sure you want to delete this post?')) {
      setPosts(posts.filter(post => post.id !== id));
    }
  };

  const toggleStatus = (id) => {
    setPosts(posts.map(post =>
      post.id === id
        ? { ...post, status: post.status === 'published' ? 'draft' : 'published' }
        : post
    ));
  };

  const cancelEdit = () => {
    setShowCreateForm(false);
    setEditingPost(null);
    setNewPost({ title: '', content: '', excerpt: '', status: 'draft', tags: '' });
  };

  // Filter posts based on search and status
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600">Create and manage your blog posts</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-gradient-to-r from-[#2B3AA0] to-[#1e2a70] hover:from-[#1e2a70] hover:to-[#2B3AA0] text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
        >
          {showCreateForm ? '✕ Cancel' : '+ New Post'}
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0] focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0] focus:border-transparent"
          >
            <option value="all">All Posts</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>
      {/* Create/Edit Post Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h3>
          <form onSubmit={editingPost ? handleUpdatePost : handleCreatePost} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2B3AA0] focus:border-transparent"
                  placeholder="Enter blog post title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={newPost.status}
                  onChange={(e) => setNewPost({...newPost, status: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2B3AA0] focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <input
                type="text"
                value={newPost.tags}
                onChange={(e) => setNewPost({...newPost, tags: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2B3AA0] focus:border-transparent"
                placeholder="Enter tags separated by commas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
              <textarea
                value={newPost.excerpt}
                onChange={(e) => setNewPost({...newPost, excerpt: e.target.value})}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2B3AA0] focus:border-transparent"
                placeholder="Brief description of the post"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                rows={12}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2B3AA0] focus:border-transparent"
                placeholder="Write your blog post content here..."
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-gradient-to-r from-[#2B3AA0] to-[#1e2a70] hover:from-[#1e2a70] hover:to-[#2B3AA0] text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
              >
                {editingPost ? 'Update Post' : 'Create Post'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Blog Posts List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            Blog Posts ({filteredPosts.length})
          </h3>
        </div>

        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div key={post.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">{post.title}</h4>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      post.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>
                  {post.tags && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.split(',').map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="text-sm text-gray-500">
                    By {post.author} • {post.created_at}
                    {post.updated_at && ` • Updated ${post.updated_at}`}
                  </div>
                </div>
                <div className="flex gap-2 ml-6">
                  <button
                    onClick={() => toggleStatus(post.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      post.status === 'published'
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {post.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => handleEditPost(post)}
                    className="px-4 py-2 text-sm font-medium text-[#2B3AA0] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-8xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filterStatus !== 'all' ? 'No posts found' : 'No blog posts yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first blog post to get started'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-[#2B3AA0] to-[#1e2a70] text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
              >
                Create First Post
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogManagement;
