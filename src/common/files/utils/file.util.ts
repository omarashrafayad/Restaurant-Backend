import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { BadRequestException } from '../../error-handling/custom-excepction/bad-request.exceprions.js';

/**
 * Resizes, converts to JPEG and stores an uploaded image under uploads/<folder>.
 * Returns the relative upload path (e.g. `products/product-<uuid>.jpeg`);
 * it is turned into an absolute URL when serialized (see UploadUrlInterceptor).
 */
export async function processAndSaveImage(
  buffer: Buffer,
  destinationFolder: string,
  prefix: string,
  width = 600,
  height = 600,
): Promise<string> {
  const filename = `${prefix}-${crypto.randomUUID()}.jpeg`;
  const targetDir = path.join(process.cwd(), 'uploads', destinationFolder);

  await fs.mkdir(targetDir, { recursive: true });
  const targetPath = path.join(targetDir, filename);

  try {
    await sharp(buffer)
      .rotate()
      .resize(width, height, { fit: 'cover' })
      .toFormat('jpeg')
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(targetPath);
  } catch {
    throw new BadRequestException('Uploaded file is not a valid image');
  }

  return `${destinationFolder}/${filename}`;
}
