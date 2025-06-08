
import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { createError } from '../middleware/errorHandler';
import { requireEditor } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const typeDir = file.mimetype.startsWith('image/') ? 'images' : 'videos';
    const fullPath = path.join(uploadDir, typeDir);
    
    try {
      await fs.mkdir(fullPath, { recursive: true });
      cb(null, fullPath);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/webp',
      'video/mp4'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  }
});

// Upload single file
router.post('/single', requireEditor, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw createError('No file uploaded', 400);
    }

    let processedFile = req.file;

    // Process image files
    if (req.file.mimetype.startsWith('image/')) {
      const { width, height, quality } = req.body;
      
      if (width || height || quality) {
        const outputPath = req.file.path.replace(path.extname(req.file.path), '-processed.webp');
        
        let sharpInstance = sharp(req.file.path);
        
        if (width || height) {
          sharpInstance = sharpInstance.resize(
            width ? parseInt(width) : undefined,
            height ? parseInt(height) : undefined,
            { fit: 'inside', withoutEnlargement: true }
          );
        }
        
        await sharpInstance
          .webp({ quality: quality ? parseInt(quality) : 80 })
          .toFile(outputPath);
        
        // Remove original file
        await fs.unlink(req.file.path);
        
        processedFile = {
          ...req.file,
          path: outputPath,
          filename: path.basename(outputPath),
          mimetype: 'image/webp'
        };
      }
    }

    const fileUrl = `/uploads/${path.relative(process.env.UPLOAD_DIR || 'uploads', processedFile.path)}`;

    logger.info('File uploaded', {
      filename: processedFile.filename,
      size: processedFile.size,
      mimetype: processedFile.mimetype,
      uploadedBy: req.user!.id
    });

    res.json({
      success: true,
      data: {
        filename: processedFile.filename,
        originalName: req.file.originalname,
        mimetype: processedFile.mimetype,
        size: processedFile.size,
        url: fileUrl
      }
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        logger.error('Failed to clean up uploaded file', { error: unlinkError });
      }
    }
    next(error);
  }
});

// Upload multiple files
router.post('/multiple', requireEditor, upload.array('files', 10), async (req, res, next) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw createError('No files uploaded', 400);
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      let processedFile = file;

      // Process image files
      if (file.mimetype.startsWith('image/')) {
        const outputPath = file.path.replace(path.extname(file.path), '-processed.webp');
        
        await sharp(file.path)
          .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(outputPath);
        
        // Remove original file
        await fs.unlink(file.path);
        
        processedFile = {
          ...file,
          path: outputPath,
          filename: path.basename(outputPath),
          mimetype: 'image/webp'
        };
      }

      const fileUrl = `/uploads/${path.relative(process.env.UPLOAD_DIR || 'uploads', processedFile.path)}`;

      uploadedFiles.push({
        filename: processedFile.filename,
        originalName: file.originalname,
        mimetype: processedFile.mimetype,
        size: processedFile.size,
        url: fileUrl
      });
    }

    logger.info('Multiple files uploaded', {
      count: uploadedFiles.length,
      uploadedBy: req.user!.id
    });

    res.json({
      success: true,
      data: uploadedFiles
    });
  } catch (error) {
    // Clean up uploaded files on error
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          logger.error('Failed to clean up uploaded file', { error: unlinkError });
        }
      }
    }
    next(error);
  }
});

// Delete file
router.delete('/:filename', requireEditor, async (req, res, next) => {
  try {
    const filename = req.params.filename;
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    
    // Search for file in subdirectories
    const possiblePaths = [
      path.join(uploadDir, 'images', filename),
      path.join(uploadDir, 'videos', filename),
      path.join(uploadDir, filename)
    ];

    let filePath = null;
    for (const possiblePath of possiblePaths) {
      try {
        await fs.access(possiblePath);
        filePath = possiblePath;
        break;
      } catch {
        // File doesn't exist at this path, continue
      }
    }

    if (!filePath) {
      throw createError('File not found', 404);
    }

    await fs.unlink(filePath);

    logger.info('File deleted', {
      filename,
      deletedBy: req.user!.id
    });

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get file info
router.get('/:filename', async (req, res, next) => {
  try {
    const filename = req.params.filename;
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    
    // Search for file in subdirectories
    const possiblePaths = [
      path.join(uploadDir, 'images', filename),
      path.join(uploadDir, 'videos', filename),
      path.join(uploadDir, filename)
    ];

    let filePath = null;
    for (const possiblePath of possiblePaths) {
      try {
        await fs.access(possiblePath);
        filePath = possiblePath;
        break;
      } catch {
        // File doesn't exist at this path, continue
      }
    }

    if (!filePath) {
      throw createError('File not found', 404);
    }

    const stats = await fs.stat(filePath);
    const fileUrl = `/uploads/${path.relative(uploadDir, filePath)}`;

    res.json({
      success: true,
      data: {
        filename,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        url: fileUrl
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
