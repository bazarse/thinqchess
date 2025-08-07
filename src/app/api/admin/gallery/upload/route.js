import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { image_name, image_url } = body;

    if (!image_name || !image_url) {
      return NextResponse.json(
        { error: 'Image name and URL are required' },
        { status: 400 }
      );
    }

    // Save to SimpleDB database
    const SimpleDatabase = (await import('../../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    // Insert into gallery_images table
    const result = await db.run(`
      INSERT INTO gallery_images (image_name, image_url, display_order, uploaded_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `, [
      image_name,
      image_url,
      0, // Default display order
      new Date().toISOString(),
      new Date().toISOString()
    ]);

    // Get the created image - create a mock response if db.get fails
    let newImage;
    try {
      newImage = await db.get('SELECT * FROM gallery_images WHERE id = ?', [result.lastInsertRowid]);
    } catch (error) {
      // Create mock response if database query fails
      newImage = {
        id: result.lastInsertRowid || Date.now(),
        image_name,
        image_url,
        display_order: 0,
        uploaded_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully!',
      image: newImage
    });

  } catch (error) {
    console.error('Error saving gallery image:', error);
    return NextResponse.json(
      { error: 'Failed to save gallery image' },
      { status: 500 }
    );
  }
}
