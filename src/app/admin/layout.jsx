"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/admin/create-tournament", label: "Create Tournament", icon: "🏆" },
    { href: "/admin/tournament-settings", label: "Tournament Settings", icon: "⚙️" },
    { href: "/admin/registrations", label: "Registrations", icon: "👥" },
    { href: "/admin/discount-codes", label: "Discount Codes", icon: "🎫" },
    { href: "/admin/gallery", label: "Gallery Management", icon: "🖼️" },
    { href: "/admin/blog", label: "Blog Management", icon: "📝" },
    { href: "/admin/analytics", label: "Analytics", icon: "📈" },
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/verify');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        if (pathname !== '/admin') {
          router.push('/admin');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      if (pathname !== '/admin') {
        router.push('/admin');
      }
    } finally {
      setLoading(false);
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

  if (pathname === '/admin') {
    return children;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div 
        className={`bg-white shadow-xl text-gray-800 w-72 fixed h-full transition-all duration-300 ease-in-out z-50 ${
          sidebarOpen ? "left-0" : "-left-72"
        } md:left-0 border-r border-gray-200`}
      >
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <span className="text-blue-600 text-xl">👑</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">ThinQ Chess</h1>
              <p className="text-blue-100 text-sm">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="mt-6 px-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center py-3 px-4 rounded-xl transition-all duration-200 ${
                    pathname === item.href 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                      : 'hover:bg-gray-100 text-gray-700 hover:text-blue-600'
                  }`}
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                  {pathname === item.href && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm">👤</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Admin</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 md:ml-72 transition-all duration-300">
        <header className="bg-white shadow-md sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden text-gray-700 hover:text-blue-600 focus:outline-none mr-4"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                <h1 className="text-xl font-bold text-gray-800">
                  {navItems.find(item => item.href === pathname)?.label || 'Admin Panel'}
                </h1>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
