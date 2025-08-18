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

    console.log(`🗑️ Deleting gallery item with ID: ${id}`);

    // Use SimpleDB for consistency
    const SimpleDatabase = (await import('../../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    // First check if the item exists
    const existingItem = await db.get('SELECT * FROM gallery_images WHERE id = ?', [parseInt(id)]);
    
    if (!existingItem) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      );
    }

    console.log(`📸 Found item to delete:`, existingItem);

    // Delete the item
    const result = await db.run('DELETE FROM gallery_images WHERE id = ?', [parseInt(id)]);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Failed to delete gallery item' },
        { status: 500 }
      );
    }

    console.log(`✅ Gallery item deleted successfully. Changes: ${result.changes}`);

    return NextResponse.json({
      success: true,
      message: `${existingItem.type === 'video' ? 'Video' : 'Image'} deleted successfully`,
      deletedItem: existingItem
    });

  } catch (error) {
    console.error('❌ Error deleting gallery item:', error);
    return NextResponse.json(
      { error: 'Failed to delete gallery item: ' + error.message },
      { status: 500 }
    );
  }
}

// Also handle GET for individual item retrieval
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Gallery item ID is required' },
        { status: 400 }
      );
    }

    const SimpleDatabase = (await import('../../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    const item = await db.get('SELECT * FROM gallery_images WHERE id = ?', [parseInt(id)]);

    if (!item) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      item: item
    });

  } catch (error) {
    console.error('Error fetching gallery item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery item' },
      { status: 500 }
    );
  }
}
