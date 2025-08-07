import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    console.log('📤 Upload API called');

    const formData = await request.formData();
    const file = formData.get('file') || formData.get('image');

    console.log('📁 File received:', file ? `${file.name} (${file.size} bytes)` : 'No file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (max 2MB for better compatibility)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 2MB' }, { status: 400 });
    }

    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${originalName}`;

    try {
      // Convert file to base64 for storage (Vercel compatible)
      console.log('🔄 Converting to base64...');
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;

      console.log(`✅ Image converted successfully: ${filename} (${file.size} bytes)`);

      return NextResponse.json({
        success: true,
        url: dataUrl,
        filename: filename,
        name: filename,
        message: 'Image uploaded successfully!'
      });

    } catch (conversionError) {
      console.error('💥 Base64 conversion error:', conversionError);

      // Fallback to existing placeholder images if conversion fails
      const placeholderImages = [
        '/images/chess-tournament.webp',
        '/images/tournament-flyer.jpg',
        '/images/tournament.jpg',
        '/images/offline-students-playing.jpg',
        '/images/online-program.jpg',
        '/images/course-offered.jpg'
      ];

      const randomPlaceholder = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];

      console.log('🔄 Using placeholder image:', randomPlaceholder);

      return NextResponse.json({
        success: true,
        url: randomPlaceholder,
        filename: filename,
        name: filename,
        message: 'Using placeholder image (conversion failed)'
      });
    }

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
