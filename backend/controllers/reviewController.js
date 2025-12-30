import prisma from '../lib/prisma.js';

/**
 * Create a review for a book
 * Requires authentication and purchase verification
 */
export async function createReview(req, res) {
  try {
    const userId = req.userId;
    const { bookId, rating, comment } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
      });
    }

    if (!bookId || !rating) {
      return res.status(400).json({
        error: {
          message: 'Book ID and rating are required',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    // Validate rating
    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        error: {
          message: 'Rating must be between 1 and 5',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return res.status(404).json({
        error: {
          message: 'Book not found',
          code: 'BOOK_NOT_FOUND',
        },
      });
    }

    // Verify user has purchased the book
    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    if (!purchase || purchase.status !== 'COMPLETED') {
      return res.status(403).json({
        error: {
          message: 'You must purchase this book before leaving a review',
          code: 'PURCHASE_REQUIRED',
        },
      });
    }

    // Check if user already reviewed this book
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    if (existingReview) {
      // Update existing review
      const updatedReview = await prisma.review.update({
        where: {
          userId_bookId: {
            userId,
            bookId,
          },
        },
        data: {
          rating: ratingNum,
          comment: comment || null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Update book's average rating
      await updateBookRating(bookId);

      return res.json({
        message: 'Review updated successfully',
        review: {
          id: updatedReview.id,
          rating: updatedReview.rating,
          comment: updatedReview.comment,
          createdAt: updatedReview.createdAt,
          updatedAt: updatedReview.updatedAt,
          user: {
            name: updatedReview.user.name || 
                  `${updatedReview.user.firstName || ''} ${updatedReview.user.lastName || ''}`.trim() || 
                  updatedReview.user.email.split('@')[0],
          },
        },
      });
    }

    // Create new review
    const review = await prisma.review.create({
      data: {
        userId,
        bookId,
        rating: ratingNum,
        comment: comment || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Update book's average rating
    await updateBookRating(bookId);

    res.status(201).json({
      message: 'Review created successfully',
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        user: {
          name: review.user.name || 
                `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim() || 
                review.user.email.split('@')[0],
        },
      },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        error: {
          message: 'You have already reviewed this book',
          code: 'DUPLICATE_REVIEW',
        },
      });
    }
    console.error('Create review error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to create review',
        code: 'REVIEW_ERROR',
      },
    });
  }
}

/**
 * Get reviews for a book
 * Public endpoint
 */
export async function getBookReviews(req, res) {
  try {
    const { bookId } = req.params;

    if (!bookId) {
      return res.status(400).json({
        error: {
          message: 'Book ID is required',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return res.status(404).json({
        error: {
          message: 'Book not found',
          code: 'BOOK_NOT_FOUND',
        },
      });
    }

    const reviews = await prisma.review.findMany({
      where: { bookId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      user: {
        name: review.user.name || 
              `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim() || 
              review.user.email.split('@')[0],
      },
    }));

    res.json({
      reviews: formattedReviews,
      count: formattedReviews.length,
    });
  } catch (error) {
    console.error('Get book reviews error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch reviews',
        code: 'GET_REVIEWS_ERROR',
      },
    });
  }
}

/**
 * Check if user has purchased a book
 * Auth required
 */
export async function checkPurchaseStatus(req, res) {
  try {
    const userId = req.userId;
    const { bookId } = req.params;

    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
      });
    }

    if (!bookId) {
      return res.status(400).json({
        error: {
          message: 'Book ID is required',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    res.json({
      hasPurchased: !!(purchase && purchase.status === 'COMPLETED'),
    });
  } catch (error) {
    console.error('Check purchase status error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to check purchase status',
        code: 'CHECK_PURCHASE_ERROR',
      },
    });
  }
}

/**
 * Helper function to update book's average rating
 */
async function updateBookRating(bookId) {
  try {
    const reviews = await prisma.review.findMany({
      where: { bookId },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      await prisma.book.update({
        where: { id: bookId },
        data: { rating: 0 },
      });
      return;
    }

    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    await prisma.book.update({
      where: { id: bookId },
      data: { rating: averageRating },
    });
  } catch (error) {
    console.error('Error updating book rating:', error);
  }
}

