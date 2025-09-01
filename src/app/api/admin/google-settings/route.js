import { NextResponse } from 'next/server';

// GET - Fetch Google settings
export async function GET() {
  try {
    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();
    
    const settings = db.prepare('SELECT * FROM admin_settings ORDER BY id DESC LIMIT 1').get();
    
    let googleSettings = {
      places_api_key: 'AIzaSyDJoiBFa6DnFf7V9NUBucaaympbeoLps2w',
      place_id_jp_nagar: 'ChXdvpvpgI0jaOm_lM-Zf9XXYjM',
      place_id_akshayanagar: '',
      reviews_enabled: true
    };

    if (settings && settings.google_settings) {
      try {
        const storedSettings = typeof settings.google_settings === 'string' 
          ? JSON.parse(settings.google_settings) 
          : settings.google_settings;
        
        googleSettings = { ...googleSettings, ...storedSettings };
      } catch (e) {
        console.error('Error parsing Google settings:', e);
      }
    }
    
    return NextResponse.json(googleSettings);

  } catch (error) {
    console.error('Error fetching Google settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Google settings' },
      { status: 500 }
    );
  }
}

// POST - Update Google settings
export async function POST(request) {
  try {
    const body = await request.json();
    const { places_api_key, place_id_jp_nagar, place_id_akshayanagar, reviews_enabled } = body;

    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();

    const googleSettings = {
      places_api_key: places_api_key || 'AIzaSyDJoiBFa6DnFf7V9NUBucaaympbeoLps2w',
      place_id_jp_nagar: place_id_jp_nagar || 'ChXdvpvpgI0jaOm_lM-Zf9XXYjM',
      place_id_akshayanagar: place_id_akshayanagar || '',
      reviews_enabled: reviews_enabled !== undefined ? reviews_enabled : true
    };

    // Check if settings exist
    const existing = db.prepare('SELECT * FROM admin_settings ORDER BY id DESC LIMIT 1').get();

    if (existing) {
      // Update existing settings
      db.prepare(`
        UPDATE admin_settings
        SET google_settings = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        JSON.stringify(googleSettings),
        existing.id
      );
    } else {
      // Insert new settings
      db.prepare(`
        INSERT INTO admin_settings (google_settings)
        VALUES (?)
      `).run(JSON.stringify(googleSettings));
    }

    return NextResponse.json({
      success: true,
      message: 'Google settings updated successfully',
      settings: googleSettings
    });

  } catch (error) {
    console.error('Error updating Google settings:', error);
    return NextResponse.json(
      { error: 'Failed to update Google settings' },
      { status: 500 }
    );
  }
}