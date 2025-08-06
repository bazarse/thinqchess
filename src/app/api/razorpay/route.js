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

    // Use Razorpay test mode for development
    console.log('🎯 Creating Razorpay Order:', { amount, currency });

    // Demo mode for development (since we don't have real Razorpay keys)
    if (process.env.DEVELOPMENT_MODE === 'true') {
      console.log('🎯 Demo Mode: Creating mock Razorpay order');

      const mockOrder = {
        id: `order_demo_${Date.now()}`,
        entity: 'order',
        amount: amount * 100, // Amount in paise
        amount_paid: 0,
        amount_due: amount * 100,
        currency: currency,
        receipt: `receipt_${Date.now()}`,
        status: 'created',
        created_at: Math.floor(Date.now() / 1000),
        notes: {
          purpose: 'Tournament Registration',
          academy: 'ThinQ Chess Academy'
        }
      };

      return NextResponse.json({
        success: true,
        order: mockOrder,
        key: 'rzp_test_demo_key',
        message: 'Demo order created successfully'
      });
    }

    // Real Razorpay integration (for production)
    try {
      const Razorpay = (await import('razorpay')).default;

      const razorpay = new Razorpay({
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const options = {
        amount: amount * 100, // Amount in paise
        currency: currency,
        receipt: `receipt_${Date.now()}`,
        notes: {
          purpose: 'Tournament Registration',
          academy: 'ThinQ Chess Academy'
        }
      };

      const order = await razorpay.orders.create(options);

      return NextResponse.json({
        success: true,
        order: order,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
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

    // Development mode - simulate verification
    if (process.env.DEVELOPMENT_MODE === 'true') {
      console.log('🎯 Mock Payment Verification:', {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        signature: razorpay_signature
      });

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

      console.log('🎯 Tournament Registration Saved:', savedRegistration);

      return NextResponse.json({
        success: true,
        message: 'Payment verified and registration completed (development mode)',
        registration: {
          ...savedRegistration,
          participant_name: `${savedRegistration.participant_first_name} ${savedRegistration.participant_last_name}`
        }
      });
    }

    // Production mode - real verification
    try {
      const crypto = await import('crypto');

      const body_string = razorpay_order_id + "|" + razorpay_payment_id;
      const expected_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body_string.toString())
        .digest('hex');

      if (expected_signature === razorpay_signature) {
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

        return NextResponse.json({
          success: true,
          message: 'Payment verified and registration completed',
          registration: {
            ...savedRegistration,
            participant_name: `${savedRegistration.participant_first_name} ${savedRegistration.participant_last_name}`
          }
        });
      } else {
        return NextResponse.json(
          { error: 'Payment verification failed' },
          { status: 400 }
        );
      }
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
