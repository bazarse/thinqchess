import { NextResponse } from 'next/server';

// DELETE - Delete specific registration
export async function DELETE(request, { params }) {
  try {
    const SimpleDatabase = (await import('../../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();
    const resolvedParams = await params;
    const registrationId = resolvedParams.id;

    console.log(`🗑️ Attempting to delete registration with ID: ${registrationId}`);

    // First check if the registration exists
    const existing = await db.get(
      'SELECT * FROM tournament_registrations WHERE id = ?',
      [registrationId]
    );
    console.log(`🔍 Found existing registration:`, existing);

    if (!existing) {
      console.log(`❌ Registration with ID ${registrationId} not found`);
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Delete registration
    const result = await db.run(
      'DELETE FROM tournament_registrations WHERE id = ?',
      [registrationId]
    );
    console.log(`🗑️ Delete result:`, result);

    if (result.changes === 0) {
      console.log(`❌ No changes made when deleting ID ${registrationId}`);
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Successfully deleted registration with ID ${registrationId}`);
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
