import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('🧹 Clearing all demo data...');
    
    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();
    
    // Clear all demo data
    const tablesToClear = [
      'tournaments',
      'tournament_registrations', 
      'registrations',
      'demo_requests',
      'gallery_images',
      'blogs',
      'uploaded_files'
    ];
    
    let clearedCount = 0;
    
    tablesToClear.forEach(tableName => {
      if (db.data[tableName]) {
        const count = db.data[tableName].length;
        db.data[tableName] = [];
        clearedCount += count;
        console.log(`🗑️ Cleared ${count} records from ${tableName}`);
      }
    });
    
    // Save the cleared data
    db.saveData();
    
    // Also clear global data to ensure fresh start
    global.simpleDbData = {
      admin_settings: [],
      tournaments: [],
      tournament_registrations: [],
      registrations: [],
      demo_requests: [],
      admin_users: [],
      discount_codes: [],
      gallery_images: [],
      blogs: [],
      uploaded_files: []
    };
    
    console.log(`✅ Cleared ${clearedCount} total demo records`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully cleared ${clearedCount} demo records`,
      cleared_tables: tablesToClear,
      total_cleared: clearedCount
    });
    
  } catch (error) {
    console.error('💥 Error clearing demo data:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
