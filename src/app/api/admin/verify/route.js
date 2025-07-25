import { NextResponse } from 'next/server';
import { verifyAdminToken } from '../../../../../lib/adminAuth.js';

export async function GET(request) {
  try {
    const admin = verifyAdminToken(request);
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        email: admin.email,
        role: admin.role,
        id: admin.id
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
