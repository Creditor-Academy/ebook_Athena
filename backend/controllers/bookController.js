import prisma from '../lib/prisma.js';
import { uploadToS3, generateS3FileName } from '../utils/s3.js';
import { extractChapters } from '../utils/epubParser.js';

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
          userId: true, // Include userId to track which user uploaded the book
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
        userId: true, // Include userId to check if user uploaded the book
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
    // OR if user uploaded the book (author access)
    const userId = req.userId;
    let userOwnsBook = false;
    let userUploadedBook = false;

    if (userId) {
      // Check if user purchased the book
      const purchase = await prisma.purchase.findUnique({
        where: {
          userId_bookId: {
            userId,
            bookId: id,
          },
        },
      });
      userOwnsBook = !!purchase;

      // Check if user uploaded the book (author access)
      if (book.userId === userId) {
        userUploadedBook = true;
      }
    }

    // Return bookFileUrl if user owns OR uploaded the book
    const bookResponse = {
      ...book,
      bookFileUrl: (userOwnsBook || userUploadedBook) ? book.bookFileUrl : undefined,
      owned: userOwnsBook,
      uploaded: userUploadedBook,
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
    // Verify Prisma client and book model are available
    if (!prisma || !prisma.book) {
      console.error('Prisma client or book model not available');
      return res.status(500).json({
        error: {
          message: 'Database client not properly initialized',
          code: 'DATABASE_INIT_ERROR',
        },
      });
    }
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

    // Validate price - Prisma Decimal accepts number or string
    const priceValue = price ? parseFloat(price) : 0;
    if (isNaN(priceValue) || priceValue < 0) {
      return res.status(400).json({
        error: {
          message: 'Price must be a valid non-negative number',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    // Get user ID from authenticated user
    // IMPORTANT: Files are organized by the authenticated user's ID (userId)
    // This ensures that all books uploaded by the same author/user go in the same folder:
    // Structure: users/{user-id}/books/{filename} and users/{user-id}/covers/{filename}
    // When the same author uploads multiple books, they will all be in their user folder
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        error: {
          message: 'User authentication required',
          code: 'UNAUTHORIZED',
        },
      });
    }

    console.log(`📁 Organizing files for user ID: ${userId}`);
    console.log(`📚 Author: ${author}, Title: ${title}`);

    // Upload EPUB file to S3 (organized by user ID)
    // All books uploaded by this user will go in users/{user-id}/books/
    const epubFileName = generateS3FileName(epubFile.originalname, userId, 'book');
    console.log(`📤 Uploading EPUB to: ${epubFileName}`);
    const bookFileUrl = await uploadToS3(
      epubFile.buffer,
      epubFileName,
      epubFile.mimetype || 'application/epub+zip'
    );
    console.log(`✅ EPUB uploaded successfully: ${bookFileUrl}`);

    // Extract chapters from EPUB file (for table of contents)
    console.log('📖 Extracting chapters from EPUB...');
    let chapters = [];
    try {
      chapters = await extractChapters(epubFile.buffer);
      console.log(`✅ Extracted ${chapters.length} chapters from EPUB`);
    } catch (error) {
      console.error('⚠️ Error extracting chapters (continuing without chapters):', error);
      // Continue with empty chapters array - book will still be created
    }

    // Upload cover image to S3 (organized by user ID)
    // Cover images for this user go in users/{user-id}/covers/
    let coverImageUrl = null;
    if (coverFile) {
      const coverFileName = generateS3FileName(coverFile.originalname, userId, 'cover');
      console.log(`📤 Uploading cover to: ${coverFileName}`);
      coverImageUrl = await uploadToS3(
        coverFile.buffer,
        coverFileName,
        coverFile.mimetype
      );
      console.log(`✅ Cover uploaded successfully: ${coverImageUrl}`);
    }

    // Create book in database with chapters
    // Store userId to track which user/author uploaded this book
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
        userId: userId, // Track which user uploaded this book
        // Create chapters if extracted
        chapters: chapters.length > 0 ? {
          create: chapters.map(chapter => ({
            title: chapter.title,
            order: chapter.order,
            href: chapter.href,
            cfi: chapter.cfi,
            position: chapter.position,
          })),
        } : undefined,
      },
      include: {
        chapters: {
          orderBy: { order: 'asc' },
        },
      },
    });

    res.status(201).json({
      message: 'Book uploaded and created successfully',
      book,
      chapters: book.chapters || [],
      totalChapters: book.chapters?.length || 0,
    });
  } catch (error) {
    console.error('Upload book error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
    
    // Check if it's a Prisma error
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: {
          message: 'A book with this information already exists',
          code: 'DUPLICATE_ENTRY',
        },
      });
    }
    
    if (error.code === 'P2003') {
      return res.status(400).json({
        error: {
          message: 'Invalid reference in book data',
          code: 'FOREIGN_KEY_ERROR',
        },
      });
    }
    
    res.status(500).json({
      error: {
        message: error.message || 'Failed to upload book',
        code: 'UPLOAD_BOOK_ERROR',
        ...(process.env.NODE_ENV === 'development' && {
          details: error.meta,
          prismaCode: error.code,
        }),
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

/**
 * Get books uploaded by the authenticated author/user
 * This is for the author/admin dashboard to see all books they've uploaded
 */
export async function getMyUploadedBooks(req, res) {
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
      search,
      category,
      isActive,
    } = req.query;

    // Build where clause - filter by userId
    const where = {
      userId: userId, // Only get books uploaded by this user
    };

    // Optional filters
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true' || isActive === true;
    }

    // Validate sortBy
    const validSortFields = ['createdAt', 'updatedAt', 'title', 'author', 'price', 'rating', 'downloads'];
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
          bookFileUrl: true,
          category: true,
          rating: true,
          downloads: true,
          recommended: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
        },
      }),
      prisma.book.count({ where }),
    ]);

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
    console.error('Get my uploaded books error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to fetch your uploaded books',
        code: 'GET_MY_UPLOADED_BOOKS_ERROR',
      },
    });
  }
}

/**
 * Get chapters/table of contents for a book
 * Returns chapters in order for navigation/index display
 */
export async function getBookChapters(req, res) {
  try {
    const { id: bookId } = req.params;

    // Get book info
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: {
        id: true,
        title: true,
        author: true,
        isActive: true,
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

    // Get chapters ordered by order field
    const chapters = await prisma.chapter.findMany({
      where: { bookId },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        order: true,
        href: true,
        cfi: true,
        position: true,
      },
    });

    res.json({
      book: {
        id: book.id,
        title: book.title,
        author: book.author,
      },
      chapters,
      totalChapters: chapters.length,
    });
  } catch (error) {
    console.error('Get book chapters error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to fetch chapters',
        code: 'GET_CHAPTERS_ERROR',
      },
    });
  }
}
