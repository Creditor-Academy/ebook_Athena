import prisma from '../lib/prisma.js';
import { uploadToS3, generateS3FileName } from '../utils/s3.js';

/**
 * Create a new book (Admin only)
 */
export async function createBook(req, res) {
  try {
    const {
      title,
      author,
      description,
      shortDescription,
      price,
      coverImageUrl,
      bookFileUrl,
      category,
      rating,
      recommended,
    } = req.body;

    // Validate required fields
    if (!title || !author || !bookFileUrl) {
      return res.status(400).json({
        error: {
          message: 'Title, author, and bookFileUrl are required',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    // Validate price is a number
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue < 0) {
      return res.status(400).json({
        error: {
          message: 'Price must be a valid non-negative number',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    // Create book
    const book = await prisma.book.create({
      data: {
        title: title.trim(),
        author: author.trim(),
        description: description?.trim() || null,
        shortDescription: shortDescription?.trim() || null,
        price: priceValue,
        coverImageUrl: coverImageUrl?.trim() || null,
        bookFileUrl: bookFileUrl.trim(),
        category: category?.trim() || null,
        rating: rating ? parseFloat(rating) : null,
        recommended: recommended === true || recommended === 'true',
        isActive: true,
      },
    });

    res.status(201).json({
      message: 'Book created successfully',
      book,
    });
  } catch (error) {
    console.error('Create book error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to create book',
        code: 'CREATE_BOOK_ERROR',
      },
    });
  }
}

/**
 * Get all books (public, but only active books)
 */
export async function getAllBooks(req, res) {
  try {
    const {
      category,
      recommended,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build where clause
    const where = {
      isActive: true,
    };

    if (category) {
      where.category = category;
    }

    if (recommended === 'true') {
      where.recommended = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Validate sortBy
    const validSortFields = ['createdAt', 'title', 'author', 'price', 'rating', 'downloads'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

    // Calculate pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Get books with pagination
    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: {
          [sortField]: order,
        },
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
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.book.count({ where }),
    ]);

    res.json({
      books,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get all books error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch books',
        code: 'GET_BOOKS_ERROR',
      },
    });
  }
}

/**
 * Get book by ID (public)
 */
export async function getBookById(req, res) {
  try {
    const { id } = req.params;

    const book = await prisma.book.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        author: true,
        description: true,
        shortDescription: true,
        price: true,
        coverImageUrl: true,
        bookFileUrl: true,
        category: true,
        rating: true,
        downloads: true,
        recommended: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!book) {
      return res.status(404).json({
        error: {
          message: 'Book not found',
          code: 'BOOK_NOT_FOUND',
        },
      });
    }

    // Only return bookFileUrl if user is authenticated and owns the book
    // For now, we'll check ownership in the response
    const userId = req.userId;
    let userOwnsBook = false;

    if (userId) {
      const purchase = await prisma.purchase.findUnique({
        where: {
          userId_bookId: {
            userId,
            bookId: id,
          },
        },
      });
      userOwnsBook = !!purchase;
    }

    // If user doesn't own the book, don't return bookFileUrl
    const bookResponse = {
      ...book,
      bookFileUrl: userOwnsBook ? book.bookFileUrl : undefined,
      owned: userOwnsBook,
    };

    res.json({ book: bookResponse });
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch book',
        code: 'GET_BOOK_ERROR',
      },
    });
  }
}

/**
 * Purchase a book
 */
export async function purchaseBook(req, res) {
  try {
    const { bookId } = req.body;
    const userId = req.userId;

    if (!bookId) {
      return res.status(400).json({
        error: {
          message: 'Book ID is required',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    // Check if book exists and is active
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

    if (!book.isActive) {
      return res.status(400).json({
        error: {
          message: 'Book is not available for purchase',
          code: 'BOOK_INACTIVE',
        },
      });
    }

    // Check if user already owns the book
    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    if (existingPurchase) {
      return res.status(400).json({
        error: {
          message: 'You already own this book',
          code: 'ALREADY_OWNED',
        },
      });
    }

    // Create purchase record
    // Note: Payment gateway integration will be added later
    // For now, we'll create the purchase with status COMPLETED
    const purchase = await prisma.purchase.create({
      data: {
        userId,
        bookId,
        price: book.price,
        status: 'COMPLETED', // Will be updated when payment gateway is integrated
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImageUrl: true,
            bookFileUrl: true,
          },
        },
      },
    });

    // Increment book downloads count
    await prisma.book.update({
      where: { id: bookId },
      data: {
        downloads: {
          increment: 1,
        },
      },
    });

    res.status(201).json({
      message: 'Book purchased successfully',
      purchase: {
        id: purchase.id,
        book: purchase.book,
        price: purchase.price,
        status: purchase.status,
        createdAt: purchase.createdAt,
      },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        error: {
          message: 'You already own this book',
          code: 'ALREADY_OWNED',
        },
      });
    }
    console.error('Purchase book error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to purchase book',
        code: 'PURCHASE_ERROR',
      },
    });
  }
}

/**
 * Upload book with files (cover image and EPUB file)
 */
export async function uploadBookWithFiles(req, res) {
  try {
    const {
      title,
      author,
      description,
      shortDescription,
      price,
      category,
      rating,
      recommended,
    } = req.body;

    // Validate required fields
    if (!title || !author) {
      return res.status(400).json({
        error: {
          message: 'Title and author are required',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    // Check if EPUB file is uploaded
    if (!req.files || !req.files.epub || !req.files.epub[0]) {
      return res.status(400).json({
        error: {
          message: 'EPUB file is required',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    const epubFile = req.files.epub[0];
    const coverFile = req.files.cover ? req.files.cover[0] : null;

    // Validate price
    const priceValue = parseFloat(price) || 0;
    if (isNaN(priceValue) || priceValue < 0) {
      return res.status(400).json({
        error: {
          message: 'Price must be a valid non-negative number',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    // Get user ID from authenticated user
    // Files are organized by user ID for easy fetching
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'User authentication required',
          code: 'UNAUTHORIZED',
        },
      });
    }

    // Upload EPUB file to S3 (organized by user ID)
    // All books uploaded by this user will go in users/{user-id}/books/
    const epubFileName = generateS3FileName(epubFile.originalname, userId, 'book');
    const bookFileUrl = await uploadToS3(
      epubFile.buffer,
      epubFileName,
      epubFile.mimetype || 'application/epub+zip'
    );

    // Upload cover image to S3 (organized by user ID)
    // Cover images for this user go in users/{user-id}/covers/
    let coverImageUrl = null;
    if (coverFile) {
      const coverFileName = generateS3FileName(coverFile.originalname, userId, 'cover');
      coverImageUrl = await uploadToS3(
        coverFile.buffer,
        coverFileName,
        coverFile.mimetype
      );
    }

    // Create book in database
    const book = await prisma.book.create({
      data: {
        title: title.trim(),
        author: author.trim(),
        description: description?.trim() || null,
        shortDescription: shortDescription?.trim() || null,
        price: priceValue,
        coverImageUrl,
        bookFileUrl,
        category: category?.trim() || null,
        rating: rating ? parseFloat(rating) : null,
        recommended: recommended === true || recommended === 'true',
        isActive: true,
      },
    });

    res.status(201).json({
      message: 'Book uploaded and created successfully',
      book,
    });
  } catch (error) {
    console.error('Upload book error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to upload book',
        code: 'UPLOAD_BOOK_ERROR',
      },
    });
  }
}

/**
 * Get user's purchased books
 */
export async function getMyBooks(req, res) {
  try {
    const userId = req.userId;

    const purchases = await prisma.purchase.findMany({
      where: {
        userId,
        status: 'COMPLETED',
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
            bookFileUrl: true,
            category: true,
            rating: true,
            downloads: true,
            recommended: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to include purchase info
    const myBooks = purchases.map((purchase) => ({
      ...purchase.book,
      purchasedAt: purchase.createdAt,
      purchasePrice: purchase.price,
    }));

    res.json({
      books: myBooks,
      count: myBooks.length,
    });
  } catch (error) {
    console.error('Get my books error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to fetch your books',
        code: 'GET_MY_BOOKS_ERROR',
      },
    });
  }
}
