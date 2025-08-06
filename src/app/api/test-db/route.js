import { NextResponse } from 'next/server';
import { initializeDatabase } from '../../../../lib/database.js';

export async function GET() {
  try {
    console.log('🧪 Testing SQLite database connection...');

    // Initialize database
    initializeDatabase();

    return NextResponse.json({
      success: true,
      message: 'SQLite database connection successful!',
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
