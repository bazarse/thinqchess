import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, currency = 'INR' } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    console.log('💳 Creating Razorpay Order:', {
      amount_received: amount,
      amount_in_paise: amount * 100,
      currency
    });

    // Get Razorpay credentials from admin settings
    const SimpleDatabase = (await import('../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();
    const settings = await db.get('SELECT * FROM admin_settings WHERE setting_key = ?', ['payment_config']);
    
    // Default test credentials for safety
    let razorpayKeyId = 'rzp_test_default';
    let razorpayKeySecret = 'test_secret_default';
    let isTestMode = true;
    
    if (settings && settings.setting_value) {
      try {
        const paymentConfig = JSON.parse(settings.setting_value);
        
        if (paymentConfig.razorpay_key_id && paymentConfig.razorpay_key_secret) {
          razorpayKeyId = paymentConfig.razorpay_key_id;
          razorpayKeySecret = paymentConfig.razorpay_key_secret;
          isTestMode = paymentConfig.test_mode || false;
        }
      } catch (e) {
        console.error('Error parsing payment settings:', e);
      }
    }

    console.log('💳 Payment Mode:', isTestMode ? 'TEST MODE' : 'LIVE MODE');
    console.log('🔑 Using Key ID:', razorpayKeyId.substring(0, 12) + '...');

    try {
      const Razorpay = (await import('razorpay')).default;

      const razorpay = new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
      });

      const amountInPaise = Math.round(amount * 100); // Ensure integer paise

      const options = {
        amount: amountInPaise, // Amount in paise
        currency: currency,
        receipt: `receipt_${Date.now()}`,
        notes: {
          purpose: 'Tournament Registration',
          academy: 'ThinQ Chess Academy',
          amount_rupees: amount.toString()
        }
      };

      console.log('🔧 Razorpay order options:', options);

      const order = await razorpay.orders.create(options);

      console.log('✅ Razorpay order created:', {
        order_id: order.id,
        amount_paise: order.amount,
        amount_rupees: order.amount / 100,
        currency: order.currency
      });

      return NextResponse.json({
        success: true,
        order: order,
        key: razorpayKeyId,
        message: 'Order created successfully'
      });

    } catch (razorpayError) {
      console.error('Razorpay error:', razorpayError);
      return NextResponse.json(
        { error: 'Failed to create Razorpay order' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Verify payment
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      formData
    } = body;

    // Get Razorpay secret from admin settings for payment verification
    const SimpleDatabase = (await import('../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();
    const settings = await db.get('SELECT * FROM admin_settings WHERE setting_key = ?', ['payment_config']);
    
    let razorpayKeySecret = 'test_secret_default';
    let isTestMode = true;
    
    if (settings && settings.setting_value) {
      try {
        const paymentConfig = JSON.parse(settings.setting_value);
        
        if (paymentConfig.razorpay_key_secret) {
          razorpayKeySecret = paymentConfig.razorpay_key_secret;
          isTestMode = paymentConfig.test_mode || false;
        }
      } catch (e) {
        console.error('Error parsing payment settings:', e);
      }
    }

    console.log('🔐 Verifying payment in:', isTestMode ? 'TEST MODE' : 'LIVE MODE');

    // Payment verification
    try {
      const crypto = await import('crypto');

      const body_string = razorpay_order_id + "|" + razorpay_payment_id;
      const expected_signature = crypto
        .createHmac('sha256', razorpayKeySecret)
        .update(body_string.toString())
        .digest('hex');

      if (expected_signature !== razorpay_signature) {
        return NextResponse.json(
          { error: 'Payment verification failed' },
          { status: 400 }
        );
      }

      console.log('✅ Payment verified successfully');

      // Payment verified - save registration
      // Save registration data to SimpleDatabase
      const SimpleDatabase = (await import('../../../../lib/simple-db.js')).default;
      const db = new SimpleDatabase();

      // Calculate age from DOB
      const calculateAge = (dob) => {
        if (!dob) return null;
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      };

      // Insert tournament registration into SQLite
      const insertStmt = db.prepare(`
        INSERT INTO tournament_registrations (
          tournament_id, participant_first_name, participant_middle_name, participant_last_name,
          email, phone, dob, gender, age, tournament_type, fide_id,
          country, country_code, state, city, address, amount_paid, discount_code,
          discount_amount, payment_id, razorpay_order_id, payment_status, type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = insertStmt.run(
        formData.tournament_id || null,
        formData.particpantFirstName,
        formData.particpantMiddleName || null,
        formData.particpantLastName,
        formData.mail_id,
        formData.phone_no,
        formData.dob || null,
        formData.gender || null,
        calculateAge(formData.dob),
        formData.tournament_type || 'open',
        formData.fidaID || null,
        formData.country || null,
        formData.country_code || null,
        formData.state || null,
        formData.city || null,
        formData.location || null,
        parseFloat(formData.amount_paid) || 0,
        formData.discount_code || null,
        parseFloat(formData.discount_amount) || 0,
        razorpay_payment_id,
        razorpay_order_id,
        'completed',
        'tournament'
      );

      // Get the created registration
      const savedRegistration = db.prepare('SELECT * FROM tournament_registrations WHERE id = ?').get(result.lastInsertRowid);

      // Update discount code usage if used
      if (formData.discount_code) {
        db.prepare('UPDATE discount_codes SET used_count = used_count + 1 WHERE code = ?').run(formData.discount_code);
      }

      console.log('✅ Tournament Registration Saved:', savedRegistration);

      return NextResponse.json({
        success: true,
        message: 'Payment verified and registration completed',
        registration: {
          ...savedRegistration,
          participant_name: `${savedRegistration.participant_first_name} ${savedRegistration.participant_last_name}`
        }
      });

    } catch (verificationError) {
      console.error('Payment verification error:', verificationError);
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
