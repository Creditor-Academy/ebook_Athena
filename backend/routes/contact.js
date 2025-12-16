import express from 'express';
import {
  submitContact,
  getContactSubmissions,
  updateContactStatus,
} from '../controllers/contactController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/auth.js';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   POST /api/contact
 * @desc    Submit contact form
 * @access  Public
 */
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('bookTitle').trim().notEmpty().withMessage('Book title is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
  ],
  validate,
  submitContact
);

/**
 * @route   GET /api/contact
 * @desc    Get all contact submissions
 * @access  Admin/Super Admin only
 */
router.get(
  '/',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  getContactSubmissions
);

/**
 * @route   PATCH /api/contact/:id/status
 * @desc    Update contact submission status
 * @access  Admin/Super Admin only
 */
router.patch(
  '/:id/status',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  [
    param('id').isUUID().withMessage('Invalid submission ID'),
    body('status')
      .isIn(['PENDING', 'REVIEWED', 'APPROVED', 'REJECTED'])
      .withMessage('Invalid status'),
  ],
  validate,
  updateContactStatus
);

export default router;

