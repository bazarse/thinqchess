import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    // Check multiple sources for token
    const cookieToken = request.cookies.get('admin-token')?.value;
    const authHeader = request.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const sessionCookie = request.cookies.get('admin-session')?.value;

    // Use cookie token first, then bearer token as fallback
    const token = cookieToken || bearerToken;

    console.log('🔍 Verify request details:');
    console.log('- Cookie token:', cookieToken ? 'present' : 'missing');
    console.log('- Bearer token:', bearerToken ? 'present' : 'missing');
    console.log('- Final token:', token ? 'present' : 'missing');
    console.log('- admin-session:', sessionCookie ? 'present' : 'missing');
    console.log('- All cookies:', request.cookies.getAll().map(c => `${c.name}=${c.value}`));
    console.log('- Authorization header:', authHeader || 'missing');

    if (!token) {
      console.log('❌ No token found in cookies or headers, returning 401');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'thinqchess-secret-key-2024');

    return NextResponse.json({
      success: true,
      user: {
        email: decoded.email,
        role: decoded.role,
        id: decoded.id
      }
    });
  } catch (error) {
    console.error('Error verifying admin token:', error);
    return NextResponse.json(
      { error: 'Token verification failed' },
      { status: 401 }
    );
  }
}
