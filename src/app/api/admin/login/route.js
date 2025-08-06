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
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        console.log('Login successful, token set');
        return response;
      } else {
        console.log('Invalid credentials');
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }
    } else {
      // Production mode - use Supabase authentication
      console.log('Production mode login with Supabase');

      try {
        const { supabase } = await import('../../../../../lib/supabase');

        // Check if admin user exists in Supabase
        const { data: adminUser, error: userError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', email)
          .single();

        if (userError || !adminUser) {
          // Fallback to environment variables for admin credentials
          const adminEmail = process.env.ADMIN_EMAIL || 'admin@thinqchess.com';
          const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

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
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              maxAge: 24 * 60 * 60 * 1000
            });

            return response;
          } else {
            return NextResponse.json(
              { error: 'Invalid credentials' },
              { status: 401 }
            );
          }
        }

        // Verify password (in production, you should hash passwords)
        if (adminUser.password === password ||
            (adminUser.password_hash && await verifyPassword(password, adminUser.password_hash))) {

          const token = jwt.sign(
            {
              email: adminUser.email,
              role: 'admin',
              id: adminUser.id
            },
            process.env.JWT_SECRET || 'thinqchess-secret-key-2024',
            { expiresIn: '24h' }
          );

          const response = NextResponse.json({
            success: true,
            message: 'Login successful',
            user: {
              email: adminUser.email,
              role: 'admin'
            }
          });

          response.cookies.set('admin-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
          });

          return response;
        } else {
          return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
          );
        }

      } catch (supabaseError) {
        console.error('Supabase authentication error:', supabaseError);

        // Fallback to environment variables
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@thinqchess.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        if (email === adminEmail && password === adminPassword) {
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
            message: 'Login successful (fallback)',
            user: {
              email: adminEmail,
              role: 'admin'
            }
          });

          response.cookies.set('admin-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
          });

          return response;
        } else {
          return NextResponse.json(
            { error: 'Authentication service unavailable' },
            { status: 503 }
          );
        }
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
