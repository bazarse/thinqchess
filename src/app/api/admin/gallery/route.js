import { NextResponse } from 'next/server';

async function handleGalleryRequest() {
  try {
    console.log('🖼️ Fetching gallery images...');

    let images = [];

    try {
      // Try to use SimpleDB
      const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
      const db = new SimpleDatabase();
      images = await db.all('SELECT * FROM gallery_images ORDER BY display_order ASC, uploaded_at DESC') || [];
      console.log(`📸 Found ${images.length} gallery images from database`);
    } catch (dbError) {
      console.error('💥 Database error, using mock data:', dbError.message);

      // Fallback to mock gallery data
      images = [
        {
          id: 1,
          image_name: 'Chess Tournament 2024',
          image_url: '/images/chess-tournament.webp',
          display_order: 0,
          uploaded_at: new Date().toISOString()
        },
        {
          id: 2,
          image_name: 'Tournament Flyer',
          image_url: '/images/tournament-flyer.jpg',
          display_order: 1,
          uploaded_at: new Date().toISOString()
        },
        {
          id: 3,
          image_name: 'Students Playing',
          image_url: '/images/offline-students-playing.jpg',
          display_order: 2,
          uploaded_at: new Date().toISOString()
        }
      ];
      console.log(`📸 Using ${images.length} mock gallery images`);
    }

    const response = NextResponse.json(images);

    // Add caching headers
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=300');
    response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=300');

    return response;

  } catch (error) {
    console.error('💥 Error fetching gallery images:', error);
    // Return mock data as final fallback
    return NextResponse.json([
      {
        id: 1,
        image_name: 'Chess Tournament',
        image_url: '/images/chess-tournament.webp',
        display_order: 0,
        uploaded_at: new Date().toISOString()
      }
    ]);
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

    // Always use SimpleDB
    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    const result = await db.run(`
      INSERT INTO gallery_images (image_name, image_url, display_order, uploaded_at)
      VALUES (?, ?, ?, ?)
    `, [
      image_name,
      image_url,
      display_order || 0,
      new Date().toISOString()
    ]);

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

    // Always use SimpleDB
    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    // Update display order for each image
    for (const { id, display_order } of imageOrders) {
      await db.run('UPDATE gallery_images SET display_order = ? WHERE id = ?', [display_order, id]);
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
