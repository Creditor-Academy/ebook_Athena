import prisma from '../lib/prisma.js';

/**
 * Add a book to user's wishlist
 */
export async function addToWishlist(req, res) {
  try {
    const userId = req.userId;
    const { bookId } = req.body;

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

    // Check if book is already in wishlist
    const existingWishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    if (existingWishlistItem) {
      return res.status(400).json({
        error: {
          message: 'Book is already in your wishlist',
          code: 'ALREADY_IN_WISHLIST',
        },
      });
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId,
        bookId,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            description: true,
            shortDescription: true,
            price: true,
            coverImageUrl: true,
            category: true,
            rating: true,
            downloads: true,
            recommended: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Book added to wishlist successfully',
      wishlistItem: {
        id: wishlistItem.id,
        book: wishlistItem.book,
        addedAt: wishlistItem.createdAt,
      },
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        error: {
          message: 'Book is already in your wishlist',
          code: 'ALREADY_IN_WISHLIST',
        },
      });
    }

    res.status(500).json({
      error: {
        message: error.message || 'Failed to add book to wishlist',
        code: 'ADD_TO_WISHLIST_ERROR',
      },
    });
  }
}

/**
 * Remove a book from user's wishlist
 */
export async function removeFromWishlist(req, res) {
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

    // Check if book is in wishlist
    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    if (!wishlistItem) {
      return res.status(404).json({
        error: {
          message: 'Book is not in your wishlist',
          code: 'NOT_IN_WISHLIST',
        },
      });
    }

    // Remove from wishlist
    await prisma.wishlist.delete({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    res.json({
      message: 'Book removed from wishlist successfully',
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to remove book from wishlist',
        code: 'REMOVE_FROM_WISHLIST_ERROR',
      },
    });
  }
}

/**
 * Get user's wishlist
 */
export async function getWishlist(req, res) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
      });
    }

    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Validate sortBy
    const validSortFields = ['createdAt', 'title', 'author', 'price', 'rating'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

    // Calculate pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Get wishlist items with pagination
    const [wishlistItems, total] = await Promise.all([
      prisma.wishlist.findMany({
        where: {
          userId,
        },
        skip,
        take: limitNum,
        include: {
          book: {
            select: {
              id: true,
              title: true,
              author: true,
              description: true,
              shortDescription: true,
              price: true,
              coverImageUrl: true,
              category: true,
              rating: true,
              downloads: true,
              recommended: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
        orderBy: sortField === 'createdAt' 
          ? { createdAt: order }
          : {
              book: {
                [sortField]: order,
              },
            },
      }),
      prisma.wishlist.count({
        where: {
          userId,
        },
      }),
    ]);

    // Transform response
    const books = wishlistItems.map((item) => ({
      ...item.book,
      addedToWishlistAt: item.createdAt,
      wishlistId: item.id,
    }));

    // Calculate total pages
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      books,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to fetch wishlist',
        code: 'GET_WISHLIST_ERROR',
      },
    });
  }
}

/**
 * Check if a book is in user's wishlist
 */
export async function checkWishlistStatus(req, res) {
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

    // Check if book is in wishlist
    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    res.json({
      isInWishlist: !!wishlistItem,
      addedAt: wishlistItem?.createdAt || null,
    });
  } catch (error) {
    console.error('Check wishlist status error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to check wishlist status',
        code: 'CHECK_WISHLIST_ERROR',
      },
    });
  }
}

/**
 * Get wishlist count for user
 */
export async function getWishlistCount(req, res) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
      });
    }

    const count = await prisma.wishlist.count({
      where: {
        userId,
      },
    });

    res.json({
      count,
    });
  } catch (error) {
    console.error('Get wishlist count error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to get wishlist count',
        code: 'GET_WISHLIST_COUNT_ERROR',
      },
    });
  }
}

