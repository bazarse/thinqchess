import { NextResponse } from 'next/server';

// GET - Fetch payment settings
export async function GET() {
  try {
    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();
    
    const settings = db.prepare('SELECT * FROM admin_settings ORDER BY id DESC LIMIT 1').get();
    
    let paymentSettings = {
      payment_mode: 'razorpay',
      razorpay_key_id: 'rzp_live_z71oXRZ0avccLv',
      razorpay_key_secret: 'uNuvlB1ovlLeGTUmyBQi6qPU',
      razorpay_webhook_secret: '',
      test_mode: false
    };

    if (settings && settings.payment_settings) {
      try {
        const storedSettings = typeof settings.payment_settings === 'string' 
          ? JSON.parse(settings.payment_settings) 
          : settings.payment_settings;
        
        paymentSettings = { ...paymentSettings, ...storedSettings };
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
    const { payment_mode, razorpay_key_id, razorpay_key_secret, razorpay_webhook_secret, test_mode } = body;

    // Validate required fields
    if (!razorpay_key_id || !razorpay_key_secret) {
      return NextResponse.json(
        { error: 'Razorpay Key ID and Secret are required' },
        { status: 400 }
      );
    }

    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();

    const paymentSettings = {
      payment_mode: payment_mode || 'razorpay',
      razorpay_key_id,
      razorpay_key_secret,
      razorpay_webhook_secret: razorpay_webhook_secret || '',
      test_mode: test_mode || false
    };

    // Check if settings exist
    const existing = db.prepare('SELECT * FROM admin_settings ORDER BY id DESC LIMIT 1').get();

    if (existing) {
      // Update existing settings
      db.prepare(`
        UPDATE admin_settings
        SET payment_settings = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        JSON.stringify(paymentSettings),
        existing.id
      );
    } else {
      // Insert new settings
      db.prepare(`
        INSERT INTO admin_settings (payment_settings)
        VALUES (?)
      `).run(JSON.stringify(paymentSettings));
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