import express from 'express';
import { purchaseBook, getMyBooks } from '../controllers/bookController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { purchaseBookValidation } from '../middleware/validators.js';

const router = express.Router();

/**
 * @route   POST /api/purchase
 * @desc    Purchase a book
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  purchaseBookValidation,
  validate,
  purchaseBook
);

export default router;

