import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();

    console.log('🎯 REGISTRATION API CALLED:', {
      timestamp: new Date().toISOString(),
      participant: `${body.participantFirstName} ${body.participantLastName}`,
      email: body.email,
      payment_id: body.payment_id,
      payment_status: body.payment_status,
      tournament_id: body.tournament_id,
      tournament_type: body.tournament_type
    });

    // Immediate database save to reduce lag
    const startTime = Date.now();

    // Save tournament registration to SimpleDatabase
    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();
    
    // Validate required fields
    const { participantFirstName, participantLastName, email, phone } = body;
    
    if (!participantFirstName || !participantLastName || !email || !phone) {
      return NextResponse.json(
        { error: 'First name, last name, email, and phone are required' },
        { status: 400 }
      );
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

    // Get the active tournament to ensure proper linking
    const activeTournament = await db.get('SELECT * FROM tournaments WHERE is_active = 1 LIMIT 1');
    const tournamentId = body.tournament_id || (activeTournament ? activeTournament.id : null);

    const result = await db.run(`
      INSERT INTO tournament_registrations (
        tournament_id, participant_first_name, participant_middle_name, participant_last_name,
        email, phone, dob, gender, age, tournament_type, fide_id,
        country, country_code, state, city, address, amount_paid, discount_code,
        discount_amount, payment_id, razorpay_order_id, payment_status, type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      tournamentId,
      participantFirstName,
      body.participantMiddleName || null,
      participantLastName,
      email,
      phone,
      body.dob || null,
      body.gender || null,
      calculateAge(body.dob),
      body.tournament_type || 'open',
      body.fideId || null,
      body.country || null,
      body.country_code || null,
      body.state || null,
      body.city || null,
      body.location || null,
      parseFloat(body.amount_paid) || 0,
      body.discount_code || null,
      parseFloat(body.discount_amount) || 0,
      body.payment_id || null,
      body.razorpay_order_id || null,
      body.payment_status || 'completed',
      'tournament'
    ]);

    // Get the created registration
    const savedRegistration = db.prepare('SELECT * FROM tournament_registrations WHERE id = ?').get(result.lastInsertRowid);

    console.log('✅ REGISTRATION SAVED TO DATABASE:', {
      registration_id: savedRegistration.id,
      participant_name: `${savedRegistration.participant_first_name} ${savedRegistration.participant_last_name}`,
      email: savedRegistration.email,
      payment_status: savedRegistration.payment_status,
      payment_id: savedRegistration.payment_id,
      tournament_id: savedRegistration.tournament_id,
      created_at: savedRegistration.created_at
    });

    // Update discount code usage if used
    if (body.discount_code) {
      console.log('🔄 Updating discount code usage for:', body.discount_code);

      // First try exact match
      let updateResult = db.prepare('UPDATE discount_codes SET used_count = used_count + 1 WHERE code = ? AND is_active = 1').run(body.discount_code);

      // If no exact match and code contains underscore, try prefix match
      if (updateResult.changes === 0 && body.discount_code.includes('_')) {
        const prefix = body.discount_code.split('_')[0] + '_';
        console.log('🔄 Trying prefix update for:', prefix);
        updateResult = db.prepare('UPDATE discount_codes SET used_count = used_count + 1 WHERE code = ? AND is_active = 1').run(prefix);
      }

      // If still no match, try finding any prefix that matches
      if (updateResult.changes === 0) {
        const allPrefixCodes = db.prepare(`
          SELECT * FROM discount_codes
          WHERE code_type = 'prefix' AND is_active = 1
        `).all();

        for (const prefixCode of allPrefixCodes) {
          const prefix = prefixCode.code || prefixCode.prefix;
          if (prefix && body.discount_code.toUpperCase().startsWith(prefix.toUpperCase())) {
            console.log('🔄 Updating prefix code usage:', prefix);
            db.prepare('UPDATE discount_codes SET used_count = used_count + 1 WHERE id = ?').run(prefixCode.id);
            break;
          }
        }
      }

      console.log('✅ Discount code usage updated');
    }

    const processingTime = Date.now() - startTime;
    console.log('✅ Tournament Registration Saved:', {
      ...savedRegistration,
      processing_time_ms: processingTime
    });

    // Send immediate response to reduce perceived lag
    return NextResponse.json({
      success: true,
      message: 'Tournament registration completed successfully',
      registration: {
        ...savedRegistration,
        participant_name: `${savedRegistration.participant_first_name} ${savedRegistration.participant_last_name}`,
        processing_time: processingTime
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
