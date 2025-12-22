import express from 'express';
import {
  createBook,
  getAllBooks,
  getBookById,
  uploadBookWithFiles,
  getMyUploadedBooks,
  getBookChapters,
  getPopularBooks,
} from '../controllers/bookController.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { createBookValidation } from '../middleware/validators.js';
import { uploadBookFiles, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

/**
 * @route   POST /api/books
 * @desc    Create a new book with S3 URLs (Admin only)
 * @access  Private (Admin/Super Admin)
 */
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  createBookValidation,
  validate,
  createBook
);

/**
 * @route   POST /api/books/upload
 * @desc    Upload book with files (cover image and EPUB) - Admin only
 * @access  Private (Admin/Super Admin)
 */
router.post(
  '/upload',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  uploadBookFiles,
  handleUploadError,
  uploadBookWithFiles
);

/**
 * @route   GET /api/books
 * @desc    Get all books (public, only active books)
 * @access  Public
 */
router.get('/', getAllBooks);

/**
 * @route   GET /api/books/popular
 * @desc    Get popular books (most purchased books)
 * @access  Public
 * @note    Must be defined before /:id route to avoid route conflicts
 */
router.get('/popular', getPopularBooks);

/**
 * @route   GET /api/books/my-uploaded
 * @desc    Get books uploaded by the authenticated author/user (for dashboard)
 * @access  Private (Authenticated users only)
 */
router.get('/my-uploaded', authenticate, getMyUploadedBooks);

/**
 * @route   GET /api/books/:id/chapters
 * @desc    Get chapters/table of contents for a book
 * @access  Public
 */
router.get('/:id/chapters', getBookChapters);

/**
 * @route   GET /api/books/:id
 * @desc    Get book by ID (public, but shows bookFileUrl if user owns it)
 * @access  Public (with optional auth)
 */
router.get('/:id', optionalAuth, getBookById);

export default router;
