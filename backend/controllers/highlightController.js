import prisma from '../lib/prisma.js';

// Valid highlight colors
const VALID_COLORS = ['yellow', 'green', 'blue', 'pink', 'orange', 'purple'];

/**
 * Add a highlight (text selection with color)
 */
export async function addHighlight(req, res) {
  try {
    const userId = req.userId;
    const {
      bookId,
      selectedText,
      color = 'yellow',
      pageNumber,
      chapter,
      cfi,
      position,
      note,
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

    if (!selectedText || !selectedText.trim()) {
      return res.status(400).json({
        error: {
          message: 'Selected text is required',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    // Validate color
    if (!VALID_COLORS.includes(color.toLowerCase())) {
      return res.status(400).json({
        error: {
          message: `Invalid color. Allowed colors: ${VALID_COLORS.join(', ')}`,
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
          message: 'You must own this book to add highlights',
          code: 'BOOK_NOT_OWNED',
        },
      });
    }

    // Check if book exists and is active
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { id: true, isActive: true },
    });

    if (!book) {
      return res.status(404).json({
        error: {
          message: 'Book not found',
          code: 'BOOK_NOT_FOUND',
        },
      });
    }

    if (!book.isActive) {
      return res.status(400).json({
        error: {
          message: 'Book is not available',
          code: 'BOOK_INACTIVE',
        },
      });
    }

    // Create highlight
    const highlight = await prisma.highlight.create({
      data: {
        userId,
        bookId,
        selectedText: selectedText.trim(),
        color: color.toLowerCase(),
        pageNumber: pageNumber ? parseInt(pageNumber, 10) : null,
        chapter: chapter?.trim() || null,
        cfi: cfi?.trim() || null,
        position: position ? parseFloat(position) : null,
        note: note?.trim() || null,
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
      message: 'Highlight created successfully',
      highlight,
    });
  } catch (error) {
    console.error('Add highlight error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to create highlight',
        code: 'ADD_HIGHLIGHT_ERROR',
      },
    });
  }
}

/**
 * Get highlights for a specific book
 */
export async function getHighlightsByBook(req, res) {
  try {
    const userId = req.userId;
    const { bookId } = req.params;
    const { color } = req.query; // Optional filter by color

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

    // Check if user owns the book
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
          message: 'You must own this book to view highlights',
          code: 'BOOK_NOT_OWNED',
        },
      });
    }

    // Build where clause
    const where = {
      userId,
      bookId,
    };

    if (color && VALID_COLORS.includes(color.toLowerCase())) {
      where.color = color.toLowerCase();
    }

    // Get highlights
    const highlights = await prisma.highlight.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        selectedText: true,
        color: true,
        pageNumber: true,
        chapter: true,
        cfi: true,
        position: true,
        note: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      bookId,
      highlights,
      totalHighlights: highlights.length,
    });
  } catch (error) {
    console.error('Get highlights by book error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to fetch highlights',
        code: 'GET_HIGHLIGHTS_ERROR',
      },
    });
  }
}

/**
 * Get all highlights for the authenticated user
 */
export async function getAllHighlights(req, res) {
  try {
    const userId = req.userId;
    const { bookId, color, page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
      });
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where = { userId };

    if (bookId) {
      where.bookId = bookId;
    }

    if (color && VALID_COLORS.includes(color.toLowerCase())) {
      where.color = color.toLowerCase();
    }

    // Get highlights with pagination
    const [highlights, total] = await Promise.all([
      prisma.highlight.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
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
      prisma.highlight.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      highlights,
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
    console.error('Get all highlights error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to fetch highlights',
        code: 'GET_ALL_HIGHLIGHTS_ERROR',
      },
    });
  }
}

/**
 * Update a highlight (color, note)
 */
export async function updateHighlight(req, res) {
  try {
    const userId = req.userId;
    const { highlightId } = req.params;
    const { color, note } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
      });
    }

    // Check if highlight exists and belongs to user
    const existingHighlight = await prisma.highlight.findUnique({
      where: { id: highlightId },
      select: { userId: true },
    });

    if (!existingHighlight) {
      return res.status(404).json({
        error: {
          message: 'Highlight not found',
          code: 'HIGHLIGHT_NOT_FOUND',
        },
      });
    }

    if (existingHighlight.userId !== userId) {
      return res.status(403).json({
        error: {
          message: 'You can only update your own highlights',
          code: 'FORBIDDEN',
        },
      });
    }

    // Build update data
    const updateData = {};

    if (color !== undefined) {
      if (!VALID_COLORS.includes(color.toLowerCase())) {
        return res.status(400).json({
          error: {
            message: `Invalid color. Allowed colors: ${VALID_COLORS.join(', ')}`,
            code: 'VALIDATION_ERROR',
          },
        });
      }
      updateData.color = color.toLowerCase();
    }

    if (note !== undefined) {
      updateData.note = note?.trim() || null;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: {
          message: 'No fields to update',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    // Update highlight
    const highlight = await prisma.highlight.update({
      where: { id: highlightId },
      data: updateData,
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
      message: 'Highlight updated successfully',
      highlight,
    });
  } catch (error) {
    console.error('Update highlight error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to update highlight',
        code: 'UPDATE_HIGHLIGHT_ERROR',
      },
    });
  }
}

/**
 * Delete a highlight
 */
export async function deleteHighlight(req, res) {
  try {
    const userId = req.userId;
    const { highlightId } = req.params;

    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
      });
    }

    // Check if highlight exists and belongs to user
    const existingHighlight = await prisma.highlight.findUnique({
      where: { id: highlightId },
      select: { userId: true },
    });

    if (!existingHighlight) {
      return res.status(404).json({
        error: {
          message: 'Highlight not found',
          code: 'HIGHLIGHT_NOT_FOUND',
        },
      });
    }

    if (existingHighlight.userId !== userId) {
      return res.status(403).json({
        error: {
          message: 'You can only delete your own highlights',
          code: 'FORBIDDEN',
        },
      });
    }

    // Delete highlight
    await prisma.highlight.delete({
      where: { id: highlightId },
    });

    res.json({
      message: 'Highlight deleted successfully',
    });
  } catch (error) {
    console.error('Delete highlight error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to delete highlight',
        code: 'DELETE_HIGHLIGHT_ERROR',
      },
    });
  }
}

/**
 * Get highlight count for a book
 */
export async function getHighlightCount(req, res) {
  try {
    const userId = req.userId;
    const { bookId } = req.params;
    const { color } = req.query;

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

    const where = {
      userId,
      bookId,
    };

    if (color && VALID_COLORS.includes(color.toLowerCase())) {
      where.color = color.toLowerCase();
    }

    const count = await prisma.highlight.count({ where });

    res.json({
      bookId,
      count,
      color: color || 'all',
    });
  } catch (error) {
    console.error('Get highlight count error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to get highlight count',
        code: 'GET_HIGHLIGHT_COUNT_ERROR',
      },
    });
  }
}

