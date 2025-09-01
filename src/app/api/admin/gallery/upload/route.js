import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { image_url, image_name, display_order, category } = body;

    if (!image_url || !image_name) {
      return NextResponse.json(
        { error: 'Image URL and name are required' },
        { status: 400 }
      );
    }

    const { getDB } = require('../../../../../../lib/database.js');
    const db = getDB();

    // Create table if it doesn't exist
    db.prepare(`
      CREATE TABLE IF NOT EXISTS gallery_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        image_name TEXT,
        image_url TEXT NOT NULL,
        display_order INTEGER DEFAULT 0,
        category TEXT DEFAULT 'uncategorized',
        type TEXT DEFAULT 'image',
        youtube_id TEXT,
        youtube_url TEXT,
        title TEXT,
        uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    const result = db.prepare(`
      INSERT INTO gallery_images (image_name, image_url, display_order, category, type, uploaded_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      image_name,
      image_url,
      display_order || 0,
      category || 'uncategorized',
      'image',
      new Date().toISOString()
    );

    const newImage = db.prepare('SELECT * FROM gallery_images WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      image: newImage
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}