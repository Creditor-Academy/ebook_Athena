import express from 'express';
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  checkWishlistStatus,
  getWishlistCount,
} from '../controllers/wishlistController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/wishlist
 * @desc    Add a book to user's wishlist
 * @access  Private
 */
router.post('/', authenticate, addToWishlist);

/**
 * @route   DELETE /api/wishlist/:bookId
 * @desc    Remove a book from user's wishlist
 * @access  Private
 */
router.delete('/:bookId', authenticate, removeFromWishlist);

/**
 * @route   GET /api/wishlist
 * @desc    Get user's wishlist
 * @access  Private
 */
router.get('/', authenticate, getWishlist);

/**
 * @route   GET /api/wishlist/count
 * @desc    Get wishlist count for user
 * @access  Private
 */
router.get('/count', authenticate, getWishlistCount);

/**
 * @route   GET /api/wishlist/check/:bookId
 * @desc    Check if a book is in user's wishlist
 * @access  Private
 */
router.get('/check/:bookId', authenticate, checkWishlistStatus);

export default router;

