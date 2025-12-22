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
  console.log('[getAllBooks] Starting API call with options:', options)
  
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
  
  console.log('🌐 [getAllBooks] API URL:', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include', // Include cookies for authentication
    })

    console.log('📥 [getAllBooks] Response status:', response.status)
    console.log('📥 [getAllBooks] Response ok:', response.ok)

    const data = await response.json()
    console.log('📦 [getAllBooks] Response data:', data)
    console.log('📚 [getAllBooks] Books in response:', data.books?.length || 0)

    if (!response.ok) {
      console.error('❌ [getAllBooks] API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: data.error,
        message: data.error?.message,
      })
      throw new Error(data.error?.message || 'Failed to fetch books')
    }

    console.log('✅ [getAllBooks] Success! Returning data with', data.books?.length || 0, 'books')
    return data
  } catch (error) {
    console.error('❌ [getAllBooks] Fetch error:', error)
    console.error('❌ [getAllBooks] Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    })
    throw error
  }
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

/**
 * Get books uploaded by the authenticated author
 * @param {Object} options - Query parameters
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @param {string} options.sortBy - Sort field
 * @param {string} options.sortOrder - Sort order (asc/desc)
 * @param {string} options.search - Search in title, author, or description
 * @param {string} options.category - Filter by category
 * @param {boolean} options.isActive - Filter by active status
 * @returns {Promise<Object>} Books data with pagination
 */
export async function getMyUploadedBooks(options = {}) {
  console.log('📡 [getMyUploadedBooks] Starting API call with options:', options)
  
  // Get access token from localStorage (if available)
  const token = localStorage.getItem('accessToken')
  console.log('🔑 [getMyUploadedBooks] Token exists:', !!token)
  console.log('🔑 [getMyUploadedBooks] Token preview:', token ? `${token.substring(0, 20)}...` : 'none')
  
  // Build headers object
  const headers = {}
  
  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`
    console.log('✅ [getMyUploadedBooks] Authorization header added')
  } else {
    console.warn('⚠️ [getMyUploadedBooks] No token found in localStorage')
  }

  const params = new URLSearchParams()
  
  if (options.page) params.append('page', options.page)
  if (options.limit) params.append('limit', options.limit)
  if (options.sortBy) params.append('sortBy', options.sortBy)
  if (options.sortOrder) params.append('sortOrder', options.sortOrder)
  if (options.search) params.append('search', options.search)
  if (options.category) params.append('category', options.category)
  if (options.isActive !== undefined) params.append('isActive', options.isActive)

  const queryString = params.toString()
  const url = `${API_URL}/books/my-uploaded${queryString ? `?${queryString}` : ''}`
  
  console.log('🌐 [getMyUploadedBooks] API URL:', url)
  console.log('📤 [getMyUploadedBooks] Request headers:', headers)
  console.log('📤 [getMyUploadedBooks] Request options:', {
    method: 'GET',
    credentials: 'include',
  })

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      credentials: 'include', // Include cookies for authentication
    })

    console.log('📥 [getMyUploadedBooks] Response status:', response.status)
    console.log('📥 [getMyUploadedBooks] Response ok:', response.ok)
    console.log('📥 [getMyUploadedBooks] Response headers:', Object.fromEntries(response.headers.entries()))

    const data = await response.json()
    console.log('📦 [getMyUploadedBooks] Response data:', data)
    console.log('📚 [getMyUploadedBooks] Books in response:', data.books?.length || 0)

    if (!response.ok) {
      console.error('❌ [getMyUploadedBooks] API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: data.error,
        message: data.error?.message,
      })
      throw new Error(data.error?.message || 'Failed to fetch uploaded books')
    }

    console.log('✅ [getMyUploadedBooks] Success! Returning data with', data.books?.length || 0, 'books')
    return data
  } catch (error) {
    console.error('❌ [getMyUploadedBooks] Fetch error:', error)
    console.error('❌ [getMyUploadedBooks] Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    })
    throw error
  }
}

