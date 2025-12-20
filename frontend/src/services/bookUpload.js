const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

/**
 * Upload a book with EPUB file and optional cover image
 * @param {FormData} formData - FormData containing book details and files
 * @returns {Promise<Object>} The uploaded book data
 */
export async function uploadBook(formData) {
  // Get access token from localStorage (if available)
  // Backend also uses HTTP-only cookies, so credentials: 'include' will handle auth
  const token = localStorage.getItem('accessToken')
  
  // Build headers object
  const headers = {}
  
  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  // Don't set Content-Type header - browser will set it with boundary for FormData

  const response = await fetch(`${API_URL}/books/upload`, {
    method: 'POST',
    headers,
    credentials: 'include', // Include cookies for authentication (primary auth method)
    body: formData,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to upload book')
  }

  return data
}

/**
 * Create a book with S3 URLs (for manual book creation)
 * @param {Object} bookData - Book information
 * @returns {Promise<Object>} The created book data
 */
export async function createBook(bookData) {
  // Get access token from localStorage (if available)
  // Backend also uses HTTP-only cookies, so credentials: 'include' will handle auth
  const token = localStorage.getItem('accessToken')
  
  // Build headers object
  const headers = {
    'Content-Type': 'application/json',
  }
  
  // Add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}/books`, {
    method: 'POST',
    headers,
    credentials: 'include', // Include cookies for authentication (primary auth method)
    body: JSON.stringify(bookData),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to create book')
  }

  return data
}

