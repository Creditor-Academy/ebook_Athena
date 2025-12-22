import { sendDeletionNotificationEmail } from '../utils/email.js';
import prisma from '../lib/prisma.js';

/**
 * Send deletion notification email
 * @route POST /api/email/deletion-notification
 */
export async function sendDeletionNotification(req, res) {
  try {
    const { email, subject, message, type, itemName, firstName } = req.body;

    if (!email) {
      return res.status(400).json({
        error: {
          message: 'Email is required',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    if (!type || !['book', 'author'].includes(type)) {
      return res.status(400).json({
        error: {
          message: 'Type must be either "book" or "author"',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    if (!itemName) {
      return res.status(400).json({
        error: {
          message: 'Item name is required',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    await sendDeletionNotificationEmail(
      email,
      subject,
      message,
      type,
      itemName,
      firstName
    );

    res.json({
      message: 'Deletion notification email sent successfully',
    });
  } catch (error) {
    console.error('Send deletion notification error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to send deletion notification email',
        code: 'EMAIL_SEND_ERROR',
      },
    });
  }
}

