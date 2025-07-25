import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export function verifyAdminToken(request) {
  try {
    const token = request.cookies.get('admin-token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'thinqchess-secret-key-2024');
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function requireAdmin(handler) {
  return async (request) => {
    const admin = verifyAdminToken(request);
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Add admin info to request for use in handler
    request.admin = admin;
    return handler(request);
  };
}

export function createAdminResponse(data, status = 200) {
  return NextResponse.json(data, { status });
}

// Helper function to check if user is authenticated (for client-side)
export function isAuthenticated(request) {
  const admin = verifyAdminToken(request);
  return !!admin;
}
