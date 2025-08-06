import { NextResponse } from 'next/server';

// DELETE - Delete specific registration
export async function DELETE(request, { params }) {
  try {
    const { getDB } = require('../../../../../../lib/database.js');
    const db = getDB();

    const resolvedParams = await params;
    const registrationId = resolvedParams.id;
    
    // Delete registration
    const deleteStmt = db.prepare('DELETE FROM tournament_registrations WHERE id = ?');
    const result = deleteStmt.run(registrationId);
    
    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

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
