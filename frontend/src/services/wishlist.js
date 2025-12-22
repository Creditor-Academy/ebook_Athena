const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

/**
 * Add a book to wishlist
 * @param {string} bookId - Book ID
 * @returns {Promise<Object>} Wishlist item data
 */
export async function addToWishlist(bookId) {
  const token = localStorage.getItem('accessToken')
  
  if (!token) {
    throw new Error('Authentication required')
  }

  const response = await fetch(`${API_URL}/wishlist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify({ bookId }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to add book to wishlist')
  }

  return data
}

/**
 * Remove a book from wishlist
 * @param {string} bookId - Book ID
 * @returns {Promise<Object>} Success message
 */
export async function removeFromWishlist(bookId) {
  const token = localStorage.getItem('accessToken')
  
  if (!token) {
    throw new Error('Authentication required')
  }

  const response = await fetch(`${API_URL}/wishlist/${bookId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to remove book from wishlist')
  }

  return data
}

/**
 * Get user's wishlist
 * @param {Object} options - Query parameters
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @param {string} options.sortBy - Sort field
 * @param {string} options.sortOrder - Sort order (asc/desc)
 * @returns {Promise<Object>} Wishlist data with books
 */
export async function getWishlist(options = {}) {
  const token = localStorage.getItem('accessToken')
  
  if (!token) {
    throw new Error('Authentication required')
  }

  const params = new URLSearchParams()
  if (options.page) params.append('page', options.page)
  if (options.limit) params.append('limit', options.limit)
  if (options.sortBy) params.append('sortBy', options.sortBy)
  if (options.sortOrder) params.append('sortOrder', options.sortOrder)

  const queryString = params.toString()
  const url = `${API_URL}/wishlist${queryString ? `?${queryString}` : ''}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to fetch wishlist')
  }

  return data
}

/**
 * Check if book is in wishlist
 * @param {string} bookId - Book ID
 * @returns {Promise<boolean>} True if book is in wishlist
 */
export async function checkBookInWishlist(bookId) {
  const token = localStorage.getItem('accessToken')
  
  if (!token) {
    return false
  }

  try {
    const response = await fetch(`${API_URL}/wishlist/check/${bookId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    })

    const data = await response.json()

    if (!response.ok) {
      return false
    }

    return data.isInWishlist || false
  } catch {
    return false
  }
}

/**
 * Get wishlist count
 * @returns {Promise<number>} Wishlist count
 */
export async function getWishlistCount() {
  const token = localStorage.getItem('accessToken')
  
  if (!token) {
    return 0
  }

  try {
    const response = await fetch(`${API_URL}/wishlist/count`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
    })

    const data = await response.json()

    if (!response.ok) {
      return 0
    }

    return data.count || 0
  } catch {
    return 0
  }
}

