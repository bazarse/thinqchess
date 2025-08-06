import { NextResponse } from 'next/server';
import { initializeDatabase } from '../../../../lib/database.js';

export async function GET() {
  try {
    console.log('🧪 Testing PostgreSQL database connection...');
    
    // Initialize database
    await initializeDatabase();
    
    return NextResponse.json({
      success: true,
      message: 'PostgreSQL database connection successful!',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Database test failed:', error);
    return NextResponse.json(
      { 
        error: 'Database connection failed',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
