import express from 'express';
import { summarizeChapter } from '../controllers/summarizeController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/summarize
 * @desc    Generate summary for a specific chapter/lesson
 * @access  Private
 */
router.post('/', authenticate, summarizeChapter);

export default router;

