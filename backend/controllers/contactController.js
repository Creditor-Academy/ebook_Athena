import prisma from '../lib/prisma.js';

/**
 * Submit contact form
 */
export async function submitContact(req, res) {
  try {
    const { name, email, bookTitle, message } = req.body;

    // Validate required fields
    if (!name || !email || !bookTitle || !message) {
      return res.status(400).json({
        error: {
          message: 'All fields are required',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    // Create contact submission
    const submission = await prisma.contactSubmission.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        bookTitle: bookTitle.trim(),
        message: message.trim(),
        status: 'PENDING',
      },
    });

    res.status(201).json({
      message: 'Contact submission received successfully',
      submission: {
        id: submission.id,
        name: submission.name,
        email: submission.email,
        bookTitle: submission.bookTitle,
        message: submission.message,
        status: submission.status,
        createdAt: submission.createdAt,
      },
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to submit contact form',
        code: 'SUBMISSION_ERROR',
      },
    });
  }
}

/**
 * Get all contact submissions (Admin/Super Admin only)
 */
export async function getContactSubmissions(req, res) {
  try {
    const submissions = await prisma.contactSubmission.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      submissions,
      count: submissions.length,
    });
  } catch (error) {
    console.error('Get contact submissions error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch contact submissions',
        code: 'FETCH_ERROR',
      },
    });
  }
}

/**
 * Update contact submission status (Admin/Super Admin only)
 */
export async function updateContactStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['PENDING', 'REVIEWED', 'APPROVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: {
          message: 'Invalid status. Must be one of: PENDING, REVIEWED, APPROVED, REJECTED',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    const submission = await prisma.contactSubmission.update({
      where: { id },
      data: { status },
    });

    res.json({
      message: 'Contact submission status updated successfully',
      submission,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: {
          message: 'Contact submission not found',
          code: 'NOT_FOUND',
        },
      });
    }
    console.error('Update contact status error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to update contact submission status',
        code: 'UPDATE_ERROR',
      },
    });
  }
}

