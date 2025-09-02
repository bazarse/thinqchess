import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();

    // Save course registration to SimpleDB
    const SimpleDatabase = (await import('../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    console.log('📚 Course Registration Data Received:', body);

    // Validate required fields
    const requiredFields = ['participant_first_name', 'participant_last_name', 'email'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Insert course registration into SimpleDB
    const result = await db.run(`
      INSERT INTO registrations (
        participant_first_name, participant_middle_name, participant_last_name,
        email, phone, dob, gender, age, course_type, 
        father_first_name, father_last_name, father_email, father_phone,
        mother_first_name, mother_last_name, mother_email, mother_phone,
        country, state, city, address, pincode,
        coaching_mode, coaching_city, preferred_centre,
        heard_from, referral_first_name, referral_last_name, other_source,
        amount_paid, payment_status, type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      body.participant_first_name,
      body.student_middle_name || null,
      body.participant_last_name,
      body.email,
      body.phone || null,
      body.dob || null,
      body.gender || null,
      body.age || null,
      body.course_type || 'course',
      body.father_name ? body.father_name.split(' ')[0] : null,
      body.father_name ? body.father_name.split(' ').slice(1).join(' ') : null,
      body.father_email || null,
      body.father_phone || null,
      body.mother_name ? body.mother_name.split(' ')[0] : null,
      body.mother_name ? body.mother_name.split(' ').slice(1).join(' ') : null,
      body.mother_email || null,
      body.mother_phone || null,
      body.country || null,
      body.state || null,
      body.city || null,
      body.address || null,
      body.pincode || null,
      body.coaching_mode || body.course_type || null,
      body.coaching_city || null,
      body.preferred_centre || null,
      body.heard_from || null,
      body.referral_name ? body.referral_name.split(' ')[0] : null,
      body.referral_name ? body.referral_name.split(' ').slice(1).join(' ') : null,
      body.other_source || null,
      0, // Course registration is free
      'completed', // No payment required
      'course'
    ]);

    // Get the created registration
    const savedRegistration = await db.get('SELECT * FROM registrations WHERE id = ?', [result.lastInsertRowid]);

    console.log('✅ Course Registration Saved:', savedRegistration);

    return NextResponse.json({
      success: true,
      message: 'Course registration submitted successfully',
      registration: savedRegistration
    });

  } catch (error) {
    console.error('Error saving course registration:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to save course registration',
        details: error.message 
      },
      { status: 500 }
    );
  }
}