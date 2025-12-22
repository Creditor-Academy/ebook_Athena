import prisma from '../lib/prisma.js';

/**
 * Add a bookmark (reading position with selected text)
 */
export async function addBookmark(req, res) {
  try {
    const userId = req.userId;
    const {
      bookId,
      pageNumber,
      chapter,
      selectedText,
      cfi,
      position,
      note,
      isLastPosition = false,
    } = req.body;

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

    // Check if user owns the book (has purchased it)
    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    if (!purchase) {
      return res.status(403).json({
        error: {
          message: 'You must purchase the book before bookmarking',
          code: 'BOOK_NOT_OWNED',
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

    // If this is marked as last position, unmark other last positions for this book
    if (isLastPosition) {
      await prisma.bookmark.updateMany({
        where: {
          userId,
          bookId,
          isLastPosition: true,
        },
        data: {
          isLastPosition: false,
        },
      });
    }

    // Create bookmark
    const bookmark = await prisma.bookmark.create({
      data: {
        userId,
        bookId,
        pageNumber: pageNumber ? parseInt(pageNumber, 10) : null,
        chapter: chapter?.trim() || null,
        selectedText: selectedText?.trim() || null,
        cfi: cfi?.trim() || null,
        position: position ? parseFloat(position) : null,
        note: note?.trim() || null,
        isLastPosition: isLastPosition === true || isLastPosition === 'true',
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImageUrl: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Bookmark created successfully',
      bookmark,
    });
  } catch (error) {
    console.error('Add bookmark error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to create bookmark',
        code: 'ADD_BOOKMARK_ERROR',
      },
    });
  }
}

/**
 * Get bookmarks for a specific book
 */
export async function getBookmarksByBook(req, res) {
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

    // Verify user owns the book
    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    if (!purchase) {
      return res.status(403).json({
        error: {
          message: 'You must purchase the book to view bookmarks',
          code: 'BOOK_NOT_OWNED',
        },
      });
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId,
        bookId,
      },
      orderBy: [
        { isLastPosition: 'desc' }, // Last position first
        { createdAt: 'desc' }, // Then by creation date
      ],
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImageUrl: true,
          },
        },
      },
    });

    res.json({
      bookmarks,
      count: bookmarks.length,
    });
  } catch (error) {
    console.error('Get bookmarks by book error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to fetch bookmarks',
        code: 'GET_BOOKMARKS_ERROR',
      },
    });
  }
}

/**
 * Get all bookmarks for user (across all books)
 */
export async function getAllBookmarks(req, res) {
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
      bookId,
    } = req.query;

    const where = {
      userId,
    };

    if (bookId) {
      where.bookId = bookId;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [
          { isLastPosition: 'desc' },
          { createdAt: 'desc' },
        ],
        include: {
          book: {
            select: {
              id: true,
              title: true,
              author: true,
              coverImageUrl: true,
            },
          },
        },
      }),
      prisma.bookmark.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      bookmarks,
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
    console.error('Get all bookmarks error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to fetch bookmarks',
        code: 'GET_ALL_BOOKMARKS_ERROR',
      },
    });
  }
}

/**
 * Get last reading position for a book
 */
export async function getLastPosition(req, res) {
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

    // Get the last position bookmark
    const lastPosition = await prisma.bookmark.findFirst({
      where: {
        userId,
        bookId,
        isLastPosition: true,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImageUrl: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (!lastPosition) {
      // If no last position marked, get the most recent bookmark
      const recentBookmark = await prisma.bookmark.findFirst({
        where: {
          userId,
          bookId,
        },
        include: {
          book: {
            select: {
              id: true,
              title: true,
              author: true,
              coverImageUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!recentBookmark) {
        return res.status(404).json({
          error: {
            message: 'No reading position found for this book',
            code: 'NO_POSITION_FOUND',
          },
        });
      }

      return res.json({
        bookmark: recentBookmark,
        isLastPosition: false,
      });
    }

    res.json({
      bookmark: lastPosition,
      isLastPosition: true,
    });
  } catch (error) {
    console.error('Get last position error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to fetch last position',
        code: 'GET_LAST_POSITION_ERROR',
      },
    });
  }
}

/**
 * Update a bookmark
 */
export async function updateBookmark(req, res) {
  try {
    const userId = req.userId;
    const { bookmarkId } = req.params;
    const {
      pageNumber,
      chapter,
      selectedText,
      cfi,
      position,
      note,
      isLastPosition,
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
      });
    }

    // Check if bookmark exists and belongs to user
    const existingBookmark = await prisma.bookmark.findUnique({
      where: { id: bookmarkId },
    });

    if (!existingBookmark) {
      return res.status(404).json({
        error: {
          message: 'Bookmark not found',
          code: 'BOOKMARK_NOT_FOUND',
        },
      });
    }

    if (existingBookmark.userId !== userId) {
      return res.status(403).json({
        error: {
          message: 'You can only update your own bookmarks',
          code: 'FORBIDDEN',
        },
      });
    }

    // If marking as last position, unmark others
    if (isLastPosition === true || isLastPosition === 'true') {
      await prisma.bookmark.updateMany({
        where: {
          userId,
          bookId: existingBookmark.bookId,
          isLastPosition: true,
          id: { not: bookmarkId },
        },
        data: {
          isLastPosition: false,
        },
      });
    }

    // Update bookmark
    const updatedBookmark = await prisma.bookmark.update({
      where: { id: bookmarkId },
      data: {
        ...(pageNumber !== undefined && { pageNumber: pageNumber ? parseInt(pageNumber, 10) : null }),
        ...(chapter !== undefined && { chapter: chapter?.trim() || null }),
        ...(selectedText !== undefined && { selectedText: selectedText?.trim() || null }),
        ...(cfi !== undefined && { cfi: cfi?.trim() || null }),
        ...(position !== undefined && { position: position ? parseFloat(position) : null }),
        ...(note !== undefined && { note: note?.trim() || null }),
        ...(isLastPosition !== undefined && {
          isLastPosition: isLastPosition === true || isLastPosition === 'true',
        }),
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImageUrl: true,
          },
        },
      },
    });

    res.json({
      message: 'Bookmark updated successfully',
      bookmark: updatedBookmark,
    });
  } catch (error) {
    console.error('Update bookmark error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to update bookmark',
        code: 'UPDATE_BOOKMARK_ERROR',
      },
    });
  }
}

/**
 * Delete a bookmark
 */
export async function deleteBookmark(req, res) {
  try {
    const userId = req.userId;
    const { bookmarkId } = req.params;

    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
      });
    }

    // Check if bookmark exists and belongs to user
    const bookmark = await prisma.bookmark.findUnique({
      where: { id: bookmarkId },
    });

    if (!bookmark) {
      return res.status(404).json({
        error: {
          message: 'Bookmark not found',
          code: 'BOOKMARK_NOT_FOUND',
        },
      });
    }

    if (bookmark.userId !== userId) {
      return res.status(403).json({
        error: {
          message: 'You can only delete your own bookmarks',
          code: 'FORBIDDEN',
        },
      });
    }

    await prisma.bookmark.delete({
      where: { id: bookmarkId },
    });

    res.json({
      message: 'Bookmark deleted successfully',
    });
  } catch (error) {
    console.error('Delete bookmark error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to delete bookmark',
        code: 'DELETE_BOOKMARK_ERROR',
      },
    });
  }
}

