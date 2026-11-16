import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface.js';
import { BadRequestException } from '../error-handling/custom-excepction/bad-request.exceprions.js';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

/** Shared multer options for every image upload endpoint (5MB, images only). */
export const imageUploadOptions: MulterOptions = {
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      return cb(new BadRequestException('Only JPEG, PNG or WEBP images are allowed'), false);
    }
    cb(null, true);
  },
};
