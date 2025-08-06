import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();

    // Save course registration to SQLite
    const { getDB } = require('../../../../lib/database.js');
    const db = getDB();

    console.log('📝 Course Registration Data Received:', body);

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

    // Parse father and mother names if they come as combined strings
    const parseName = (fullName) => {
      if (!fullName) return { first: '', middle: '', last: '' };
      const parts = fullName.trim().split(' ');
      if (parts.length === 1) return { first: parts[0], middle: '', last: '' };
      if (parts.length === 2) return { first: parts[0], middle: '', last: parts[1] };
      return { first: parts[0], middle: parts.slice(1, -1).join(' '), last: parts[parts.length - 1] };
    };

    const fatherName = parseName(body.father_name);
    const motherName = parseName(body.mother_name);
    const referralName = parseName(body.referral_name);

    // Insert course registration into SQLite with all fields
    const insertStmt = db.prepare(`
      INSERT INTO tournament_registrations (
        participant_first_name, participant_middle_name, participant_last_name,
        email, phone, dob, gender, age, course_type, classes_for,
        father_first_name, father_middle_name, father_last_name, father_email, father_phone,
        mother_first_name, mother_middle_name, mother_last_name, mother_email, mother_phone,
        country, country_code, state, city, address_line1, address_line2, address, pincode,
        coaching_mode, coaching_city, preferred_centre,
        heard_from, referral_first_name, referral_last_name, other_source,
        amount_paid, payment_status, payment_id, type,
        terms_condition_one, terms_condition_two
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      // Basic participant info
      body.participant_first_name,
      body.student_middle_name || '',
      body.participant_last_name,
      body.email,
      body.phone,
      body.dob || null,
      body.gender || null,
      calculateAge(body.dob),
      body.course_type || body.mode || 'General Course',
      body.classes_for || 'Child', // Default to Child if not specified

      // Father details
      fatherName.first,
      fatherName.middle,
      fatherName.last,
      body.father_email || null,
      body.father_phone || null,

      // Mother details
      motherName.first,
      motherName.middle,
      motherName.last,
      body.mother_email || null,
      body.mother_phone || null,

      // Address details
      body.country || null,
      body.country_code || null,
      body.state || null,
      body.city || null,
      body.address_line1 || null,
      body.address_line2 || null,
      body.address || null, // Combined address for backward compatibility
      body.pincode || null,

      // Coaching preferences
      body.mode || null, // Online/Offline
      body.coaching_city || null,
      body.preferred_centre || null,

      // Reference information
      body.heard_from || null,
      referralName.first,
      referralName.last,
      body.other_source || null,

      // Payment details
      0, // Course registration is free
      'completed', // No payment required
      `course_${Date.now()}`, // Generate unique ID
      'course',

      // Terms & Conditions
      body.Terms_and_condition_one || 'No',
      body.Terms_and_condition_two || 'No'
    );

    const savedRegistration = db.prepare('SELECT * FROM tournament_registrations WHERE id = ?').get(result.lastInsertRowid);

    console.log('✅ Course Registration Saved:', savedRegistration);

    return NextResponse.json({
      success: true,
      message: 'Course registration completed successfully',
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
