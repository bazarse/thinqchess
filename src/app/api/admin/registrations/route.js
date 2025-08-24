import { NextResponse } from 'next/server';

// GET - Fetch all registrations
export async function GET(request) {
  try {
    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const ageFilter = searchParams.get('age_filter') || 'all';
    const search = searchParams.get('search') || '';
    const tournamentId = searchParams.get('tournament_id');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = (page - 1) * limit;

    // Build query based on filter
    let query = 'SELECT * FROM tournament_registrations';
    let params = [];
    let whereConditions = [];

    // Only show completed payments
    whereConditions.push('payment_status = ?');
    params.push('completed');

    console.log('🔍 ADMIN REGISTRATIONS QUERY:', {
      filter,
      ageFilter,
      search,
      tournamentId,
      page,
      limit,
      whereConditions,
      params
    });

    // Filter by type
    if (filter !== 'all') {
      whereConditions.push('type = ?');
      params.push(filter);
    }

    // Filter by tournament ID
    if (tournamentId) {
      whereConditions.push('tournament_id = ?');
      params.push(parseInt(tournamentId)); // Convert to integer
    }

    // Search functionality
    if (search) {
      whereConditions.push(`(
        participant_first_name LIKE ? OR
        participant_last_name LIKE ? OR
        email LIKE ? OR
        phone LIKE ?
      )`);
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Age filter functionality
    if (ageFilter !== 'all') {
      const currentYear = new Date().getFullYear();
      if (ageFilter === 'child') {
        // Child: age <= 18 (born after currentYear - 18)
        whereConditions.push(`(EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM dob::date)) <= 18`);
      } else if (ageFilter === 'adult') {
        // Adult: age 19-65
        whereConditions.push(`(EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM dob::date)) BETWEEN 19 AND 65`);
      } else if (ageFilter === 'senior') {
        // Senior: age > 65
        whereConditions.push(`(EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM dob::date)) > 65`);
      }
    }

    // Add WHERE clause if conditions exist
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    // Add ordering and pagination
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    // Execute query
    console.log('🔍 Main Query:', query);
    console.log('🔍 Main Params:', params);

    // First, let's check if ANY records exist in the table
    const allRecords = await db.prepare('SELECT COUNT(*) as count FROM tournament_registrations').get();
    console.log('🔍 Total records in tournament_registrations table:', allRecords.count);

    // Check records with payment_status = 'completed'
    const completedRecords = await db.prepare('SELECT COUNT(*) as count FROM tournament_registrations WHERE payment_status = ?').get('completed');
    console.log('🔍 Completed payment records:', completedRecords.count);

    const registrations = await db.prepare(query).all(...params);
    console.log('🔍 Main Query Results:', registrations.length, 'records found');

    // Log recent registrations for debugging
    if (registrations.length > 0) {
      console.log('📊 RECENT REGISTRATIONS:', registrations.slice(0, 3).map(r => ({
        id: r.id,
        name: `${r.participant_first_name} ${r.participant_last_name}`,
        email: r.email,
        payment_status: r.payment_status,
        payment_id: r.payment_id,
        created_at: r.created_at
      })));
    }

    // Get total count and revenue for pagination and stats (only completed payments)
    let countQuery = 'SELECT COUNT(*) as total, COALESCE(SUM(amount_paid), 0) as total_revenue FROM tournament_registrations WHERE payment_status = ?';
    let countParams = ['completed'];

    if (filter !== 'all') {
      countQuery += ' AND type = ?';
      countParams.push(filter);
    }

    // Filter by tournament ID for count
    if (tournamentId) {
      if (countParams.length > 0) {
        countQuery += ' AND tournament_id = ?';
      } else {
        countQuery += ' WHERE tournament_id = ?';
      }
      countParams.push(parseInt(tournamentId)); // Convert to integer
    }
    
    if (search) {
      const searchCondition = `(
        participant_first_name LIKE ? OR
        participant_last_name LIKE ? OR
        email LIKE ? OR
        phone LIKE ?
      )`;

      if (countParams.length > 0) {
        countQuery += ' AND ' + searchCondition;
      } else {
        countQuery += ' WHERE ' + searchCondition;
      }

      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Age filter for count query
    if (ageFilter !== 'all') {
      let ageCondition = '';
      if (ageFilter === 'child') {
        ageCondition = `(CAST(strftime('%Y', 'now') AS INTEGER) - CAST(strftime('%Y', dob) AS INTEGER)) <= 18`;
      } else if (ageFilter === 'adult') {
        ageCondition = `(CAST(strftime('%Y', 'now') AS INTEGER) - CAST(strftime('%Y', dob) AS INTEGER)) BETWEEN 19 AND 65`;
      } else if (ageFilter === 'senior') {
        ageCondition = `(CAST(strftime('%Y', 'now') AS INTEGER) - CAST(strftime('%Y', dob) AS INTEGER)) > 65`;
      }

      if (countParams.length > 0) {
        countQuery += ' AND ' + ageCondition;
      } else {
        countQuery += ' WHERE ' + ageCondition;
      }
    }

    const totalResult = await db.prepare(countQuery).get(...countParams);
    const total = totalResult.total;
    const totalRevenue = totalResult.total_revenue;

    // Get tournament categories for name lookup
    let categoryMap = {};
    let tournamentMap = {};

    if (tournamentId) {
      // Get specific tournament
      const tournament = await db.prepare('SELECT id, name, categories FROM tournaments WHERE id = ?').get(tournamentId);
      if (tournament) {
        tournamentMap[tournament.id] = tournament;
        if (tournament.categories) {
          try {
            const categories = JSON.parse(tournament.categories);
            console.log('🏆 Tournament Categories:', categories);
            categories.forEach(cat => {
              categoryMap[cat.id] = cat.name;
              categoryMap[cat.id.toString()] = cat.name;
            });
            console.log('🗺️ Category Map:', categoryMap);
          } catch (error) {
            console.error('Error parsing tournament categories:', error);
          }
        }
      }
    } else {
      // Get all tournaments for comprehensive mapping
      const tournaments = await db.prepare('SELECT id, name, categories FROM tournaments').all();
      tournaments.forEach(tournament => {
        tournamentMap[tournament.id] = tournament;
        if (tournament.categories) {
          try {
            const categories = JSON.parse(tournament.categories);
            categories.forEach(cat => {
              categoryMap[cat.id] = cat.name;
              categoryMap[cat.id.toString()] = cat.name;
            });
          } catch (error) {
            console.error('Error parsing tournament categories:', error);
          }
        }
      });
      console.log('🗺️ Global Category Map:', categoryMap);
    }

    // Add computed fields
    const enrichedRegistrations = registrations.map(reg => {
      console.log('🔍 Processing registration:', reg.tournament_type, 'Tournament ID:', reg.tournament_id);
      console.log('🔍 Category map lookup:', categoryMap[reg.tournament_type]);

      const tournament = tournamentMap[reg.tournament_id];
      const categoryName = categoryMap[reg.tournament_type] || categoryMap[reg.tournament_type?.toString()] || reg.tournament_type || 'N/A';

      return {
        ...reg,
        participant_name: `${reg.participant_first_name} ${reg.participant_last_name}`,
        category_name: categoryName,
        tournament_name: tournament ? tournament.name : 'Unknown Tournament',
        registered_at: reg.created_at // Ensure we have the registration date
      };
    });

    return NextResponse.json({
      success: true,
      registrations: enrichedRegistrations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        total_registrations: total,
        total_revenue: totalRevenue
      }
    });

  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}

// POST - Create new registration
export async function POST(request) {
  try {
    const body = await request.json();
    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

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

    // Insert registration
    const result = await db.run(`
      INSERT INTO tournament_registrations (
        participant_first_name, participant_last_name, email, phone, dob, gender,
        tournament_type, country, state, city, address, amount_paid, discount_code,
        discount_amount, payment_id, razorpay_order_id, payment_status, type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      body.participant_first_name,
      body.participant_last_name,
      body.email,
      body.phone || null,
      body.dob || null,
      body.gender || null,
      body.tournament_type || 'open',
      body.country || null,
      body.state || null,
      body.city || null,
      body.address || null,
      parseFloat(body.amount_paid) || 0,
      body.discount_code || null,
      parseFloat(body.discount_amount) || 0,
      body.payment_id || null,
      body.razorpay_order_id || null,
      body.payment_status || 'pending',
      body.type || 'tournament'
    ]);

    // Get the created registration
    const newRegistration = await db.get('SELECT * FROM tournament_registrations WHERE id = ?', [result.lastInsertRowid]);

    return NextResponse.json({
      success: true,
      message: 'Registration created successfully',
      registration: {
        ...newRegistration,
        participant_name: `${newRegistration.participant_first_name} ${newRegistration.participant_last_name}`
      }
    });

  } catch (error) {
    console.error('Error creating registration:', error);
    return NextResponse.json(
      { error: 'Failed to create registration' },
      { status: 500 }
    );
  }
}

// PUT - Update registration
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Registration ID is required' },
        { status: 400 }
      );
    }

    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    // Check if registration exists
    const existing = await db.get('SELECT * FROM tournament_registrations WHERE id = ?', [id]);
    if (!existing) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    const allowedFields = [
      'participant_first_name', 'participant_last_name', 'email', 'phone', 'dob', 'gender',
      'tournament_type', 'country', 'state', 'city', 'address', 'amount_paid', 'discount_code',
      'discount_amount', 'payment_id', 'razorpay_order_id', 'payment_status', 'type'
    ];

    for (const field of allowedFields) {
      if (updateData.hasOwnProperty(field)) {
        updateFields.push(`${field} = ?`);
        updateValues.push(updateData[field]);
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Add ID to the end of values array
    updateValues.push(id);

    // Execute update
    const updateQuery = `UPDATE tournament_registrations SET ${updateFields.join(', ')} WHERE id = ?`;
    await db.run(updateQuery, updateValues);

    // Get updated registration
    const updatedRegistration = await db.get('SELECT * FROM tournament_registrations WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Registration updated successfully',
      registration: {
        ...updatedRegistration,
        participant_name: `${updatedRegistration.participant_first_name} ${updatedRegistration.participant_last_name}`
      }
    });

  } catch (error) {
    console.error('Error updating registration:', error);
    return NextResponse.json(
      { error: 'Failed to update registration' },
      { status: 500 }
    );
  }
}

// DELETE - Delete registration
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Registration ID is required' },
        { status: 400 }
      );
    }

    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    // Check if registration exists
    const existing = await db.get('SELECT * FROM tournament_registrations WHERE id = ?', [id]);
    if (!existing) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Delete registration
    await db.run('DELETE FROM tournament_registrations WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Registration deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting registration:', error);
    return NextResponse.json(
      { error: 'Failed to delete registration' },
      { status: 500 }
    );
  }
}
