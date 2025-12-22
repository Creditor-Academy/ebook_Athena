import express from 'express';
import { sendDeletionNotification } from '../controllers/emailController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/email/deletion-notification
 * @desc    Send deletion notification email (Admin/Super Admin only)
 * @access  Private (Admin/Super Admin)
 */
router.post(
  '/deletion-notification',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  sendDeletionNotification
);

export default router;

