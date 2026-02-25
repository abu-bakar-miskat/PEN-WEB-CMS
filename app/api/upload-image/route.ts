import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type - support images, PDFs, and videos
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime',
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images, PDFs, and videos are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB for videos, 10MB for PDFs, no limit for images)
    const isVideo = file.type.startsWith('video/');
    const isPDF = file.type === 'application/pdf';
    
    // Only validate size for videos and PDFs, no limit for images
    if (isVideo || isPDF) {
      const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB for videos, 10MB for PDFs
      if (file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024));
        return NextResponse.json(
          { error: `File size too large. Maximum size is ${maxSizeMB}MB.` },
          { status: 400 }
        );
      }
    }

    // Generate unique filename - simple pattern like reference implementation
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `${fileName}`;

    // Upload file to Supabase storage bucket
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading file:', error.message);
      console.error('Error details:', error);
      return NextResponse.json(
        { error: `Upload failed: ${error.message}` },
        { status: 500 }
      );
    }

    if (!data?.path) {
      console.error('Error: Upload data path not found');
      return NextResponse.json(
        { error: 'Upload failed: No path returned' },
        { status: 500 }
      );
    }

    console.log('File uploaded successfully. Path:', data.path);
    console.log('Full upload data:', JSON.stringify(data, null, 2));

    // Get public URL - use same bucket name as upload
    const publicUrlData = supabase.storage
      .from('uploads')
      .getPublicUrl(data.path);

    if (!publicUrlData.data.publicUrl) {
      console.error('Error getting public URL.');
      return NextResponse.json(
        { error: 'Failed to get public URL' },
        { status: 500 }
      );
    }

    console.log('Upload successful. Public URL:', publicUrlData.data.publicUrl);

    return NextResponse.json({
      url: publicUrlData.data.publicUrl,
      path: data.path,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
