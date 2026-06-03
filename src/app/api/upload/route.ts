import { mkdir, unlink, writeFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

function isSafeUploadPath(url: string) {
  return url.startsWith('/uploads/') && !url.includes('..');
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const file = formData.get('file');
  const oldImageUrl = formData.get('oldImageUrl');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, { recursive: true });

  const extension = file.name.split('.').pop() || 'jpg';
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const filePath = path.join(uploadDir, fileName);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await writeFile(filePath, buffer);

  if (
    typeof oldImageUrl === 'string' &&
    oldImageUrl &&
    oldImageUrl !== '/placeholder.png' &&
    isSafeUploadPath(oldImageUrl)
  ) {
    const oldFilePath = path.join(process.cwd(), 'public', oldImageUrl);

    try {
      await unlink(oldFilePath);
    } catch {}
  }

  return NextResponse.json({
    url: `/uploads/${fileName}`,
  });
}

export async function DELETE(request: Request) {
  const { imageUrl } = await request.json();

  if (
    typeof imageUrl !== 'string' ||
    !imageUrl ||
    imageUrl === '/placeholder.png' ||
    !isSafeUploadPath(imageUrl)
  ) {
    return NextResponse.json({ error: 'Invalid image url' }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), 'public', imageUrl);

  try {
    await unlink(filePath);
  } catch {}

  return NextResponse.json({ success: true });
}
