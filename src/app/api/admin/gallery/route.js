import { NextResponse } from 'next/server';

async function handleGalleryRequest() {
  try {
    // Always use database
    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();

    const images = db.prepare('SELECT * FROM gallery_images ORDER BY display_order ASC, uploaded_at DESC').all();

    const response = NextResponse.json(images);

    // Add caching headers
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=300');
    response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=300');

    return response;

  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery images' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  return await handleGalleryRequest();
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { image_url, image_name, display_order } = body;

    if (!image_url || !image_name) {
      return NextResponse.json(
        { error: 'Image URL and name are required' },
        { status: 400 }
      );
    }

    // Always use database
    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();

    const insertStmt = db.prepare(`
      INSERT INTO gallery_images (image_name, image_url, display_order, uploaded_at)
      VALUES (?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      image_name,
      image_url,
      display_order || 0,
      new Date().toISOString()
    );

    const newImage = db.prepare('SELECT * FROM gallery_images WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json({
      success: true,
      message: 'Image added successfully',
      image: newImage
    });

  } catch (error) {
    console.error('Error adding gallery image:', error);
    return NextResponse.json(
      { error: 'Failed to add gallery image' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { imageOrders } = body;

    if (!imageOrders || !Array.isArray(imageOrders)) {
      return NextResponse.json(
        { error: 'Image orders array is required' },
        { status: 400 }
      );
    }

    // Always use database
    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();

    // Update display order for each image
    const updateStmt = db.prepare('UPDATE gallery_images SET display_order = ? WHERE id = ?');

    for (const { id, display_order } of imageOrders) {
      updateStmt.run(display_order, id);
    }

    return NextResponse.json({
      success: true,
      message: 'Image order updated successfully'
    });

  } catch (error) {
    console.error('Error updating gallery image order:', error);
    return NextResponse.json(
      { error: 'Failed to update image order' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    // Always use database
    const { getDB } = require('../../../../../lib/database.js');
    const db = getDB();

    const deleteStmt = db.prepare('DELETE FROM gallery_images WHERE id = ?');
    deleteStmt.run(parseInt(id));

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting gallery image:', error);
    return NextResponse.json(
      { error: 'Failed to delete gallery image' },
      { status: 500 }
    );
  }
}
