import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get database connection
    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();

    // Get counts for different notification types
    
    // New tournament registrations (last 24 hours)
    const newRegistrations = db.prepare(`
      SELECT COUNT(*) as count
      FROM tournament_registrations
      WHERE registered_at >= datetime('now', '-1 day')
    `).get();

    // Pending demo requests (using course_registrations table)
    const pendingDemos = db.prepare(`
      SELECT COUNT(*) as count
      FROM course_registrations
      WHERE type = 'demo' AND (status = 'pending' OR status IS NULL)
    `).get();

    // Active tournaments needing attention
    const activeTournaments = db.prepare(`
      SELECT COUNT(*) as count 
      FROM tournaments 
      WHERE status = 'active' AND tournament_date >= date('now')
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
