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

    // Convert file to base64 for storage (Vercel compatible)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${originalName}`;

    // Store the image data in SimpleDB for persistence
    try {
      const SimpleDatabase = (await import('../../../../lib/simple-db.js')).default;
      const db = new SimpleDatabase();

      // Store image in uploaded_files table
      await db.run(`
        INSERT INTO uploaded_files (filename, original_name, file_type, file_size, data_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [filename, file.name, file.type, file.size, dataUrl, new Date().toISOString()]);

      console.log(`✅ Real image uploaded and stored: ${filename}`);
    } catch (dbError) {
      console.error('Database storage error:', dbError);
      // Continue with base64 URL even if DB storage fails
    }

    return NextResponse.json({
      success: true,
      url: dataUrl,
      filename: filename,
      message: 'Real image uploaded successfully!'
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
