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

    // Development mode - use hardcoded credentials
    if (process.env.DEVELOPMENT_MODE === 'true') {
      console.log('Development mode login');
      
      if ((email === 'admin@thinqchess.com' && password === 'admin123') || 
          (email === 'admin' && password === '1234')) {
        
        console.log('Valid credentials, creating token');
        
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
          secure: false, // Disable secure in development
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          path: '/'
        });

        console.log('Login successful, token set');
        console.log('Cookie settings:', {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000,
          path: '/'
        });
        return response;
      } else {
        console.log('Invalid credentials');
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }
    } else {
      // Production mode - use environment variables
      console.log('Production mode login with environment variables');

      // Use environment variables for admin credentials
      const adminEmail = process.env.ADMIN_USERNAME || process.env.ADMIN_EMAIL || 'admin';
      const adminPassword = process.env.ADMIN_PASSWORD || '1234';

      if (email === adminEmail && password === adminPassword) {
        console.log('Valid admin credentials from environment');

        const token = jwt.sign(
          {
            email: adminEmail,
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
            email: adminEmail,
            role: 'admin'
          }
        });

        response.cookies.set('admin-token', token, {
          httpOnly: true,
          secure: false, // Disable secure in development
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000,
          path: '/'
        });

        return response;
      } else {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }
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
      secure: false, // Disable secure in development
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
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
