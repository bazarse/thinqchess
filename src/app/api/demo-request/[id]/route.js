import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Demo request ID is required' },
        { status: 400 }
      );
    }

    // Get database connection
    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    console.log('🗑️ Deleting demo request with ID:', id);

    // Check if the demo request exists
    const existingRequest = await db.get('SELECT * FROM demo_requests WHERE id = ?', [id]);

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Demo request not found' },
        { status: 404 }
      );
    }

    // Delete the demo request
    const result = await db.run('DELETE FROM demo_requests WHERE id = ?', [id]);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Failed to delete demo request' },
        { status: 500 }
      );
    }

    console.log('✅ Demo request deleted successfully:', id);

    return NextResponse.json({
      success: true,
      message: 'Demo request deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting demo request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Demo request ID is required' },
        { status: 400 }
      );
    }

    // Get database connection
    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    console.log('📋 Fetching demo request with ID:', id);

    // Get the demo request
    const request = await db.get('SELECT * FROM demo_requests WHERE id = ?', [id]);
    
    if (!request) {
      return NextResponse.json(
        { error: 'Demo request not found' },
        { status: 404 }
      );
    }

    console.log('✅ Demo request found:', request);

    return NextResponse.json({
      success: true,
      request: request
    });

  } catch (error) {
    console.error('❌ Error fetching demo request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
