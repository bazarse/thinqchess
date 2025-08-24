import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ 
        error: 'Email parameter required',
        usage: '/api/admin/debug-registration?email=drishtee2009@outlook.com'
      }, { status: 400 });
    }

    console.log('🔍 DEBUGGING REGISTRATION FOR EMAIL:', email);

    // Check if registration exists with any status
    const allRegistrations = await db.all(
      'SELECT * FROM tournament_registrations WHERE email = ? ORDER BY created_at DESC',
      [email]
    );

    console.log('📊 ALL REGISTRATIONS FOR EMAIL:', allRegistrations.length);

    // Check payment status breakdown
    const statusBreakdown = await db.all(`
      SELECT payment_status, COUNT(*) as count 
      FROM tournament_registrations 
      WHERE email = ? 
      GROUP BY payment_status
    `, [email]);

    // Check recent registrations (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const recentRegistrations = await db.all(`
      SELECT * FROM tournament_registrations 
      WHERE email = ? AND created_at > ? 
      ORDER BY created_at DESC
    `, [email, yesterday.toISOString()]);

    // Check all registrations in last 24 hours (any email)
    const allRecentRegistrations = await db.all(`
      SELECT * FROM tournament_registrations 
      WHERE created_at > ? 
      ORDER BY created_at DESC
      LIMIT 10
    `, [yesterday.toISOString()]);

    // Check payment IDs for this email
    const paymentIds = await db.all(`
      SELECT payment_id, razorpay_order_id, payment_status, created_at 
      FROM tournament_registrations 
      WHERE email = ? AND payment_id IS NOT NULL
      ORDER BY created_at DESC
    `, [email]);

    return NextResponse.json({
      success: true,
      debug_info: {
        email: email,
        total_registrations: allRegistrations.length,
        status_breakdown: statusBreakdown,
        recent_registrations_count: recentRegistrations.length,
        all_recent_count: allRecentRegistrations.length
      },
      all_registrations: allRegistrations.map(r => ({
        id: r.id,
        name: `${r.participant_first_name} ${r.participant_last_name}`,
        email: r.email,
        payment_status: r.payment_status,
        payment_id: r.payment_id,
        razorpay_order_id: r.razorpay_order_id,
        amount_paid: r.amount_paid,
        tournament_id: r.tournament_id,
        tournament_type: r.tournament_type,
        created_at: r.created_at,
        updated_at: r.updated_at
      })),
      recent_registrations: recentRegistrations.map(r => ({
        id: r.id,
        name: `${r.participant_first_name} ${r.participant_last_name}`,
        payment_status: r.payment_status,
        payment_id: r.payment_id,
        created_at: r.created_at
      })),
      payment_ids: paymentIds,
      all_recent_registrations: allRecentRegistrations.map(r => ({
        id: r.id,
        name: `${r.participant_first_name} ${r.participant_last_name}`,
        email: r.email,
        payment_status: r.payment_status,
        payment_id: r.payment_id,
        created_at: r.created_at
      }))
    });

  } catch (error) {
    console.error('Error in debug registration API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 });
  }
}

// POST - Force refresh registration status
export async function POST(request) {
  try {
    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ 
        error: 'Email required in request body' 
      }, { status: 400 });
    }

    // Update any pending registrations with payment_id to completed
    const updateResult = await db.run(`
      UPDATE tournament_registrations 
      SET payment_status = 'completed', updated_at = ? 
      WHERE email = ? AND payment_id IS NOT NULL AND payment_status != 'completed'
    `, [new Date().toISOString(), email]);

    console.log('🔄 FORCE UPDATE RESULT:', {
      email,
      changes: updateResult.changes
    });

    return NextResponse.json({
      success: true,
      message: `Updated ${updateResult.changes} registrations to completed status`,
      changes: updateResult.changes
    });

  } catch (error) {
    console.error('Error force updating registration:', error);
    return NextResponse.json({ 
      error: 'Failed to update registration status',
      details: error.message 
    }, { status: 500 });
  }
}
