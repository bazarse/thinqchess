"use client";
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const RouterOptimizer = () => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Preload critical routes
    const criticalRoutes = [
      '/',
      '/tournaments',
      '/registration',
      '/gallery',
      '/admin'
    ];

    criticalRoutes.forEach(route => {
      if (route !== pathname) {
        router.prefetch(route);
      }
    });

    // Update URL immediately on route change
    const handleRouteChange = () => {
      // Force URL update
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.href);
      }
    };

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [router, pathname]);

  useEffect(() => {
    // Ensure scrollbar is always visible
    if (typeof document !== 'undefined') {
      document.documentElement.style.overflowY = 'scroll';
      document.body.style.overflowY = 'scroll';
    }
  }, []);

  return null;
};

export default RouterOptimizer;
