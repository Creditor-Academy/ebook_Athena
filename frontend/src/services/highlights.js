const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

/**
 * Get auth headers with token
 */
function getAuthHeaders() {
  const token = localStorage.getItem('accessToken')
  const headers = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

/**
 * Add a highlight
 * @param {Object} highlightData - Highlight data
 * @param {string} highlightData.bookId - Book ID
 * @param {string} highlightData.selectedText - Selected text
 * @param {string} highlightData.color - Color (yellow, green, blue, pink, orange, purple)
 * @param {number} highlightData.pageNumber - Page number (optional)
 * @param {string} highlightData.chapter - Chapter name (optional)
 * @param {string} highlightData.cfi - CFI string (optional)
 * @param {number} highlightData.position - Position 0.0-1.0 (optional)
 * @param {string} highlightData.note - Note (optional)
 * @returns {Promise<Object>} Created highlight
 */
export async function addHighlight(highlightData) {
  const response = await fetch(`${API_URL}/highlights`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(highlightData),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to add highlight')
  }

  return data
}

/**
 * Get highlights for a book
 * @param {string} bookId - Book ID
 * @param {string} color - Filter by color (optional)
 * @returns {Promise<Object>} Highlights data
 */
export async function getBookHighlights(bookId, color = null) {
  const params = new URLSearchParams()
  if (color) params.append('color', color)

  const queryString = params.toString()
  const url = `${API_URL}/highlights/book/${bookId}${queryString ? `?${queryString}` : ''}`

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to fetch highlights')
  }

  return data
}

/**
 * Get all highlights for the user
 * @param {Object} options - Query options
 * @param {string} options.bookId - Filter by book ID (optional)
 * @param {string} options.color - Filter by color (optional)
 * @param {number} options.page - Page number (optional)
 * @param {number} options.limit - Items per page (optional)
 * @returns {Promise<Object>} Highlights data with pagination
 */
export async function getAllHighlights(options = {}) {
  const params = new URLSearchParams()
  if (options.bookId) params.append('bookId', options.bookId)
  if (options.color) params.append('color', options.color)
  if (options.page) params.append('page', options.page)
  if (options.limit) params.append('limit', options.limit)

  const queryString = params.toString()
  const url = `${API_URL}/highlights${queryString ? `?${queryString}` : ''}`

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to fetch highlights')
  }

  return data
}

/**
 * Update a highlight
 * @param {string} highlightId - Highlight ID
 * @param {Object} updates - Update data
 * @param {string} updates.color - New color (optional)
 * @param {string} updates.note - New note (optional)
 * @returns {Promise<Object>} Updated highlight
 */
export async function updateHighlight(highlightId, updates) {
  const response = await fetch(`${API_URL}/highlights/${highlightId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(updates),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to update highlight')
  }

  return data
}

/**
 * Delete a highlight
 * @param {string} highlightId - Highlight ID
 * @returns {Promise<Object>} Success message
 */
export async function deleteHighlight(highlightId) {
  const response = await fetch(`${API_URL}/highlights/${highlightId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to delete highlight')
  }

  return data
}

/**
 * Get highlight count for a book
 * @param {string} bookId - Book ID
 * @param {string} color - Filter by color (optional)
 * @returns {Promise<Object>} Count data
 */
export async function getHighlightCount(bookId, color = null) {
  const params = new URLSearchParams()
  if (color) params.append('color', color)

  const queryString = params.toString()
  const url = `${API_URL}/highlights/count/${bookId}${queryString ? `?${queryString}` : ''}`

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to get highlight count')
  }

  return data
}
