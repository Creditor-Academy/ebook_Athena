import express from 'express';
import { createReview, getBookReviews } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/reviews
 * @desc    Create a review for a book (requires purchase)
 * @access  Private
 */
router.post('/', authenticate, createReview);

/**
 * @route   GET /api/reviews/:bookId
 * @desc    Get all reviews for a book
 * @access  Public
 */
router.get('/:bookId', getBookReviews);

export default router;

