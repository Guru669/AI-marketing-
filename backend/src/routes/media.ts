import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

// Multer — store in memory so we can pipe to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: jpg, png, mp4, mov`));
    }
  },
});

/**
 * POST /api/media/upload
 * Body: multipart/form-data with field "media"
 * Returns: { url, publicId, resourceType, format, bytes }
 */
router.post('/upload', upload.single('media'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const isVideo = req.file.mimetype.startsWith('video/');
  const resourceType: 'image' | 'video' = isVideo ? 'video' : 'image';

  try {
    // Check Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      // Dev fallback: return a mock URL so the UI still works
      return res.json({
        url: `https://placehold.co/800x600?text=Media+Upload+Placeholder`,
        publicId: 'dev-placeholder',
        resourceType,
        format: isVideo ? 'mp4' : 'jpg',
        bytes: req.file.size,
        dev: true,
      });
    }

    // Upload to Cloudinary via stream
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'marketai',
          resource_type: resourceType,
          // Auto-generate a unique public_id
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      const readable = new Readable();
      readable.push(req.file!.buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });

    return res.json({
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      format: result.format,
      bytes: result.bytes,
    });
  } catch (err: any) {
    console.error('[media/upload] Error:', err);
    return res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

export default router;
