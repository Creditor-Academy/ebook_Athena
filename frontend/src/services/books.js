const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

/**
 * Get all books with optional filters
 * @param {Object} options - Query parameters
 * @param {string} options.category - Filter by category
 * @param {boolean} options.recommended - Filter recommended books
 * @param {string} options.search - Search in title, author, or description
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @param {string} options.sortBy - Sort field
 * @param {string} options.sortOrder - Sort order (asc/desc)
 * @returns {Promise<Object>} Books data with pagination
 */
export async function getAllBooks(options = {}) {
  const params = new URLSearchParams()
  
  if (options.category) params.append('category', options.category)
  if (options.recommended !== undefined) params.append('recommended', options.recommended)
  if (options.search) params.append('search', options.search)
  if (options.page) params.append('page', options.page)
  if (options.limit) params.append('limit', options.limit)
  if (options.sortBy) params.append('sortBy', options.sortBy)
  if (options.sortOrder) params.append('sortOrder', options.sortOrder)

  const queryString = params.toString()
  const url = `${API_URL}/books${queryString ? `?${queryString}` : ''}`

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include', // Include cookies for authentication
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to fetch books')
  }

  return data
}

/**
 * Get book by ID
 * @param {string} bookId - Book ID
 * @returns {Promise<Object>} Book data
 */
export async function getBookById(bookId) {
  // Get access token from localStorage (if available)
  const token = localStorage.getItem('accessToken')
  
  // Build headers object
  const headers = {}
  
  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}/books/${bookId}`, {
    method: 'GET',
    headers,
    credentials: 'include', // Include cookies for authentication
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to fetch book')
  }

  return data
}

