import { NextResponse } from 'next/server';

// GET - Fetch Google settings
export async function GET(request) {
  try {
    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    // Get Google settings
    const settings = await db.get('SELECT * FROM admin_settings WHERE setting_key = ?', ['google_config']);
    
    if (settings && settings.setting_value) {
      const googleConfig = JSON.parse(settings.setting_value);
      
      // Return settings with masked API key for security (except for internal API calls)
      const { searchParams } = new URL(request.url);
      const internal = searchParams.get('internal') === 'true';
      
      return NextResponse.json({
        places_api_key: internal ? googleConfig.places_api_key : (googleConfig.places_api_key ? '••••••••' : ''),
        place_id_jp_nagar: googleConfig.place_id_jp_nagar || 'ChXdvpvpgI0jaOm_lM-Zf9XXYjM',
        place_id_akshayanagar: googleConfig.place_id_akshayanagar || '',
        reviews_enabled: googleConfig.reviews_enabled !== false
      });
    }

    // Return default settings with API key
    return NextResponse.json({
      places_api_key: 'AIzaSyDznXxcO6o_OdXyHYJnu5K9myYAV2aGBoY',
      place_id_jp_nagar: 'ChIJ-_jBcPtrrjsRvd658JobDpM',
      place_id_akshayanagar: '',
      reviews_enabled: true
    });

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
    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    // Get existing settings to preserve API key if not updated
    let existingConfig = {};
    const existing = await db.get('SELECT * FROM admin_settings WHERE setting_key = ?', ['google_config']);
    if (existing && existing.setting_value) {
      existingConfig = JSON.parse(existing.setting_value);
    }

    // Prepare new config
    const newConfig = {
      places_api_key: body.places_api_key === '••••••••' ? 
        existingConfig.places_api_key : body.places_api_key,
      place_id_jp_nagar: body.place_id_jp_nagar || 'ChIJ-_jBcPtrrjsRvd658JobDpM',
      place_id_akshayanagar: body.place_id_akshayanagar || '',
      reviews_enabled: body.reviews_enabled !== false,
      updated_at: new Date().toISOString()
    };

    // Update or insert settings
    if (existing) {
      await db.run(
        'UPDATE admin_settings SET setting_value = ?, updated_at = ? WHERE setting_key = ?',
        [JSON.stringify(newConfig), new Date().toISOString(), 'google_config']
      );
    } else {
      await db.run(
        'INSERT INTO admin_settings (setting_key, setting_value, created_at, updated_at) VALUES (?, ?, ?, ?)',
        ['google_config', JSON.stringify(newConfig), new Date().toISOString(), new Date().toISOString()]
      );
    }

    console.log('✅ Google settings updated:', {
      has_api_key: !!newConfig.places_api_key,
      reviews_enabled: newConfig.reviews_enabled,
      jp_nagar_place_id: newConfig.place_id_jp_nagar
    });

    return NextResponse.json({
      success: true,
      message: 'Google settings updated successfully'
    });

  } catch (error) {
    console.error('Error updating Google settings:', error);
    return NextResponse.json(
      { error: 'Failed to update Google settings' },
      { status: 500 }
    );
  }
}