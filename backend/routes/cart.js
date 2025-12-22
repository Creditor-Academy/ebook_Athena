import express from 'express';
import {
  addToCart,
  removeFromCart,
  updateCartItem,
  getCart,
  clearCart,
  getCartCount,
} from '../controllers/cartController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/cart
 * @desc    Add a book to user's cart
 * @access  Private
 */
router.post('/', authenticate, addToCart);

/**
 * @route   DELETE /api/cart/:bookId
 * @desc    Remove a book from user's cart
 * @access  Private
 */
router.delete('/:bookId', authenticate, removeFromCart);

/**
 * @route   PATCH /api/cart/:bookId
 * @desc    Update cart item quantity
 * @access  Private
 */
router.patch('/:bookId', authenticate, updateCartItem);

/**
 * @route   GET /api/cart
 * @desc    Get user's cart with total pricing
 * @access  Private
 */
router.get('/', authenticate, getCart);

/**
 * @route   DELETE /api/cart
 * @desc    Clear user's cart (remove all items)
 * @access  Private
 */
router.delete('/', authenticate, clearCart);

/**
 * @route   GET /api/cart/count
 * @desc    Get cart count (number of items and total quantity)
 * @access  Private
 */
router.get('/count', authenticate, getCartCount);

export default router;

