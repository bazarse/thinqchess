import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Development mode - return mock blog data
    if (process.env.DEVELOPMENT_MODE === 'true') {
      const mockBlogs = [
        {
          id: 1,
          title: 'Chess Strategies for Beginners',
          slug: 'chess-strategies-for-beginners',
          content: 'Learn the fundamental chess strategies that every beginner should know...',
          featured_image: '/images/blog/chess-strategies.jpg',
          status: 'published',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Tournament Preparation Guide',
          slug: 'tournament-preparation-guide',
          content: 'How to prepare mentally and strategically for chess tournaments...',
          featured_image: '/images/blog/tournament-prep.jpg',
          status: 'published',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          title: 'Famous Chess Openings Explained',
          slug: 'famous-chess-openings-explained',
          content: 'Explore the most popular chess openings and when to use them...',
          featured_image: '/images/blog/chess-openings.jpg',
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      return NextResponse.json(mockBlogs);
    }

    // Production mode with database
    const { getAllBlogs } = await import('../../../../../lib/db.js');
    const blogs = await getAllBlogs();
    return NextResponse.json(blogs);

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
    const { title, content, featured_image, status } = body;

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

    // Development mode - simulate creating blog
    if (process.env.DEVELOPMENT_MODE === 'true') {
      const newBlog = {
        id: Date.now(),
        title,
        slug,
        content,
        featured_image: featured_image || '',
        status: status || 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        message: 'Blog created successfully (development mode)',
        blog: newBlog
      });
    }

    // Production mode with database
    const { createBlog } = await import('../../../../../lib/db.js');
    const newBlog = await createBlog({
      title,
      slug,
      content,
      featured_image: featured_image || '',
      status: status || 'draft'
    });

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
    const { id, title, content, featured_image, status } = body;

    if (!id || !title || !content) {
      return NextResponse.json(
        { error: 'ID, title and content are required' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Development mode - simulate updating blog
    if (process.env.DEVELOPMENT_MODE === 'true') {
      const updatedBlog = {
        id,
        title,
        slug,
        content,
        featured_image: featured_image || '',
        status: status || 'draft',
        updated_at: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        message: 'Blog updated successfully (development mode)',
        blog: updatedBlog
      });
    }

    // Production mode with database
    const { updateBlog } = await import('../../../../../lib/db.js');
    const updatedBlog = await updateBlog(id, {
      title,
      slug,
      content,
      featured_image: featured_image || '',
      status: status || 'draft'
    });

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

    // Development mode - simulate deletion
    if (process.env.DEVELOPMENT_MODE === 'true') {
      return NextResponse.json({
        success: true,
        message: 'Blog deleted successfully (development mode)'
      });
    }

    // Production mode with database
    const { deleteBlog } = await import('../../../../../lib/db.js');
    await deleteBlog(parseInt(id));

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
