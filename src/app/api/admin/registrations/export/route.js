import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { getDB } = require('../../../../../../lib/database.js');
    const db = getDB();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const filter = searchParams.get('filter') || 'all';
    const ageFilter = searchParams.get('age_filter') || 'all';
    const search = searchParams.get('search') || '';

    // Build query based on filter
    let query = 'SELECT * FROM tournament_registrations';
    let params = [];
    let whereConditions = [];

    // Filter by type
    if (filter !== 'all') {
      whereConditions.push('type = ?');
      params.push(filter);
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
      if (ageFilter === 'child') {
        whereConditions.push(`(CAST(strftime('%Y', 'now') AS INTEGER) - CAST(strftime('%Y', dob) AS INTEGER)) <= 18`);
      } else if (ageFilter === 'adult') {
        whereConditions.push(`(CAST(strftime('%Y', 'now') AS INTEGER) - CAST(strftime('%Y', dob) AS INTEGER)) BETWEEN 19 AND 65`);
      } else if (ageFilter === 'senior') {
        whereConditions.push(`(CAST(strftime('%Y', 'now') AS INTEGER) - CAST(strftime('%Y', dob) AS INTEGER)) > 65`);
      }
    }

    // Add WHERE clause if conditions exist
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    // Add ordering
    query += ' ORDER BY registered_at DESC';

    // Execute query
    const registrations = db.prepare(query).all(...params);

    if (format === 'csv') {
      // Generate CSV with comprehensive headers
      const csvHeaders = [
        'ID',
        'Type',
        'First Name',
        'Middle Name',
        'Last Name',
        'Email',
        'Phone',
        'Age',
        'Age Category',
        'Date of Birth',
        'Gender',
        'Course Type',
        'Tournament Type',
        'FIDE ID',
        'Classes For',
        'Father First Name',
        'Father Last Name',
        'Father Email',
        'Father Phone',
        'Mother First Name',
        'Mother Last Name',
        'Mother Email',
        'Mother Phone',
        'Country',
        'State',
        'City',
        'Address Line 1',
        'Address Line 2',
        'Pincode',
        'Coaching Mode',
        'Coaching City',
        'Preferred Centre',
        'Heard From',
        'Referral Name',
        'Other Source',
        'Amount Paid',
        'Payment Status',
        'Payment ID',
        'Registered At'
      ];

      const csvRows = registrations.map(reg => {
        const age = reg.age || (reg.dob ? new Date().getFullYear() - new Date(reg.dob).getFullYear() : 'N/A');
        const ageCategory = age === 'N/A' ? 'Unknown' :
                           age <= 18 ? 'Child' :
                           age <= 65 ? 'Adult' : 'Sr Citizen';

        return [
          reg.id,
          reg.type || '',
          reg.participant_first_name || '',
          reg.participant_middle_name || '',
          reg.participant_last_name || '',
          reg.email || '',
          reg.phone || '',
          age,
          ageCategory,
          reg.dob ? new Date(reg.dob).toLocaleDateString('en-GB') : '',
          reg.gender || '',
          reg.course_type || '',
          reg.tournament_type || '',
          reg.fide_id || '',
          reg.classes_for || '',
          reg.father_first_name || '',
          reg.father_last_name || '',
          reg.father_email || '',
          reg.father_phone || '',
          reg.mother_first_name || '',
          reg.mother_last_name || '',
          reg.mother_email || '',
          reg.mother_phone || '',
          reg.country || '',
          reg.state || '',
          reg.city || '',
          reg.address_line1 || '',
          reg.address_line2 || '',
          reg.pincode || '',
          reg.coaching_mode || '',
          reg.coaching_city || '',
          reg.preferred_centre || '',
          reg.heard_from || '',
          `${reg.referral_first_name || ''} ${reg.referral_last_name || ''}`.trim(),
          reg.other_source || '',
          reg.amount_paid || 0,
          reg.payment_status || '',
          reg.payment_id || '',
          reg.registered_at ? new Date(reg.registered_at).toLocaleDateString('en-GB') : ''
        ];
      });

      // Escape CSV values
      const escapeCsvValue = (value) => {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(escapeCsvValue).join(','))
      ].join('\n');

      const response = new NextResponse(csvContent);
      response.headers.set('Content-Type', 'text/csv');
      response.headers.set('Content-Disposition', `attachment; filename="registrations_${new Date().toISOString().split('T')[0]}.csv"`);
      
      return response;

    } else if (format === 'json') {
      // Generate JSON
      const jsonData = {
        export_date: new Date().toISOString(),
        total_records: registrations.length,
        filter_applied: filter,
        search_applied: search,
        registrations: registrations.map(reg => ({
          ...reg,
          participant_name: `${reg.participant_first_name} ${reg.participant_last_name}`
        }))
      };

      const response = NextResponse.json(jsonData);
      response.headers.set('Content-Disposition', `attachment; filename="registrations_${new Date().toISOString().split('T')[0]}.json"`);
      
      return response;

    } else {
      return NextResponse.json(
        { error: 'Unsupported format. Use csv or json.' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error exporting registrations:', error);
    return NextResponse.json(
      { error: 'Failed to export registrations' },
      { status: 500 }
    );
  }
}
