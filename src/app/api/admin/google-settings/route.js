import { NextResponse } from 'next/server';

// GET - Fetch Google settings
export async function GET() {
  try {
    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();
    
    // Get Google settings from admin_settings table
    const settings = db.prepare('SELECT * FROM admin_settings ORDER BY id DESC LIMIT 1').get();
    
    if (!settings) {
      // Return default Google settings
      return NextResponse.json({
        places_api_key: '',
        place_id_jp_nagar: 'ChXdvpvpgI0jaOm_lM-Zf9XXYjM',
        place_id_akshayanagar: '',
        reviews_enabled: true
      });
    }

    // Parse Google settings from JSON or return defaults
    let googleSettings = {
      places_api_key: '',
      place_id_jp_nagar: 'ChXdvpvpgI0jaOm_lM-Zf9XXYjM',
      place_id_akshayanagar: '',
      reviews_enabled: true
    };

    if (settings.google_settings) {
      try {
        const parsed = typeof settings.google_settings === 'string' 
          ? JSON.parse(settings.google_settings) 
          : settings.google_settings;
        googleSettings = { ...googleSettings, ...parsed };
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
    const { 
      places_api_key, 
      place_id_jp_nagar, 
      place_id_akshayanagar,
      reviews_enabled
    } = body;

    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();

    // Prepare Google settings object
    const googleSettings = {
      places_api_key: places_api_key || '',
      place_id_jp_nagar: place_id_jp_nagar || 'ChXdvpvpgI0jaOm_lM-Zf9XXYjM',
      place_id_akshayanagar: place_id_akshayanagar || '',
      reviews_enabled: reviews_enabled !== false
    };

    // Check if settings exist
    const existing = db.prepare('SELECT * FROM admin_settings ORDER BY id DESC LIMIT 1').get();

    if (existing) {
      // Update existing settings
      db.prepare(`
        UPDATE admin_settings
        SET google_settings = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(JSON.stringify(googleSettings), existing.id);
    } else {
      // Insert new settings
      db.prepare(`
        INSERT INTO admin_settings (google_settings, tournament_fee, registration_fee, max_participants)
        VALUES (?, ?, ?, ?)
      `).run(JSON.stringify(googleSettings), 500, 400, 50);
    }

    // Update environment variable for Google API key (in memory for this session)
    if (places_api_key) {
      process.env.GOOGLE_PLACES_API_KEY = places_api_key;
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
