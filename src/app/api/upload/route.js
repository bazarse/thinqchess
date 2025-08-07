import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') || formData.get('image');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // For Vercel deployment, we'll use a placeholder image
    // In production, you would integrate with a cloud storage service like:
    // - Cloudinary
    // - AWS S3
    // - Vercel Blob
    // - Firebase Storage

    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${originalName}`;

    // Return a placeholder image URL for demo purposes
    // You can replace this with actual cloud storage integration
    const placeholderImages = [
      '/images/chess-tournament.webp',
      '/images/tournament-flyer.jpg',
      '/images/tournament.jpg',
      '/images/offline-students-playing.jpg',
      '/images/online-program.jpg',
      '/images/course-offered.jpg'
    ];

    const randomPlaceholder = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];

    return NextResponse.json({
      success: true,
      url: randomPlaceholder,
      filename: filename,
      message: 'File uploaded successfully (using placeholder for demo)'
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
