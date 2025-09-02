import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const SimpleDatabase = (await import('../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();
    
    // Get Google settings
    const settings = await db.get('SELECT * FROM admin_settings WHERE setting_key = ?', ['google_config']);
    
    if (settings && settings.setting_value) {
      const googleConfig = JSON.parse(settings.setting_value);
      
      return NextResponse.json({
        success: true,
        has_api_key: !!googleConfig.places_api_key,
        api_key_length: googleConfig.places_api_key ? googleConfig.places_api_key.length : 0,
        api_key_preview: googleConfig.places_api_key ? googleConfig.places_api_key.substring(0, 10) + '...' : 'None',
        reviews_enabled: googleConfig.reviews_enabled,
        place_id: googleConfig.place_id_jp_nagar
      });
    }
    
    return NextResponse.json({
      success: false,
      message: 'No Google config found'
    });
    
  } catch (error) {
    console.error('Test Google API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}