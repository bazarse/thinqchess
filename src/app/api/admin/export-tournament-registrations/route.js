import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('tournamentId');

    if (!tournamentId) {
      return NextResponse.json({ error: 'Tournament ID is required' }, { status: 400 });
    }

    // Get tournament registrations from SQLite
    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();

    // Get tournament details
    const tournament = db.prepare('SELECT * FROM tournaments WHERE id = ?').get(tournamentId);
    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    // Get registrations for this tournament
    const registrations = db.prepare(`
      SELECT * FROM tournament_registrations
      WHERE tournament_id = ? OR tournament_type LIKE ?
      ORDER BY id DESC
    `).all(tournamentId, `%${tournament.name}%`);

    if (!registrations || registrations.length === 0) {
      return NextResponse.json({ error: 'No registrations found for this tournament' }, { status: 404 });
    }

    // Prepare data for Excel
    const excelData = registrations.map((reg, index) => ({
      'S.No': index + 1,
      'Registration Date': reg.id ? 'N/A' : 'N/A', // No timestamp column available
      'Participant Name': `${reg.participant_first_name || ''} ${reg.participant_last_name || ''}`.trim(),
      'Email': reg.email || 'N/A',
      'Phone': reg.phone || 'N/A',
      'Date of Birth': reg.dob ? new Date(reg.dob).toLocaleDateString() : 'N/A',
      'Gender': reg.gender || 'N/A',
      'FIDA ID': reg.fida_id || 'N/A',
      'Tournament Category': reg.tournament_type || 'N/A',
      'Country': reg.country || 'N/A',
      'State': reg.state || 'N/A',
      'City': reg.city || 'N/A',
      'Location': reg.location || 'N/A',
      'Amount Paid': `₹${reg.amount_paid || 0}`,
      'Discount Code': reg.discount_code || 'N/A',
      'Discount Amount': reg.discount_amount ? `₹${reg.discount_amount}` : '₹0',
      'Payment ID': reg.payment_id || 'N/A',
      'Payment Status': reg.payment_status || 'pending',
      'Tournament': tournament.name || 'N/A'
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 8 },   // S.No
      { wch: 15 },  // Registration Date
      { wch: 20 },  // Participant Name
      { wch: 25 },  // Email
      { wch: 15 },  // Phone
      { wch: 12 },  // Date of Birth
      { wch: 10 },  // Gender
      { wch: 12 },  // FIDA ID
      { wch: 15 },  // Country
      { wch: 15 },  // State
      { wch: 15 },  // City
      { wch: 20 },  // Location
      { wch: 12 },  // Amount Paid
      { wch: 15 },  // Discount Code
      { wch: 15 },  // Discount Amount
      { wch: 20 },  // Payment ID
      { wch: 15 },  // Payment Status
      { wch: 25 }   // Tournament
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    const tournamentName = tournament.name || 'Tournament';
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Create response with Excel file
    const response = new NextResponse(excelBuffer);
    response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.headers.set('Content-Disposition', `attachment; filename="${tournamentName.replace(/\s+/g, '_')}_registrations.xlsx"`);

    return response;

  } catch (error) {
    console.error('Error exporting registrations:', error);
    return NextResponse.json({ error: 'Failed to export registrations' }, { status: 500 });
  }
}
