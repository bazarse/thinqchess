import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();

    // Save tournament registration to PostgreSQL
    const { pool } = require('../../../../../lib/database.js');
    
    // Validate required fields (using form field names)
    const requiredFields = ['particpantFirstName', 'particpantLastName', 'mail_id', 'phone_no'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Insert tournament registration into PostgreSQL with all fields

    // Calculate age from DOB if provided
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

    const result = await pool.query(`
      INSERT INTO tournament_registrations (
        tournament_id, participant_first_name, participant_middle_name, participant_last_name,
        email, phone, dob, gender, age, tournament_type, fide_id,
        country, country_code, state, city, address, amount_paid, discount_code,
        discount_amount, payment_id, razorpay_order_id, payment_status, type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING id
    `, [
      body.tournament_id || null,
      body.particpantFirstName,
      body.particpantMiddleName || null,
      body.particpantLastName,
      body.mail_id,
      body.phone_no,
      body.dob || null,
      body.gender || null,
      calculateAge(body.dob),
      body.tournament_type || 'open',
      body.fidaID || null, // FIDE ID
      body.country || null,
      body.country_code || null,
      body.state || null,
      body.city || null,
      body.location || null, // Address
      parseFloat(body.amount_paid) || 0,
      body.discount_code || null,
      parseFloat(body.discount_amount) || 0,
      body.payment_id || null,
      body.razorpay_order_id || null,
      body.payment_status || 'pending',
      'tournament'
    ]);

    // Get the created registration
    const savedRegistrationResult = await pool.query('SELECT * FROM tournament_registrations WHERE id = $1', [result.rows[0].id]);
    const savedRegistration = savedRegistrationResult.rows[0];

    // Update discount code usage if used
    if (body.discount_code) {
      await pool.query('UPDATE discount_codes SET used_count = used_count + 1 WHERE code = $1', [body.discount_code]);
    }

    console.log('✅ Tournament Registration Saved:', savedRegistration);

    return NextResponse.json({
      success: true,
      message: 'Tournament registration completed successfully',
      registration: {
        ...savedRegistration,
        participant_name: `${savedRegistration.participant_first_name} ${savedRegistration.participant_last_name}`
      }
    });

  } catch (error) {
    console.error('Error saving tournament registration:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to save tournament registration',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
