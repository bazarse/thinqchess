import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, youtube_url, youtube_id, category } = body;

    if (!title || !youtube_url || !youtube_id) {
      return NextResponse.json(
        { error: 'Title, YouTube URL, and YouTube ID are required' },
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

    // Generate thumbnail URL from YouTube ID
    const thumbnailUrl = `https://img.youtube.com/vi/${youtube_id}/maxresdefault.jpg`;

    const result = db.prepare(`
      INSERT INTO gallery_images (title, image_name, image_url, youtube_id, youtube_url, category, type, uploaded_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title,
      title, // Use title as image_name for videos
      thumbnailUrl,
      youtube_id,
      youtube_url,
      category || 'uncategorized',
      'video',
      new Date().toISOString()
    );

    const newVideo = db.prepare('SELECT * FROM gallery_images WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json({
      success: true,
      message: 'Video added successfully',
      video: newVideo
    });

  } catch (error) {
    console.error('Error adding video:', error);
    return NextResponse.json(
      { error: 'Failed to add video' },
      { status: 500 }
    );
  }
}