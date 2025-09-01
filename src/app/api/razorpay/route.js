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
    const { getDB } = require('../../../../lib/database.js');
    const db = getDB();
    const settings = db.prepare('SELECT * FROM admin_settings ORDER BY id DESC LIMIT 1').get();
    
    let razorpayKeyId = 'rzp_live_z71oXRZ0avccLv'; // Default live key
    let razorpayKeySecret = 'uNuvlB1ovlLeGTUmyBQi6qPU'; // Default live secret
    
    if (settings && settings.payment_settings) {
      try {
        const paymentSettings = typeof settings.payment_settings === 'string' 
          ? JSON.parse(settings.payment_settings) 
          : settings.payment_settings;
        
        if (paymentSettings.razorpay_key_id) {
          razorpayKeyId = paymentSettings.razorpay_key_id;
        }
        if (paymentSettings.razorpay_key_secret) {
          razorpayKeySecret = paymentSettings.razorpay_key_secret;
        }
      } catch (e) {
        console.error('Error parsing payment settings:', e);
      }
    }

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
    const { getDB } = require('../../../../lib/database.js');
    const db = getDB();
    const settings = db.prepare('SELECT * FROM admin_settings ORDER BY id DESC LIMIT 1').get();
    
    let razorpayKeySecret = 'uNuvlB1ovlLeGTUmyBQi6qPU'; // Default live secret
    
    if (settings && settings.payment_settings) {
      try {
        const paymentSettings = typeof settings.payment_settings === 'string' 
          ? JSON.parse(settings.payment_settings) 
          : settings.payment_settings;
        
        if (paymentSettings.razorpay_key_secret) {
          razorpayKeySecret = paymentSettings.razorpay_key_secret;
        }
      } catch (e) {
        console.error('Error parsing payment settings:', e);
      }
    }

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
      // Save registration data to SQLite database
      const { getDB } = require('../../../../lib/database.js');
      const db = getDB();

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
