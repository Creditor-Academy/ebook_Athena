import express from 'express';
import { getMyBooks } from '../controllers/bookController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/my-books
 * @desc    Get user's purchased books
 * @access  Private
 */
router.get('/', authenticate, getMyBooks);

export default router;

