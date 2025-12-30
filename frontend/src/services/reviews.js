const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

/**
 * Create a review for a book
 * @param {string} bookId - Book ID
 * @param {number} rating - Rating from 1 to 5
 * @param {string} comment - Optional comment
 * @returns {Promise<Object>} Review data
 */
export async function createReview(bookId, rating, comment = '') {
  const token = localStorage.getItem('accessToken')
  
  if (!token) {
    throw new Error('Authentication required')
  }

  const response = await fetch(`${API_URL}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify({ bookId, rating, comment }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to create review')
  }

  return data
}

/**
 * Get reviews for a book
 * @param {string} bookId - Book ID
 * @returns {Promise<Object>} Reviews data
 */
export async function getBookReviews(bookId) {
  const response = await fetch(`${API_URL}/reviews/${bookId}`, {
    method: 'GET',
    credentials: 'include',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to fetch reviews')
  }

  return data
}

/**
 * Check if user has purchased a book
 * @param {string} bookId - Book ID
 * @returns {Promise<boolean>} True if user has purchased the book
 */
export async function hasPurchasedBook(bookId) {
  const token = localStorage.getItem('accessToken')
  
  if (!token) {
    return false
  }

  try {
    const response = await fetch(`${API_URL}/purchase/has-purchased/${bookId}`, {
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

    return data.hasPurchased || false
  } catch (error) {
    console.error('Error checking purchase status:', error)
    return false
  }
}

