import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Development mode - use hardcoded credentials
    if (process.env.DEVELOPMENT_MODE === 'true') {
      if (email === 'admin' && password === '1234') {
        const token = jwt.sign(
          { 
            email: 'admin@thinqchess.com',
            role: 'admin',
            id: 1
          },
          process.env.JWT_SECRET || 'thinqchess-secret-key-2024',
          { expiresIn: '24h' }
        );

        const response = NextResponse.json({
          success: true,
          message: 'Login successful',
          user: {
            email: 'admin@thinqchess.com',
            role: 'admin'
          }
        });

        // Set HTTP-only cookie
        response.cookies.set('admin-token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        return response;
      } else {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }
    }

    // Production mode with database
    try {
      const { getAdminByEmail } = await import('../../../../../lib/db.js');
      const admin = await getAdminByEmail(email);

      if (!admin) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      const isValidPassword = await bcrypt.compare(password, admin.password_hash);

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      const token = jwt.sign(
        { 
          email: admin.email,
          role: admin.role,
          id: admin.id
        },
        process.env.JWT_SECRET || 'thinqchess-secret-key-2024',
        { expiresIn: '24h' }
      );

      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        user: {
          email: admin.email,
          role: admin.role
        }
      });

      // Set HTTP-only cookie
      response.cookies.set('admin-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      return response;
    } catch (dbError) {
      console.error('Database error during login:', dbError);
      return NextResponse.json(
        { error: 'Login service temporarily unavailable' },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Clear the admin token cookie
    response.cookies.set('admin-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0
    });

    return response;
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
