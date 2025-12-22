import express from 'express';
import {
  addBookmark,
  getBookmarksByBook,
  getAllBookmarks,
  getLastPosition,
  updateBookmark,
  deleteBookmark,
} from '../controllers/bookmarkController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/bookmarks
 * @desc    Add a bookmark (reading position with selected text)
 * @access  Private
 */
router.post('/', authenticate, addBookmark);

/**
 * @route   GET /api/bookmarks
 * @desc    Get all bookmarks for user (with pagination)
 * @access  Private
 */
router.get('/', authenticate, getAllBookmarks);

/**
 * @route   GET /api/bookmarks/book/:bookId
 * @desc    Get all bookmarks for a specific book
 * @access  Private
 */
router.get('/book/:bookId', authenticate, getBookmarksByBook);

/**
 * @route   GET /api/bookmarks/last-position/:bookId
 * @desc    Get last reading position for a book
 * @access  Private
 */
router.get('/last-position/:bookId', authenticate, getLastPosition);

/**
 * @route   PATCH /api/bookmarks/:bookmarkId
 * @desc    Update a bookmark
 * @access  Private
 */
router.patch('/:bookmarkId', authenticate, updateBookmark);

/**
 * @route   DELETE /api/bookmarks/:bookmarkId
 * @desc    Delete a bookmark
 * @access  Private
 */
router.delete('/:bookmarkId', authenticate, deleteBookmark);

export default router;

