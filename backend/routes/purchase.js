import express from 'express';
import { purchaseBook, getMyBooks } from '../controllers/bookController.js';
import { checkPurchaseStatus } from '../controllers/reviewController.js';
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

/**
 * @route   GET /api/purchase/has-purchased/:bookId
 * @desc    Check if authenticated user has purchased a book
 * @access  Private
 */
router.get('/has-purchased/:bookId', authenticate, checkPurchaseStatus);

export default router;

