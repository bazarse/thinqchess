import { NextResponse } from 'next/server';

// GET - Fetch gallery images for public display
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit')) || 50;
    
    // Get gallery images from SQLite
    const { getDB } = require('../../../../lib/database.js');
    const db = getDB();
    
    let query = 'SELECT * FROM gallery_images';
    let params = [];
    
    if (category && category !== 'all') {
      query += ' WHERE category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY display_order ASC, uploaded_at DESC';
    
    if (limit) {
      query += ' LIMIT ?';
      params.push(limit);
    }
    
    const images = db.prepare(query).all(...params);
    
    return NextResponse.json(images);

  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery images' },
      { status: 500 }
    );
  }
}
