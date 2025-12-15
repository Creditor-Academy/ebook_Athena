import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserProfile,
  deleteUser,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import {
  updateRoleValidation,
  updateProfileValidation,
} from '../middleware/validators.js';

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users (Super Admin only)
 * @access  Private (Super Admin)
 */
router.get('/', authenticate, authorize('SUPER_ADMIN'), getAllUsers);

/**
 * @route   GET /api/users/:userId
 * @desc    Get user by ID
 * @access  Private (Admin/Super Admin can view any, User can view own)
 */
router.get('/:userId', authenticate, getUserById);

/**
 * @route   PATCH /api/users/:userId/role
 * @desc    Update user role (Super Admin only)
 * @access  Private (Super Admin)
 */
router.patch(
  '/:userId/role',
  authenticate,
  authorize('SUPER_ADMIN'),
  updateRoleValidation,
  validate,
  updateUserRole
);

/**
 * @route   PATCH /api/users/:userId/profile
 * @desc    Update user profile (Admin/Super Admin can update any, User can update own)
 * @access  Private
 */
router.patch(
  '/:userId/profile',
  authenticate,
  updateProfileValidation,
  validate,
  updateUserProfile
);

/**
 * @route   DELETE /api/users/:userId
 * @desc    Delete user (Super Admin only)
 * @access  Private (Super Admin)
 */
router.delete('/:userId', authenticate, authorize('SUPER_ADMIN'), deleteUser);

export default router;

