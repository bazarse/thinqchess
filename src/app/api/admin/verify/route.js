import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    const token = request.cookies.get('admin-token')?.value;
    const sessionCookie = request.cookies.get('admin-session')?.value;

    console.log('🔍 Verify request details:');
    console.log('- admin-token:', token ? 'present' : 'missing');
    console.log('- admin-session:', sessionCookie ? 'present' : 'missing');
    console.log('- All cookies:', request.cookies.getAll().map(c => `${c.name}=${c.value}`));
    console.log('- Request URL:', request.url);
    console.log('- Request headers cookie:', request.headers.get('cookie'));

    if (!token) {
      console.log('❌ No token found, returning 401');
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
