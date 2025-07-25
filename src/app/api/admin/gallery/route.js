import { NextResponse } from 'next/server';

async function handleGalleryRequest() {
  try {
    // Development mode - return mock gallery data
    if (process.env.DEVELOPMENT_MODE === 'true') {
      const mockGallery = [
        {
          id: 1,
          image_url: '/images/gallery/tournament1.jpg',
          image_name: 'Tournament Championship 2024',
          display_order: 1,
          uploaded_at: new Date().toISOString()
        },
        {
          id: 2,
          image_url: '/images/gallery/students1.jpg',
          image_name: 'Young Chess Masters',
          display_order: 2,
          uploaded_at: new Date().toISOString()
        },
        {
          id: 3,
          image_url: '/images/gallery/coaching1.jpg',
          image_name: 'Coaching Session',
          display_order: 3,
          uploaded_at: new Date().toISOString()
        },
        {
          id: 4,
          image_url: '/images/gallery/awards1.jpg',
          image_name: 'Award Ceremony',
          display_order: 4,
          uploaded_at: new Date().toISOString()
        }
      ];

      const response = NextResponse.json(mockGallery);

      // Add caching headers
      response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
      response.headers.set('CDN-Cache-Control', 'public, s-maxage=300');
      response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=300');

      return response;
    }

    // Production mode with database
    const { getAllGalleryImages } = await import('../../../../../lib/db.js');
    const images = await getAllGalleryImages();

    const response = NextResponse.json(images);

    // Add caching headers
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=300');
    response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=300');

    return response;

  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery images' },
      { status: 500 }
    );
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

    // Development mode - simulate adding image
    if (process.env.DEVELOPMENT_MODE === 'true') {
      const newImage = {
        id: Date.now(),
        image_url,
        image_name,
        display_order: display_order || 0,
        uploaded_at: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        message: 'Image added successfully (development mode)',
        image: newImage
      });
    }

    // Production mode with database
    const { addGalleryImage } = await import('../../../../../lib/db.js');
    const newImage = await addGalleryImage({
      image_url,
      image_name,
      display_order: display_order || 0
    });

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

    // Development mode - simulate reordering
    if (process.env.DEVELOPMENT_MODE === 'true') {
      return NextResponse.json({
        success: true,
        message: 'Image order updated successfully (development mode)'
      });
    }

    // Production mode with database
    const { updateGalleryImageOrder } = await import('../../../../../lib/db.js');
    await updateGalleryImageOrder(imageOrders);

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

    // Development mode - simulate deletion
    if (process.env.DEVELOPMENT_MODE === 'true') {
      return NextResponse.json({
        success: true,
        message: 'Image deleted successfully (development mode)'
      });
    }

    // Production mode with database
    const { deleteGalleryImage } = await import('../../../../../lib/db.js');
    await deleteGalleryImage(parseInt(id));

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
