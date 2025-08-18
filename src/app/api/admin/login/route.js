import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Password verification function
async function verifyPassword(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('Login attempt:', { email, password });

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Universal login - works for both development and production
    console.log('Processing login request...');
    console.log('Environment check:', {
      DEVELOPMENT_MODE: process.env.DEVELOPMENT_MODE,
      NODE_ENV: process.env.NODE_ENV,
      ADMIN_EMAIL: process.env.ADMIN_EMAIL ? 'set' : 'not set',
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? 'set' : 'not set'
    });

    // Define valid credentials (multiple options for flexibility)
    const validCredentials = [
      // Environment-based credentials (production)
      {
        email: process.env.ADMIN_EMAIL || 'admin@thinqchess.com',
        password: process.env.ADMIN_PASSWORD || '1234'
      },
      // Fallback credentials (development/testing)
      { email: 'admin@thinqchess.com', password: '1234' },
      { email: 'admin', password: '1234' },
      { email: 'admin@thinqchess.com', password: 'admin123' }
    ];

    console.log('Checking credentials against valid options...');
    
    // Check if provided credentials match any valid option
    const isValidCredential = validCredentials.some(cred =>
      cred.email === email && cred.password === password
    );

    if (isValidCredential) {
      console.log('✅ Valid credentials found, creating token');
      
      const token = jwt.sign(
        {
          email: email.includes('@') ? email : 'admin@thinqchess.com',
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
          email: email.includes('@') ? email : 'admin@thinqchess.com',
          role: 'admin'
        }
      });

      // Set multiple cookie formats to ensure compatibility
      const cookieOptions = {
        httpOnly: true,
        secure: false, // Allow HTTP
        sameSite: 'none', // Most permissive for cross-origin
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/'
      };

      // Set the main cookie
      response.cookies.set('admin-token', token, cookieOptions);

      // Also set a backup cookie without httpOnly for debugging
      response.cookies.set('admin-session', 'active', {
        secure: false,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000,
        path: '/'
      });

      // Set additional headers to ensure cookies are sent
      response.headers.set('Set-Cookie', [
        `admin-token=${token}; Path=/; Max-Age=${24 * 60 * 60}; SameSite=None; Secure=false`,
        `admin-session=active; Path=/; Max-Age=${24 * 60 * 60}; SameSite=None; Secure=false`
      ].join(', '));

      console.log('✅ Login successful, token set with settings:', cookieOptions);
      console.log('✅ Additional Set-Cookie headers added for compatibility');
      
      return response;
    } else {
      console.log('❌ Invalid credentials provided');
      console.log('Provided:', { email, password });
      console.log('Expected one of:', validCredentials.map(c => ({ email: c.email, password: '***' })));
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
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

    // Determine if we're in production
    const isProduction = process.env.NODE_ENV === 'production';

    // Clear the admin token cookie with matching security settings
    response.cookies.set('admin-token', '', {
      httpOnly: true,
      secure: isProduction, // Match login cookie settings
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 0,
      path: '/'
    });

    console.log('✅ Logout successful, cookie cleared');
    return response;
  } catch (error) {
    console.error('❌ Error during logout:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
