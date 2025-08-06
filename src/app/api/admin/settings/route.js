import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get settings from SQLite
    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();

    const settings = db.prepare('SELECT * FROM admin_settings ORDER BY id DESC LIMIT 1').get();

    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        tournament_fee: 400.00,
        registration_fee: 500.00,
        max_participants: 52,
        countdown_end_date: null,
        tournament_types: []
      });
    }

    // Parse tournament_types if it's a string
    if (settings.tournament_types && typeof settings.tournament_types === 'string') {
      try {
        settings.tournament_types = JSON.parse(settings.tournament_types);
      } catch (e) {
        settings.tournament_types = [];
      }
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    // Fallback to default settings
    return NextResponse.json({
      tournament_fee: 400.00,
      registration_fee: 500.00,
      max_participants: 52,
      countdown_end_date: null
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { tournament_fee, registration_fee, max_participants, countdown_end_date, tournament_types } = body;

    // Validate input
    if (!tournament_fee || !registration_fee || !max_participants) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (tournament_fee < 0 || registration_fee < 0 || max_participants < 1) {
      return NextResponse.json(
        { error: 'Invalid values provided' },
        { status: 400 }
      );
    }

    // Update settings in SQLite
    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();

    // Check if settings exist
    const existing = db.prepare('SELECT * FROM admin_settings ORDER BY id DESC LIMIT 1').get();

    if (existing) {
      // Update existing settings
      db.prepare(`
        UPDATE admin_settings
        SET tournament_fee = ?, registration_fee = ?, max_participants = ?,
            countdown_end_date = ?, tournament_types = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        parseFloat(tournament_fee),
        parseFloat(registration_fee),
        parseInt(max_participants),
        countdown_end_date || null,
        JSON.stringify(tournament_types || []),
        existing.id
      );
    } else {
      // Insert new settings
      db.prepare(`
        INSERT INTO admin_settings (tournament_fee, registration_fee, max_participants, countdown_end_date, tournament_types)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        parseFloat(tournament_fee),
        parseFloat(registration_fee),
        parseInt(max_participants),
        countdown_end_date || null,
        JSON.stringify(tournament_types || [])
      );
    }

    // Get updated settings
    const updatedSettings = db.prepare('SELECT * FROM admin_settings ORDER BY id DESC LIMIT 1').get();
    if (updatedSettings.tournament_types && typeof updatedSettings.tournament_types === 'string') {
      try {
        updatedSettings.tournament_types = JSON.parse(updatedSettings.tournament_types);
      } catch (e) {
        updatedSettings.tournament_types = [];
      }
    }

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error updating admin settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { username, currentPassword, newPassword } = body;

    // Validate required fields
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Development mode - simple validation
    if (process.env.DEVELOPMENT_MODE === 'true') {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin';
      const adminPassword = process.env.ADMIN_PASSWORD || '1234';

      // If changing password, verify current password
      if (newPassword && currentPassword !== adminPassword) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      // Validate new password length
      if (newPassword && newPassword.length > 8) {
        return NextResponse.json(
          { error: 'Password must be maximum 8 characters' },
          { status: 400 }
        );
      }

      console.log('🔧 Admin Settings Updated:', {
        username,
        passwordChanged: !!newPassword
      });

      return NextResponse.json({
        success: true,
        message: 'Settings updated successfully',
        username: username
      });
    }

    // Production mode - implement proper database updates
    return NextResponse.json(
      { error: 'Settings update not implemented for production mode' },
      { status: 501 }
    );

  } catch (error) {
    console.error('Error updating admin settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
