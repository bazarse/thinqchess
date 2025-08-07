import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Testing database status...');
    
    const SimpleDatabase = (await import('../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();
    
    console.log('✅ Database instance created');
    
    // Test basic functionality
    const testResult = await db.all('SELECT 1 as test') || [];
    console.log('✅ Basic query works:', testResult);
    
    // Check if tables exist
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'") || [];
    console.log('📋 Available tables:', tables);
    
    // Check gallery_images table specifically
    let galleryCount = 0;
    try {
      const galleryResult = await db.get('SELECT COUNT(*) as count FROM gallery_images') || { count: 0 };
      galleryCount = galleryResult.count;
      console.log('🖼️ Gallery images count:', galleryCount);
    } catch (galleryError) {
      console.error('❌ Gallery table error:', galleryError.message);
    }
    
    // Check tournaments table
    let tournamentCount = 0;
    try {
      const tournamentResult = await db.get('SELECT COUNT(*) as count FROM tournaments') || { count: 0 };
      tournamentCount = tournamentResult.count;
      console.log('🏆 Tournaments count:', tournamentCount);
    } catch (tournamentError) {
      console.error('❌ Tournament table error:', tournamentError.message);
    }
    
    return NextResponse.json({
      success: true,
      database_working: true,
      tables: tables,
      gallery_count: galleryCount,
      tournament_count: tournamentCount,
      message: 'Database is working!'
    });
    
  } catch (error) {
    console.error('💥 Database test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
