import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get database connection
    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();

    // Get counts for different notification types
    
    // New tournament registrations (last 24 hours)
    const newRegistrations = await db.prepare(`
      SELECT COUNT(*) as count
      FROM tournament_registrations
      WHERE registered_at >= CURRENT_TIMESTAMP - INTERVAL '1 day'
    `).get();

    // Pending demo requests
    const pendingDemos = await db.prepare(`
      SELECT COUNT(*) as count
      FROM demo_requests
      WHERE status = 'pending'
    `).get();

    // Active tournaments needing attention
    const activeTournaments = await db.prepare(`
      SELECT COUNT(*) as count
      FROM tournaments
      WHERE status = 'active' AND start_date >= CURRENT_DATE
    `).get();

    const notifications = {
      tournaments: activeTournaments?.count || 0,
      registrations: newRegistrations?.count || 0,
      demos: pendingDemos?.count || 0,
      total: (activeTournaments?.count || 0) + (newRegistrations?.count || 0) + (pendingDemos?.count || 0)
    };

    console.log('📊 Admin Notifications:', notifications);

    return NextResponse.json(notifications);

  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    
    // Return default values on error
    return NextResponse.json({
      tournaments: 0,
      registrations: 0,
      demos: 0,
      total: 0
    });
  }
}
