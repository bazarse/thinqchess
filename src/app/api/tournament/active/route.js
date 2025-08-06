import { NextResponse } from 'next/server';
import { updateTournamentStatus } from '../../../../../lib/tournament-utils.js';

// GET - Fetch active tournament for frontend
export async function GET() {
  try {
    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();

    // Auto-update tournament status first
    updateTournamentStatus();

    // Get the active tournament
    const activeTournament = db.prepare('SELECT * FROM tournaments WHERE is_active = 1 LIMIT 1').get();
    
    if (!activeTournament) {
      // Check for upcoming tournaments
      const upcomingTournament = db.prepare(`
        SELECT * FROM tournaments
        WHERE start_date > datetime('now')
        ORDER BY start_date ASC
        LIMIT 1
      `).get();

      if (upcomingTournament) {
        const startDate = new Date(upcomingTournament.start_date);
        return NextResponse.json({
          success: true,
          message: 'Upcoming tournament found',
          hasActiveTournament: false,
          hasUpcomingTournament: true,
          upcomingTournament,
          countdownTarget: startDate.toISOString(),
          statusMessage: `Next tournament: ${upcomingTournament.name} starts on ${startDate.toLocaleDateString()}`
        });
      }

      return NextResponse.json({
        success: false,
        message: 'No active or upcoming tournament found',
        hasActiveTournament: false,
        hasUpcomingTournament: false,
        tournament: null
      });
    }

    // Check if registration is currently open based on dates
    const now = new Date();
    const tournamentStart = activeTournament.start_date ? new Date(activeTournament.start_date) : null;
    const tournamentEnd = activeTournament.end_date ? new Date(activeTournament.end_date) : null;
    const registrationStart = activeTournament.registration_start_date ? new Date(activeTournament.registration_start_date) : null;
    const registrationEnd = activeTournament.registration_end_date ? new Date(activeTournament.registration_end_date) : null;

    let registrationStatus = 'open';
    let statusMessage = 'Registration is open';

    // Check if tournament has ended
    if (tournamentEnd && now > tournamentEnd) {
      registrationStatus = 'tournament_ended';
      statusMessage = 'Tournament has ended';
    }
    // Check if registration hasn't started yet
    else if (registrationStart && now < registrationStart) {
      registrationStatus = 'upcoming_tournament';
      statusMessage = `Registration opens on ${registrationStart.toLocaleDateString()}`;
    }
    // Check if registration has ended
    else if (registrationEnd && now > registrationEnd) {
      registrationStatus = 'closed';
      statusMessage = 'Registration has ended';
    }
    // If tournament is active and registration dates are valid, keep registration open
    else {
      registrationStatus = 'open';
      statusMessage = 'Registration is open';
    }

    // Get current registration count
    const registrationCountResult = db.prepare(
      'SELECT COUNT(*) as count FROM tournament_registrations WHERE tournament_id = ?'
    ).get(activeTournament.id);

    const currentRegistrations = registrationCountResult ? parseInt(registrationCountResult.count) : 0;
    
    // Check if tournament is full
    if (activeTournament.max_participants && currentRegistrations >= activeTournament.max_participants) {
      registrationStatus = 'full';
      statusMessage = 'Tournament is full';
    }

    // Set countdown target based on registration status
    let countdownTarget = null;
    if (registrationStatus === 'upcoming_tournament' && registrationStart) {
      countdownTarget = registrationStart.toISOString();
    }

    // Parse tournament categories if they exist
    let tournamentCategories = [];
    if (activeTournament.categories) {
      try {
        tournamentCategories = typeof activeTournament.categories === 'string'
          ? JSON.parse(activeTournament.categories)
          : activeTournament.categories;
      } catch (e) {
        console.error('Error parsing tournament categories:', e);
        tournamentCategories = [];
      }
    }

    return NextResponse.json({
      success: true,
      hasActiveTournament: true,
      tournament: {
        ...activeTournament,
        currentRegistrations,
        spotsRemaining: activeTournament.max_participants ?
          Math.max(0, activeTournament.max_participants - currentRegistrations) : null,
        categories: tournamentCategories
      },
      registrationStatus,
      statusMessage,
      isRegistrationOpen: registrationStatus === 'open',
      countdownTarget
    });

  } catch (error) {
    console.error('Error fetching active tournament:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch active tournament',
        hasActiveTournament: false,
        tournament: null
      },
      { status: 500 }
    );
  }
}
