const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

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
 * Add a bookmark (reading position / selection)
 * Mirrors backend /api/bookmarks POST
 */
export async function addBookmark(bookmarkData) {
  const response = await fetch(`${API_URL}/bookmarks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify(bookmarkData),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to add bookmark')
  }

  return data
}

/**
 * Get bookmarks for a specific book
 * GET /api/bookmarks/book/:bookId
 */
export async function getBookBookmarks(bookId) {
  const response = await fetch(`${API_URL}/bookmarks/book/${bookId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to fetch bookmarks')
  }

  return data
}

/**
 * Get last reading position for a book
 * GET /api/bookmarks/last-position/:bookId
 */
export async function getLastReadingPosition(bookId) {
  const response = await fetch(`${API_URL}/bookmarks/last-position/${bookId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    credentials: 'include',
  })

  const data = await response.json()

  if (!response.ok) {
    // 404 just means no bookmark yet – surface as null to caller
    if (response.status === 404) {
      return null
    }
    throw new Error(data.error?.message || 'Failed to get last reading position')
  }

  return data
}

/**
 * Delete a bookmark
 * DELETE /api/bookmarks/:bookmarkId
 */
export async function deleteBookmark(bookmarkId) {
  const response = await fetch(`${API_URL}/bookmarks/${bookmarkId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to delete bookmark')
  }

  return data
}



