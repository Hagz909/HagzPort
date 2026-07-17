import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getRequiredSession } from '@/lib/auth-helpers';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    await getRequiredSession();
    
    const { publicId } = await request.json();
    
    if (!publicId) {
      return NextResponse.json({ message: 'publicId is required' }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(publicId);
    
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Terjadi kesalahan' }, { status: 500 });
  }
}
