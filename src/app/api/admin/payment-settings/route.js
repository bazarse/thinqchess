import { NextResponse } from 'next/server';

// GET - Fetch payment settings
export async function GET() {
  try {
    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();
    
    // Get payment settings from admin_settings table
    const settings = db.prepare('SELECT * FROM admin_settings ORDER BY id DESC LIMIT 1').get();
    
    if (!settings) {
      // Return default payment settings
      return NextResponse.json({
        payment_mode: 'demo',
        razorpay_key_id: '',
        razorpay_key_secret: '',
        razorpay_webhook_secret: '',
        demo_payment_enabled: true,
        test_mode: true
      });
    }

    // Parse payment settings from JSON or return defaults
    let paymentSettings = {
      payment_mode: 'demo',
      razorpay_key_id: '',
      razorpay_key_secret: '',
      razorpay_webhook_secret: '',
      demo_payment_enabled: true,
      test_mode: true
    };

    if (settings.payment_settings) {
      try {
        const parsed = typeof settings.payment_settings === 'string' 
          ? JSON.parse(settings.payment_settings) 
          : settings.payment_settings;
        paymentSettings = { ...paymentSettings, ...parsed };
      } catch (e) {
        console.error('Error parsing payment settings:', e);
      }
    }

    return NextResponse.json(paymentSettings);

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
    const { 
      payment_mode, 
      razorpay_key_id, 
      razorpay_key_secret, 
      razorpay_webhook_secret,
      demo_payment_enabled,
      test_mode 
    } = body;

    // Validate payment mode
    if (!['demo', 'razorpay'].includes(payment_mode)) {
      return NextResponse.json(
        { error: 'Invalid payment mode' },
        { status: 400 }
      );
    }

    // If Razorpay mode, validate required fields
    if (payment_mode === 'razorpay') {
      if (!razorpay_key_id || !razorpay_key_secret) {
        return NextResponse.json(
          { error: 'Razorpay Key ID and Secret are required for Razorpay mode' },
          { status: 400 }
        );
      }

      // Validate key format
      const keyPrefix = test_mode ? 'rzp_test_' : 'rzp_live_';
      if (!razorpay_key_id.startsWith(keyPrefix)) {
        return NextResponse.json(
          { error: `Razorpay Key ID should start with ${keyPrefix} for ${test_mode ? 'test' : 'live'} mode` },
          { status: 400 }
        );
      }
    }

    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();

    // Prepare payment settings object
    const paymentSettings = {
      payment_mode,
      razorpay_key_id: razorpay_key_id || '',
      razorpay_key_secret: razorpay_key_secret || '',
      razorpay_webhook_secret: razorpay_webhook_secret || '',
      demo_payment_enabled: demo_payment_enabled !== false,
      test_mode: test_mode !== false
    };

    // Check if settings exist
    const existing = db.prepare('SELECT * FROM admin_settings ORDER BY id DESC LIMIT 1').get();

    if (existing) {
      // Update existing settings
      db.prepare(`
        UPDATE admin_settings
        SET payment_settings = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(JSON.stringify(paymentSettings), existing.id);
    } else {
      // Insert new settings
      db.prepare(`
        INSERT INTO admin_settings (payment_settings, tournament_fee, registration_fee, max_participants)
        VALUES (?, ?, ?, ?)
      `).run(JSON.stringify(paymentSettings), 500, 400, 50);
    }

    // Update environment variables for Razorpay (in memory for this session)
    if (payment_mode === 'razorpay') {
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = razorpay_key_id;
      process.env.RAZORPAY_KEY_SECRET = razorpay_key_secret;
      process.env.RAZORPAY_WEBHOOK_SECRET = razorpay_webhook_secret;
      process.env.DEVELOPMENT_MODE = test_mode ? 'true' : 'false';
    } else {
      process.env.DEVELOPMENT_MODE = 'true'; // Force demo mode
    }

    return NextResponse.json({
      success: true,
      message: 'Payment settings updated successfully',
      settings: paymentSettings
    });

  } catch (error) {
    console.error('Error updating payment settings:', error);
    return NextResponse.json(
      { error: 'Failed to update payment settings' },
      { status: 500 }
    );
  }
}
