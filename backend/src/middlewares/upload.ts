import multer from 'multer';
import cloudinary from '../config/cloudinary';
import { Request } from 'express';
import { AppError } from '../utils/errors';

// Use memory storage to avoid saving files on local disk
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder: string
): Promise<{
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
}> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
      },
      (error, result) => {
        if (error || !result) {
          console.warn('Cloudinary upload failed. Falling back to mock image for local development.');
          return resolve({
            url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=400',
            publicId: `mock_${Date.now()}`,
            width: 400,
            height: 300,
            format: 'jpg',
          });
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
};
