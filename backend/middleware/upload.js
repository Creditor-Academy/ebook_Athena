import multer from 'multer';
import { generateS3FileName, isValidFileType, isValidFileSize } from '../utils/s3.js';

// Configure multer to use memory storage (files will be in memory as Buffer)
const storage = multer.memoryStorage();

// File size limits (in bytes)
const MAX_COVER_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_BOOK_SIZE = 50 * 1024 * 1024; // 50MB

// Allowed file types
const ALLOWED_COVER_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_BOOK_TYPES = ['application/epub+zip', 'application/epub'];

/**
 * Multer middleware for cover image upload
 */
export const uploadCover = multer({
  storage,
  limits: {
    fileSize: MAX_COVER_SIZE,
  },
  fileFilter: (req, file, cb) => {
    if (isValidFileType(file.mimetype, ALLOWED_COVER_TYPES)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type. Allowed types: ${ALLOWED_COVER_TYPES.join(', ')}`
        ),
        false
      );
    }
  },
}).single('cover');

/**
 * Multer middleware for book file upload
 */
export const uploadBook = multer({
  storage,
  limits: {
    fileSize: MAX_BOOK_SIZE,
  },
  fileFilter: (req, file, cb) => {
    // Check both MIME type and file extension
    const isValidMime = isValidFileType(file.mimetype, ALLOWED_BOOK_TYPES);
    const isValidExt = file.originalname.toLowerCase().endsWith('.epub');

    if (isValidMime || isValidExt) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Invalid file type. Only EPUB files (.epub) are allowed.'
        ),
        false
      );
    }
  },
}).single('epub');

/**
 * Combined multer middleware for both cover and book file
 */
export const uploadBookFiles = multer({
  storage,
  limits: {
    fileSize: MAX_BOOK_SIZE, // Use the larger limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'cover') {
      // Cover image validation
      if (isValidFileType(file.mimetype, ALLOWED_COVER_TYPES)) {
        cb(null, true);
      } else {
        cb(
          new Error(
            `Invalid cover image type. Allowed: ${ALLOWED_COVER_TYPES.join(', ')}`
          ),
          false
        );
      }
    } else if (file.fieldname === 'epub') {
      // Book file validation
      const isValidMime = isValidFileType(file.mimetype, ALLOWED_BOOK_TYPES);
      const isValidExt = file.originalname.toLowerCase().endsWith('.epub');

      if (isValidMime || isValidExt) {
        cb(null, true);
      } else {
        cb(
          new Error('Invalid book file type. Only EPUB files (.epub) are allowed.'),
          false
        );
      }
    } else {
      cb(new Error('Unknown field name'), false);
    }
  },
}).fields([
  { name: 'cover', maxCount: 1 },
  { name: 'epub', maxCount: 1 },
]);

/**
 * Error handler for multer errors
 */
export function handleUploadError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: {
          message: 'File size exceeds the maximum allowed size',
          code: 'FILE_TOO_LARGE',
        },
      });
    }
    return res.status(400).json({
      error: {
        message: err.message,
        code: 'UPLOAD_ERROR',
      },
    });
  }

  if (err) {
    return res.status(400).json({
      error: {
        message: err.message,
        code: 'UPLOAD_ERROR',
      },
    });
  }

  next();
}

