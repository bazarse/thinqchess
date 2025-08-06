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

    // Get database connection
    const { getDB } = require('../../../../../../lib/database.js');
    const db = getDB();

    console.log('🎥 Adding video to gallery:', { title, youtube_url, youtube_id, category });

    // Insert video into gallery_images table (we'll use the same table but with type field)
    const insertStmt = db.prepare(`
      INSERT INTO gallery_images (
        image_name, image_url, category, type, youtube_id, youtube_url, uploaded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      title,
      `https://img.youtube.com/vi/${youtube_id}/maxresdefault.jpg`, // YouTube thumbnail
      category || 'uncategorized',
      'video',
      youtube_id,
      youtube_url,
      new Date().toISOString()
    );

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Failed to add video to gallery' },
        { status: 500 }
      );
    }

    // Get the inserted video
    const video = db.prepare('SELECT * FROM gallery_images WHERE id = ?').get(result.lastInsertRowid);

    console.log('✅ Video added successfully:', video);

    return NextResponse.json({
      success: true,
      video: video,
      message: 'Video added to gallery successfully'
    });

  } catch (error) {
    console.error('❌ Error adding video to gallery:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
