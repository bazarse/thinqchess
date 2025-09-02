import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get blogs from SimpleDatabase
    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    const blogs = await db.all('SELECT * FROM blogs ORDER BY created_at DESC');

    // Parse tags if they're stored as JSON strings
    const blogsWithParsedTags = blogs.map(blog => ({
      ...blog,
      tags: blog.tags ? (typeof blog.tags === 'string' ? JSON.parse(blog.tags) : blog.tags) : []
    }));

    return NextResponse.json(blogsWithParsedTags);

  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, content, excerpt, featured_image, status, tags, author } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    const existingBlog = await db.get('SELECT id FROM blogs WHERE slug = ?', [slug]);
    if (existingBlog) {
      return NextResponse.json(
        { error: 'A blog with this title already exists' },
        { status: 400 }
      );
    }

    // Insert new blog
    const insertStmt = db.prepare(`
      INSERT INTO blogs (title, content, excerpt, slug, author, status, tags, featured_image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      title,
      content,
      excerpt || '',
      slug,
      author || 'Admin',
      status || 'draft',
      JSON.stringify(tags || []),
      featured_image || ''
    );

    // Get the created blog
    const newBlog = db.prepare('SELECT * FROM blogs WHERE id = ?').get(result.lastInsertRowid);

    // Parse tags for response
    newBlog.tags = newBlog.tags ? JSON.parse(newBlog.tags) : [];

    return NextResponse.json({
      success: true,
      message: 'Blog created successfully',
      blog: newBlog
    });

  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { error: 'Failed to create blog' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, title, content, excerpt, featured_image, status, tags, author } = body;

    if (!id || !title || !content) {
      return NextResponse.json(
        { error: 'ID, title and content are required' },
        { status: 400 }
      );
    }

    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    // Check if blog exists
    const existingBlog = await db.get('SELECT * FROM blogs WHERE id = ?', [id]);
    if (!existingBlog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists for a different blog
    const slugExists = await db.get('SELECT id FROM blogs WHERE slug = ? AND id != ?', [slug, id]);
    if (slugExists) {
      return NextResponse.json(
        { error: 'A blog with this title already exists' },
        { status: 400 }
      );
    }

    // Update blog with proper timestamp
    const result = await db.run(`
      UPDATE blogs
      SET title = ?, content = ?, excerpt = ?, slug = ?, author = ?,
          status = ?, tags = ?, featured_image = ?, updated_at = ?
      WHERE id = ?
    `, [
      title,
      content,
      excerpt || '',
      slug,
      author || 'Admin',
      status || 'draft',
      JSON.stringify(tags || []),
      featured_image || '',
      new Date().toISOString(),
      id
    ]);

    // Get updated blog
    const updatedBlog = await db.get('SELECT * FROM blogs WHERE id = ?', [id]);

    // Parse tags for response
    updatedBlog.tags = updatedBlog.tags ? JSON.parse(updatedBlog.tags) : [];

    return NextResponse.json({
      success: true,
      message: 'Blog updated successfully',
      blog: updatedBlog
    });

  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { error: 'Failed to update blog' },
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
        { error: 'Blog ID is required' },
        { status: 400 }
      );
    }

    const SimpleDatabase = (await import('../../../../../lib/simple-db.js')).default;
    const db = new SimpleDatabase();

    // Delete blog
    await db.run('DELETE FROM blogs WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Blog deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
}
