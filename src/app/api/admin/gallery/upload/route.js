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

    // Save to SQLite database
    const { getDB } = require('../../../../../../lib/database.js');
    const db = getDB();

    // Insert into gallery_images table
    const insertStmt = db.prepare(`
      INSERT INTO gallery_images (image_name, image_url, display_order, uploaded_at)
      VALUES (?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      image_name,
      image_url,
      0, // Default display order
      new Date().toISOString()
    );

    // Get the created image
    const newImage = db.prepare('SELECT * FROM gallery_images WHERE id = ?').get(result.lastInsertRowid);

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
