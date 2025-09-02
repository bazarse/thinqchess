import { NextResponse } from 'next/server';

// GET - Fetch payment settings
export async function GET(request) {
  try {
    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    // Get payment settings
    const settings = await db.get('SELECT * FROM admin_settings WHERE setting_key = ?', ['payment_config']);
    
    if (settings && settings.setting_value) {
      const paymentConfig = JSON.parse(settings.setting_value);
      
      // Return settings with masked secrets for security
      return NextResponse.json({
        payment_mode: paymentConfig.payment_mode || 'razorpay',
        razorpay_key_id: paymentConfig.razorpay_key_id || '',
        razorpay_key_secret: paymentConfig.razorpay_key_secret ? '••••••••' : '',
        razorpay_webhook_secret: paymentConfig.razorpay_webhook_secret ? '••••••••' : '',
        test_mode: paymentConfig.test_mode || false
      });
    }

    // Return default settings
    return NextResponse.json({
      payment_mode: 'razorpay',
      razorpay_key_id: '',
      razorpay_key_secret: '',
      razorpay_webhook_secret: '',
      test_mode: true // Default to test mode for safety
    });

  } catch (error) {
    console.error('Error fetching payment settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment settings' },
      { status: 500 }
    );
  }
}

// POST - Update payment settings
export async function POST(request) {
  try {
    const body = await request.json();
    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    // Validate required fields
    if (!body.razorpay_key_id) {
      return NextResponse.json(
        { error: 'Razorpay Key ID is required' },
        { status: 400 }
      );
    }

    // Get existing settings to preserve secrets if not updated
    let existingConfig = {};
    const existing = await db.get('SELECT * FROM admin_settings WHERE setting_key = ?', ['payment_config']);
    if (existing && existing.setting_value) {
      existingConfig = JSON.parse(existing.setting_value);
    }

    // Prepare new config
    const newConfig = {
      payment_mode: body.payment_mode || 'razorpay',
      razorpay_key_id: body.razorpay_key_id,
      razorpay_key_secret: body.razorpay_key_secret === '••••••••' ? 
        existingConfig.razorpay_key_secret : body.razorpay_key_secret,
      razorpay_webhook_secret: body.razorpay_webhook_secret === '••••••••' ? 
        existingConfig.razorpay_webhook_secret : body.razorpay_webhook_secret,
      test_mode: body.test_mode || false,
      updated_at: new Date().toISOString()
    };

    // Update or insert settings
    if (existing) {
      await db.run(
        'UPDATE admin_settings SET setting_value = ?, updated_at = ? WHERE setting_key = ?',
        [JSON.stringify(newConfig), new Date().toISOString(), 'payment_config']
      );
    } else {
      await db.run(
        'INSERT INTO admin_settings (setting_key, setting_value, created_at, updated_at) VALUES (?, ?, ?, ?)',
        ['payment_config', JSON.stringify(newConfig), new Date().toISOString(), new Date().toISOString()]
      );
    }

    console.log('✅ Payment settings updated:', {
      payment_mode: newConfig.payment_mode,
      test_mode: newConfig.test_mode,
      has_key_id: !!newConfig.razorpay_key_id,
      has_secret: !!newConfig.razorpay_key_secret
    });

    return NextResponse.json({
      success: true,
      message: 'Payment settings updated successfully'
    });

  } catch (error) {
    console.error('Error updating payment settings:', error);
    return NextResponse.json(
      { error: 'Failed to update payment settings' },
      { status: 500 }
    );
  }
}