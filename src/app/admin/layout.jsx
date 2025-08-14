"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: "■" },
    { href: "/admin/tournaments", label: "Tournaments", icon: "🏆" },
    { href: "/admin/registrations", label: "Registrations", icon: "👤" },
    { href: "/admin/demo-submissions", label: "Demo Submissions", icon: "📋" },
    { href: "/admin/discount-codes", label: "Discount Codes", icon: "%" },
    { href: "/admin/gallery", label: "Gallery", icon: "□" },
    { href: "/admin/blogs", label: "Blog", icon: "✎" },
    { href: "/admin/settings", label: "Settings", icon: "⚙️" },
  ];

  // Check authentication on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/admin/verify');
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        if (pathname !== '/admin') {
          router.push('/admin');
        }
      }
    } catch (error) {
      console.log('Authentication check failed');
      setIsAuthenticated(false);
      if (pathname !== '/admin') {
        router.push('/admin');
      }
    } finally {
      setIsLoading(false);
    }
  };



  const handleLogout = async () => {
    try {
      // Call logout API to clear server-side cookie
      await fetch('/api/admin/login', { method: 'DELETE' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    // Clear any stored auth tokens
    document.cookie = 'admin-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setIsAuthenticated(false);
    router.push('/admin');
  };

  const handleNavigation = (href) => {
    setMenuOpen(false);
    router.push(href);
  };

  if (pathname === '/admin') {
    return children;
  }

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B3AA0] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    router.push('/admin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors flex items-center space-x-2 relative ${
                    pathname === item.href
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
              
              <button
                onClick={handleLogout}
                className="ml-4 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm"
              >
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={`w-full text-left px-4 py-3 rounded text-sm font-medium flex items-center justify-between ${
                    pathname === item.href
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-sm">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                </button>
              ))}
              
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded text-sm flex items-center space-x-3"
              >
                <span className="text-sm">×</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
