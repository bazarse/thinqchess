import { NextResponse } from 'next/server';

// GET - Fetch published blogs for public display
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const limit = parseInt(searchParams.get('limit')) || 50;
    
    // Get published blogs from PostgreSQL
    const { getDB } = require('../../../../lib/database.js');
    const db = getDB();

    let query = 'SELECT * FROM blogs';
    let params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    if (limit) {
      query += ' LIMIT ?';
      params.push(limit);
    }

    const blogs = await db.prepare(query).all(...params);
    
    // Parse tags if they're stored as JSON strings
    const blogsWithParsedTags = blogs.map(blog => ({
      ...blog,
      tags: blog.tags ? (typeof blog.tags === 'string' ? JSON.parse(blog.tags) : blog.tags) : [],
      // Add computed fields for frontend compatibility
      banner_img: blog.featured_image,
      slug: blog.slug || blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      excerpt: blog.excerpt || blog.content.substring(0, 150) + '...'
    }));
    
    return NextResponse.json(blogsWithParsedTags);

  } catch (error) {
    console.error('Error fetching public blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}
