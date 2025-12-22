const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

/**
 * Add a book to cart
 * @param {string} bookId - Book ID
 * @param {number} quantity - Quantity (default: 1)
 * @returns {Promise<Object>} Cart item data
 */
export async function addToCart(bookId, quantity = 1) {
  const token = localStorage.getItem('accessToken')
  
  if (!token) {
    throw new Error('Authentication required')
  }

  const response = await fetch(`${API_URL}/cart`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify({ bookId, quantity }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to add book to cart')
  }

  return data
}

/**
 * Get user's cart
 * @returns {Promise<Object>} Cart data with items and summary
 */
export async function getCart() {
  const token = localStorage.getItem('accessToken')
  
  if (!token) {
    throw new Error('Authentication required')
  }

  const response = await fetch(`${API_URL}/cart`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to fetch cart')
  }

  return data
}

/**
 * Remove a book from cart
 * @param {string} bookId - Book ID
 * @returns {Promise<Object>} Success message
 */
export async function removeFromCart(bookId) {
  const token = localStorage.getItem('accessToken')
  
  if (!token) {
    throw new Error('Authentication required')
  }

  const response = await fetch(`${API_URL}/cart/${bookId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to remove book from cart')
  }

  return data
}

/**
 * Update cart item quantity
 * @param {string} bookId - Book ID
 * @param {number} quantity - New quantity
 * @returns {Promise<Object>} Updated cart item data
 */
export async function updateCartItem(bookId, quantity) {
  const token = localStorage.getItem('accessToken')
  
  if (!token) {
    throw new Error('Authentication required')
  }

  const response = await fetch(`${API_URL}/cart/${bookId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify({ quantity }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to update cart item')
  }

  return data
}

/**
 * Clear cart (remove all items)
 * @returns {Promise<Object>} Success message
 */
export async function clearCart() {
  const token = localStorage.getItem('accessToken')
  
  if (!token) {
    throw new Error('Authentication required')
  }

  const response = await fetch(`${API_URL}/cart`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to clear cart')
  }

  return data
}

/**
 * Get cart count
 * @returns {Promise<Object>} Cart count data
 */
export async function getCartCount() {
  const token = localStorage.getItem('accessToken')
  
  if (!token) {
    return { itemCount: 0, totalQuantity: 0 }
  }

  try {
    const response = await fetch(`${API_URL}/cart/count`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    })

    const data = await response.json()

    if (!response.ok) {
      return { itemCount: 0, totalQuantity: 0 }
    }

    return data
  } catch (error) {
    return { itemCount: 0, totalQuantity: 0 }
  }
}

/**
 * Check if book is in cart
 * @param {string} bookId - Book ID
 * @returns {Promise<boolean>} True if book is in cart
 */
export async function checkBookInCart(bookId) {
  try {
    const cart = await getCart()
    return cart.items?.some(item => item.book.id === bookId) || false
  } catch (error) {
    return false
  }
}

