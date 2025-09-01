import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Gallery item ID is required' },
        { status: 400 }
      );
    }

    const { getDB } = require('../../../../../../lib/database.js');
    const db = getDB();

    // Check if item exists
    const existing = db.prepare('SELECT * FROM gallery_images WHERE id = ?').get(parseInt(id));
    if (!existing) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      );
    }

    // Delete the item
    const result = db.prepare('DELETE FROM gallery_images WHERE id = ?').run(parseInt(id));

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Failed to delete gallery item' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${existing.type === 'video' ? 'Video' : 'Image'} deleted successfully`
    });

  } catch (error) {
    console.error('Error deleting gallery item:', error);
    return NextResponse.json(
      { error: 'Failed to delete gallery item' },
      { status: 500 }
    );
  }
}