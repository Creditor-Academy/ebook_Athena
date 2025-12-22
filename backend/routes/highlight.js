import express from 'express';
import {
  addHighlight,
  getHighlightsByBook,
  getAllHighlights,
  updateHighlight,
  deleteHighlight,
  getHighlightCount,
} from '../controllers/highlightController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/highlights
 * @desc    Add a highlight (text selection with color)
 * @access  Private (Authenticated users only)
 */
router.post('/', authenticate, addHighlight);

/**
 * @route   GET /api/highlights/book/:bookId
 * @desc    Get all highlights for a specific book
 * @access  Private (Authenticated users only, must own the book)
 */
router.get('/book/:bookId', authenticate, getHighlightsByBook);

/**
 * @route   GET /api/highlights
 * @desc    Get all highlights for the authenticated user (with optional filters)
 * @access  Private (Authenticated users only)
 */
router.get('/', authenticate, getAllHighlights);

/**
 * @route   GET /api/highlights/count/:bookId
 * @desc    Get highlight count for a book
 * @access  Private (Authenticated users only)
 */
router.get('/count/:bookId', authenticate, getHighlightCount);

/**
 * @route   PATCH /api/highlights/:highlightId
 * @desc    Update a highlight (color, note)
 * @access  Private (Authenticated users only, must own the highlight)
 */
router.patch('/:highlightId', authenticate, updateHighlight);

/**
 * @route   DELETE /api/highlights/:highlightId
 * @desc    Delete a highlight
 * @access  Private (Authenticated users only, must own the highlight)
 */
router.delete('/:highlightId', authenticate, deleteHighlight);

export default router;

