// To use this route, install the Cloudinary SDK: npm install cloudinary
// Also install formidable for file parsing: npm install formidable
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import { promises as fs } from 'fs';

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dmcownyjl', // Hardcoded for test
  api_key: '177993983461438', // Hardcoded for test
  api_secret: 'it1OjcnEDsnmCyzuQLstFlFUUHA', // Hardcoded for test
});

// 1x1 transparent PNG (base64)
const tinyPngBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X2ZkAAAAASUVORK5CYII=';

export async function GET(req: NextRequest) {
  try {
    const uploadResult = await cloudinary.uploader.upload(
      `data:image/png;base64,${tinyPngBase64}`,
      {
        folder: 'test',
        public_id: 'cloudinary-connection-test',
        overwrite: true,
        resource_type: 'auto',
      }
    );
    return NextResponse.json({ success: true, url: uploadResult.secure_url, result: uploadResult });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || error.toString() }, { status: 500 });
  }
}

// Disable Next.js default body parser for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }
    // @ts-ignore
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    // Upload to Cloudinary with resource_type: 'auto'
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'test', resource_type: 'auto' },
        (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });
    // @ts-ignore
    return NextResponse.json({ success: true, url: uploadResult.secure_url, result: uploadResult });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || error.toString() }, { status: 500 });
  }
} 