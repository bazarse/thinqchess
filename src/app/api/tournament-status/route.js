import { NextResponse } from 'next/server';

// In-memory storage for development mode
let developmentSettings = {
  tournament_registration_active: false,
  tournament_registration_mode: 'manual',
  tournament_open_date: '',
  tournament_close_date: '',
  tournament_closed_message: 'Registration is currently closed. Please check back later.',
  course_registration_active: true,
  coming_soon_message: "Coming Soon! Get ready for the biggest chess tournament of the year!"
};

export async function GET() {
  try {
    let settings;

    // Development mode - get settings from in-memory storage
    if (process.env.DEVELOPMENT_MODE === 'true') {
      settings = developmentSettings;
    } else {
      // Production mode with database
      const { sql } = await import('@vercel/postgres');
      const result = await sql`
        SELECT * FROM admin_settings
        ORDER BY id DESC LIMIT 1
      `;
      settings = result.rows[0];
    }

    // Calculate current registration status based on mode
    const currentTime = new Date();
    let isRegistrationOpen = false;
    let statusMessage = '';
    let countdownTarget = null;

    switch (settings?.tournament_registration_mode || 'manual') {
      case 'manual':
        isRegistrationOpen = settings?.tournament_registration_active || false;
        statusMessage = isRegistrationOpen ? 
          'Registration is open!' : 
          (settings?.tournament_closed_message || 'Registration is currently closed.');
        break;

      case 'scheduled':
        const openDate = settings?.tournament_open_date ? new Date(settings.tournament_open_date) : null;
        const closeDate = settings?.tournament_close_date ? new Date(settings.tournament_close_date) : null;
        
        if (openDate && closeDate) {
          if (currentTime < openDate) {
            isRegistrationOpen = false;
            statusMessage = `Registration opens on ${openDate.toLocaleDateString()} at ${openDate.toLocaleTimeString()}`;
            countdownTarget = openDate.toISOString();
          } else if (currentTime >= openDate && currentTime <= closeDate) {
            isRegistrationOpen = true;
            statusMessage = `Registration is open until ${closeDate.toLocaleDateString()} at ${closeDate.toLocaleTimeString()}`;
          } else {
            isRegistrationOpen = false;
            statusMessage = 'Registration has closed for this tournament.';
          }
        } else {
          isRegistrationOpen = false;
          statusMessage = 'Registration dates not configured.';
        }
        break;

      case 'countdown':
        const countdownOpenDate = settings?.tournament_open_date ? new Date(settings.tournament_open_date) : null;
        
        if (countdownOpenDate) {
          if (currentTime < countdownOpenDate) {
            isRegistrationOpen = false;
            statusMessage = 'Registration opens soon!';
            countdownTarget = countdownOpenDate.toISOString();
          } else {
            isRegistrationOpen = true;
            statusMessage = 'Registration is now open!';
          }
        } else {
          isRegistrationOpen = false;
          statusMessage = 'Registration opening date not configured.';
        }
        break;

      default:
        isRegistrationOpen = false;
        statusMessage = 'Registration status unknown.';
    }

    return NextResponse.json({
      isRegistrationOpen,
      statusMessage,
      countdownTarget,
      mode: settings?.tournament_registration_mode || 'manual',
      openDate: settings?.tournament_open_date || '',
      closeDate: settings?.tournament_close_date || '',
      closedMessage: settings?.tournament_closed_message || 'Registration is currently closed.'
    });

  } catch (error) {
    console.error('Error fetching tournament status:', error);
    return NextResponse.json({
      isRegistrationOpen: false,
      statusMessage: 'Unable to check registration status. Please try again later.',
      countdownTarget: null,
      mode: 'manual'
    });
  }
}
