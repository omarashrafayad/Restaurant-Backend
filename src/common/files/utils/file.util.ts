import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function processAndSaveImage(
  buffer: Buffer,
  destinationFolder: string,
  prefix: string,
  width = 600,
  height = 600,
): Promise<string> {
  const filename = `${prefix}-${crypto.randomUUID()}-${Date.now()}.jpeg`;
  const targetDir = path.join(process.cwd(), 'uploads', destinationFolder);

  await fs.mkdir(targetDir, { recursive: true });
  const targetPath = path.join(targetDir, filename);

  await sharp(buffer)
    .resize(width, height)
    .toFormat('jpeg')
    .jpeg({ quality: 95 })
    .toFile(targetPath);

  return filename;
}
