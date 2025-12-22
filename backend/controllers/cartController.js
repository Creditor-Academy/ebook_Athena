import prisma from '../lib/prisma.js';

// Platform charge (fixed at $5 USD)
const PLATFORM_CHARGE = 5.00;

/**
 * Add a book to user's cart
 */
export async function addToCart(req, res) {
  try {
    const userId = req.userId;
    const { bookId, quantity = 1 } = req.body;

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

    // Validate quantity
    const quantityNum = parseInt(quantity, 10) || 1;
    if (quantityNum < 1) {
      return res.status(400).json({
        error: {
          message: 'Quantity must be at least 1',
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
          message: 'Book is not available',
          code: 'BOOK_INACTIVE',
        },
      });
    }

    // Check if book is already in cart
    const existingCartItem = await prisma.cart.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    if (existingCartItem) {
      // Update quantity if already in cart
      const updatedCartItem = await prisma.cart.update({
        where: {
          userId_bookId: {
            userId,
            bookId,
          },
        },
        data: {
          quantity: existingCartItem.quantity + quantityNum,
          price: book.price, // Update price to current book price
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

      return res.json({
        message: 'Cart item quantity updated successfully',
        cartItem: {
          id: updatedCartItem.id,
          book: updatedCartItem.book,
          quantity: updatedCartItem.quantity,
          price: updatedCartItem.price,
          itemTotal: Number(updatedCartItem.price) * updatedCartItem.quantity,
          addedAt: updatedCartItem.createdAt,
          updatedAt: updatedCartItem.updatedAt,
        },
      });
    }

    // Add to cart with current book price
    const cartItem = await prisma.cart.create({
      data: {
        userId,
        bookId,
        price: book.price, // Store price at time of adding to cart
        quantity: quantityNum,
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
      message: 'Book added to cart successfully',
      cartItem: {
        id: cartItem.id,
        book: cartItem.book,
        quantity: cartItem.quantity,
        price: cartItem.price,
        itemTotal: Number(cartItem.price) * cartItem.quantity,
        addedAt: cartItem.createdAt,
      },
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        error: {
          message: 'Book is already in your cart',
          code: 'ALREADY_IN_CART',
        },
      });
    }

    res.status(500).json({
      error: {
        message: error.message || 'Failed to add book to cart',
        code: 'ADD_TO_CART_ERROR',
      },
    });
  }
}

/**
 * Remove a book from user's cart
 */
export async function removeFromCart(req, res) {
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

    // Check if book is in cart
    const cartItem = await prisma.cart.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        error: {
          message: 'Book is not in your cart',
          code: 'NOT_IN_CART',
        },
      });
    }

    // Remove from cart
    await prisma.cart.delete({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    res.json({
      message: 'Book removed from cart successfully',
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to remove book from cart',
        code: 'REMOVE_FROM_CART_ERROR',
      },
    });
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(req, res) {
  try {
    const userId = req.userId;
    const { bookId } = req.params;
    const { quantity } = req.body;

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

    const quantityNum = parseInt(quantity, 10);
    if (isNaN(quantityNum) || quantityNum < 1) {
      return res.status(400).json({
        error: {
          message: 'Quantity must be a positive number',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    // Check if book is in cart
    const cartItem = await prisma.cart.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        error: {
          message: 'Book is not in your cart',
          code: 'NOT_IN_CART',
        },
      });
    }

    // Update quantity
    const updatedCartItem = await prisma.cart.update({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
      data: {
        quantity: quantityNum,
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

    res.json({
      message: 'Cart item updated successfully',
      cartItem: {
        id: updatedCartItem.id,
        book: updatedCartItem.book,
        quantity: updatedCartItem.quantity,
        price: updatedCartItem.price,
        itemTotal: Number(updatedCartItem.price) * updatedCartItem.quantity,
        updatedAt: updatedCartItem.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to update cart item',
        code: 'UPDATE_CART_ERROR',
      },
    });
  }
}

/**
 * Get user's cart with total pricing
 */
export async function getCart(req, res) {
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

    // Get all cart items
    const cartItems = await prisma.cart.findMany({
      where: {
        userId,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate totals
    let subtotal = 0;
    const items = cartItems.map((item) => {
      const itemPrice = Number(item.price);
      const itemTotal = itemPrice * item.quantity;
      subtotal += itemTotal;

      return {
        id: item.id,
        book: item.book,
        quantity: item.quantity,
        price: item.price,
        itemTotal: itemTotal,
        addedAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });

    // Calculate platform charge and total
    const platformCharge = PLATFORM_CHARGE;
    const total = subtotal + platformCharge;

    res.json({
      items,
      summary: {
        subtotal: parseFloat(subtotal.toFixed(2)),
        platformCharge: platformCharge,
        total: parseFloat(total.toFixed(2)),
      },
      itemCount: cartItems.length,
      totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to fetch cart',
        code: 'GET_CART_ERROR',
      },
    });
  }
}

/**
 * Clear user's cart (remove all items)
 */
export async function clearCart(req, res) {
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

    // Delete all cart items for user
    await prisma.cart.deleteMany({
      where: {
        userId,
      },
    });

    res.json({
      message: 'Cart cleared successfully',
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to clear cart',
        code: 'CLEAR_CART_ERROR',
      },
    });
  }
}

/**
 * Get cart count (number of items)
 */
export async function getCartCount(req, res) {
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

    const count = await prisma.cart.count({
      where: {
        userId,
      },
    });

    // Get total quantity
    const cartItems = await prisma.cart.findMany({
      where: {
        userId,
      },
      select: {
        quantity: true,
      },
    });

    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      itemCount: count,
      totalQuantity: totalQuantity,
    });
  } catch (error) {
    console.error('Get cart count error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Failed to get cart count',
        code: 'GET_CART_COUNT_ERROR',
      },
    });
  }
}

